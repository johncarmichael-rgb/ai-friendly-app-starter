locals {
  standard_tags = {
    managedby = "terraform"
    repo      = var.repo_name
    env       = var.env
  }

  # Per-service env vars computed from other resources (not knowable in tfvars),
  # merged into the matching container in main.tf. Empty by default — add an
  # entry keyed by be_configs service key when a service needs computed env.
  api_extra_env = {}

  # Flatten additional_roles for project-level IAM bindings:
  # { "api:roles/aiplatform.user" = { service = "api", role = "roles/aiplatform.user" }, ... }
  additional_roles = merge([
    for svc_key, svc in var.be_configs : {
      for role in svc.additional_roles :
      "${svc_key}:${role}" => { service = svc_key, role = role }
    }
  ]...)
}
