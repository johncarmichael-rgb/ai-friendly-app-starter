# Per-secret accessor bindings — least-privilege, mirrors foundation-envs.
# Each service SA only gets access to the secrets it references via secret_env_vars.
locals {
  secret_grants = merge([
    for svc_key, svc in var.be_configs : {
      for secret_id in toset(values(svc.secret_env_vars)) :
      "${svc_key}:${secret_id}" => { service = svc_key, secret_id = secret_id }
    }
  ]...)
}

resource "google_secret_manager_secret_iam_member" "be_secret_accessor" {
  for_each = local.secret_grants

  secret_id = each.value.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.be[each.value.service].email}"
}
