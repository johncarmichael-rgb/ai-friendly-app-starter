resource "google_cloud_run_v2_service" "be" {
  for_each = var.be_configs

  name                = "${var.env}-${each.key}"
  location            = var.region
  deletion_protection = each.value.deletion_protection
  ingress             = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"

  template {
    service_account                  = google_service_account.be[each.key].email
    timeout                          = "${each.value.request_timeout}s"
    max_instance_request_concurrency = each.value.container_concurrency

    scaling {
      min_instance_count = each.value.min_instance_count
      max_instance_count = each.value.max_instance_count
    }

    vpc_access {
      connector = data.google_vpc_access_connector.shared.self_link
      egress    = each.value.egress_all_traffic ? "ALL_TRAFFIC" : "PRIVATE_RANGES_ONLY"
    }

    containers {
      image = each.value.image_override != "" ? each.value.image_override : "${var.region}-docker.pkg.dev/${var.shared_project_id}/cera/${var.env}_${each.key}:${each.value.version}"

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = each.value.cpu
          memory = each.value.memory
        }
      }

      startup_probe {
        initial_delay_seconds = each.value.startup_delay
        period_seconds        = each.value.startup_period
        timeout_seconds       = each.value.startup_timeout
        failure_threshold     = each.value.startup_failures

        # HTTP readiness probe when startup_probe_path is set (gates traffic on
        # app readiness, e.g. the api's /readyz returns 200 only once Mongo is
        # connected); otherwise a plain TCP check that the port is open.
        dynamic "tcp_socket" {
          for_each = each.value.startup_probe_path == "" ? [1] : []
          content {
            port = 8080
          }
        }

        dynamic "http_get" {
          for_each = each.value.startup_probe_path == "" ? [] : [1]
          content {
            path = each.value.startup_probe_path
            port = 8080
          }
        }
      }

      dynamic "env" {
        # Merge any computed per-service env (local.api_extra_env) over the
        # static tfvars env_vars. Services without an entry get an empty merge.
        for_each = merge(each.value.env_vars, lookup(local.api_extra_env, each.key, {}))
        content {
          name  = env.key
          value = env.value
        }
      }

      dynamic "env" {
        for_each = each.value.secret_env_vars
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = env.value
              version = "latest"
            }
          }
        }
      }
    }
  }

  depends_on = [
    google_project_iam_member.serverless_user,
    google_artifact_registry_repository_iam_member.shared,
    google_secret_manager_secret_iam_member.be_secret_accessor,
  ]
}

# Public invoker — required so the LB can reach Cloud Run.
# The run.app URL stays unreachable because ingress = INTERNAL_LOAD_BALANCER
# (network-level gate); IAM only governs invocation auth (which the LB now passes).
# v2 backend services have no IAP block; auth is enforced at the app layer
# (IAP_ENABLED=false in env_vars; auth is handled by WorkOS AuthKit at the app layer).
resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
  for_each = var.be_configs

  project  = google_cloud_run_v2_service.be[each.key].project
  location = google_cloud_run_v2_service.be[each.key].location
  name     = google_cloud_run_v2_service.be[each.key].name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
