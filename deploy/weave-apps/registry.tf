# Cross-project Artifact Registry read access for the Cloud Run service agent.
# Images live in cera-{env}-shared/cera/* but Cloud Run runs in cera-{env}-weave-apps.
# Without this, `terraform apply` of google_cloud_run_v2_service fails with
# 403 artifactregistry.repositories.downloadArtifacts denied.
# Mirrors gcp-foundation-envs/registry.tf — repository-scoped IAM, distinct
# member per project (no co-ownership conflict with v1's own grant).
data "google_artifact_registry_repository" "shared" {
  provider      = google.shared
  location      = var.region
  repository_id = "cera"
}

resource "google_artifact_registry_repository_iam_member" "shared" {
  provider = google.shared

  project    = data.google_artifact_registry_repository.shared.project
  location   = data.google_artifact_registry_repository.shared.location
  repository = data.google_artifact_registry_repository.shared.name
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:service-${data.google_project.environment.number}@serverless-robot-prod.iam.gserviceaccount.com"
}
