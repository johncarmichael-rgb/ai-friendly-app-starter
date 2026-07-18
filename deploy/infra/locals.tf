locals {
  standard_tags = {
    managedby = "terraform"
    repo      = var.repo_name
    env       = var.env
  }

  domain_names = {
    dev  = "dev.weave-apps.com"
    qa   = "qa.weave-apps.com"
    prod = "weave-apps.com"
  }
  base_domain_name = local.domain_names[var.env]
  host_name        = "${var.subdomain}.${local.base_domain_name}"

  dns_zone_names = {
    dev  = "dev-weave-apps-com"
    qa   = "qa-weave-apps-com"
    prod = "weave-apps-com"
  }
  dns_zone = local.dns_zone_names[var.env]

  # Project-shared LB resources (LB, cert map, default BE bucket).
  lb_name_prefix = "${var.env}-${var.app}"

  # Domain-scoped wildcard cert.
  cert_name_prefix = "${var.env}-wildcard-${replace(local.base_domain_name, ".", "-")}"

  # Prefix for collision-prone resources (secrets, default bucket).
  name_prefix = "${var.env}-${var.app}"

  # URL map default: a named BE service if provided; else the 404 bucket.
  default_backend_id = var.default_backend_service != "" ? (
    "projects/${var.project_id}/global/backendServices/${var.default_backend_service}"
  ) : google_compute_backend_bucket.default.id
}
