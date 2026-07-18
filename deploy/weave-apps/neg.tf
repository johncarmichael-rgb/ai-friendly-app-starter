resource "google_compute_region_network_endpoint_group" "be" {
  for_each = var.be_configs

  name                  = "${var.env}-${each.key}-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region

  cloud_run {
    service = google_cloud_run_v2_service.be[each.key].name
  }
}
