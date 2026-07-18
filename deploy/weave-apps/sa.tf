resource "google_service_account" "be" {
  for_each = var.be_configs

  account_id   = "${var.env}-${each.key}"
  display_name = "${each.key} service account (${var.env})"
}

resource "google_project_iam_member" "be_additional" {
  for_each = local.additional_roles

  project = var.project_id
  role    = each.value.role
  member  = "serviceAccount:${google_service_account.be[each.value.service].email}"
}
