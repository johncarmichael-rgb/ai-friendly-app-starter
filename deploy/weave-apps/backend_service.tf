# NOTE: No iap{} block. v2 enforces auth at the app layer
# (IAP_ENABLED=false; auth is handled by WorkOS AuthKit at the app layer).
# NOTE: timeout_sec is not supported with Serverless NEGs — Cloud Run owns the
# request timeout via google_cloud_run_v2_service.template.timeout.
resource "google_compute_backend_service" "be" {
  for_each = var.be_configs
  provider = google-beta

  name                            = "${var.env}-${each.key}"
  enable_cdn                      = false
  timeout_sec                     = null
  connection_draining_timeout_sec = 10
  load_balancing_scheme           = "EXTERNAL_MANAGED"
  protocol                        = "HTTPS"
  security_policy                 = var.armor_enabled ? google_compute_security_policy.armor.id : null

  log_config {
    enable = true
  }

  backend {
    group = google_compute_region_network_endpoint_group.be[each.key].id
  }
}
