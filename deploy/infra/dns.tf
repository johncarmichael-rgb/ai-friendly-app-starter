data "google_dns_managed_zone" "shared" {
  provider = google.shared
  name     = local.dns_zone
}

resource "google_dns_record_set" "lb_a" {
  provider     = google.shared
  name         = "${local.host_name}."
  type         = "A"
  ttl          = 60
  managed_zone = data.google_dns_managed_zone.shared.name
  rrdatas      = [google_compute_global_address.lb.address]
}

resource "google_dns_record_set" "dnsauth" {
  provider     = google.shared
  name         = google_certificate_manager_dns_authorization.lb.dns_resource_record[0].name
  type         = google_certificate_manager_dns_authorization.lb.dns_resource_record[0].type
  ttl          = 300
  managed_zone = data.google_dns_managed_zone.shared.name
  rrdatas      = [google_certificate_manager_dns_authorization.lb.dns_resource_record[0].data]
}
