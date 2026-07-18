# Default backend for the URL map when no app BE is provided or no host_rule
# matches. Serves a static 404 page so the LB stands alone without app services.

resource "google_storage_bucket" "default" {
  name                        = "${local.lb_name_prefix}-default-be"
  location                    = "EU"
  uniform_bucket_level_access = true
  public_access_prevention    = "inherited"
  force_destroy               = var.env != "prod"

  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
}

resource "google_storage_bucket_iam_member" "default_public" {
  bucket = google_storage_bucket.default.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

resource "google_storage_bucket_object" "default_404" {
  name         = "404.html"
  bucket       = google_storage_bucket.default.name
  content      = file("${path.module}/assets/404.html")
  content_type = "text/html"
}

resource "google_compute_backend_bucket" "default" {
  name        = "${local.lb_name_prefix}-default-be"
  bucket_name = google_storage_bucket.default.name
  enable_cdn  = false
}
