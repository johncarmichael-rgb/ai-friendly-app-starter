resource "google_secret_manager_secret" "shared" {
  for_each = toset(var.shared_secrets)

  secret_id = "${local.name_prefix}-${each.value}"

  replication {
    auto {}
  }
}
