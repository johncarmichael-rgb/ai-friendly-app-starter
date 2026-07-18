resource "google_compute_global_address" "lb" {
  name = local.lb_name_prefix
}

resource "google_certificate_manager_dns_authorization" "lb" {
  name   = "${local.cert_name_prefix}-dnsauth"
  domain = local.base_domain_name
  type   = "PER_PROJECT_RECORD"
}

resource "google_certificate_manager_certificate" "lb" {
  name = "${local.cert_name_prefix}-cert"

  managed {
    domains = [
      "*.${local.base_domain_name}",
      local.base_domain_name,
    ]
    dns_authorizations = [google_certificate_manager_dns_authorization.lb.id]
  }

  depends_on = [google_dns_record_set.dnsauth]
}

resource "google_certificate_manager_certificate_map" "lb" {
  name = "${local.lb_name_prefix}-cm"
}

resource "google_certificate_manager_certificate_map_entry" "lb" {
  name         = "${local.lb_name_prefix}-cm-entry"
  map          = google_certificate_manager_certificate_map.lb.name
  certificates = [google_certificate_manager_certificate.lb.id]
  hostname     = local.host_name
}

resource "google_compute_url_map" "lb" {
  name            = local.lb_name_prefix
  default_service = local.default_backend_id

  dynamic "host_rule" {
    for_each = length(var.routes) > 0 ? [1] : []
    content {
      hosts        = [local.host_name]
      path_matcher = "main"
    }
  }

  dynamic "path_matcher" {
    for_each = length(var.routes) > 0 ? [1] : []
    content {
      name = "main"

      default_url_redirect {
        https_redirect         = false
        path_redirect          = var.default_redirect_path
        redirect_response_code = "FOUND"
        strip_query            = false
      }

      dynamic "path_rule" {
        for_each = var.routes
        content {
          paths   = path_rule.value.paths
          service = "projects/${var.project_id}/global/backendServices/${path_rule.value.backend_service_name}"
        }
      }
    }
  }
}

resource "google_compute_target_https_proxy" "lb" {
  name            = local.lb_name_prefix
  url_map         = google_compute_url_map.lb.id
  certificate_map = "//certificatemanager.googleapis.com/${google_certificate_manager_certificate_map.lb.id}"
}

resource "google_compute_global_forwarding_rule" "lb" {
  name                  = local.lb_name_prefix
  load_balancing_scheme = "EXTERNAL_MANAGED"
  ip_protocol           = "TCP"
  port_range            = 443
  ip_address            = google_compute_global_address.lb.id
  target                = google_compute_target_https_proxy.lb.id
}
