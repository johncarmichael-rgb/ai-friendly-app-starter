# Flatten allowed_members: { "bucket:service:role" => { bucket, service, role } }
locals {
  bucket_members = merge([
    for bucket_key, bucket in var.gcs_configs : {
      for binding in bucket.allowed_members :
      "${bucket_key}:${binding.member}:${binding.role}" => {
        bucket  = bucket_key
        service = binding.member
        role    = binding.role
      }
    }
  ]...)
}

resource "google_storage_bucket" "buckets" {
  for_each = var.gcs_configs

  name                        = "${var.env}-${each.key}"
  location                    = each.value.location
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"
  force_destroy               = var.env != "prod"

  # Age-based garbage collection when retention_days is set.
  dynamic "lifecycle_rule" {
    for_each = each.value.retention_days == null ? [] : [each.value.retention_days]
    content {
      action {
        type = "Delete"
      }
      condition {
        age = lifecycle_rule.value
      }
    }
  }
}

resource "google_storage_bucket_iam_member" "members" {
  for_each = local.bucket_members

  bucket = google_storage_bucket.buckets[each.value.bucket].name
  role   = each.value.role
  member = "serviceAccount:${google_service_account.be[each.value.service].email}"
}
