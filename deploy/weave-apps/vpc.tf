data "google_project" "environment" {}

# Reuse the foundation-managed serverless connector (cera-{env}-shared/srvls-subnet-3)
data "google_vpc_access_connector" "shared" {
  provider = google.shared
  name     = "${var.env}-srvls-subnet-3"
  region   = var.region
}

# vpcaccess.user binding for the project's serverless robot SA on the shared VPC
# host project. Same iam_member is also held by foundation-envs (v1 stack);
# iam_member is idempotent so co-ownership is fine. Destroying this stack
# removes the binding for both — re-run the v1 (foundation-envs) workflow to
# re-create. Existing Cloud Run revisions keep working; only new deploys break
# during the gap.
resource "google_project_iam_member" "serverless_user" {
  provider = google.shared
  project  = var.shared_project_id
  role     = "roles/vpcaccess.user"
  member   = "serviceAccount:service-${data.google_project.environment.number}@serverless-robot-prod.iam.gserviceaccount.com"
}
