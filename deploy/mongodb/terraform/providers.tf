provider "mongodbatlas" {
  public_key  = var.mongodb_atlas_public_key
  private_key = var.mongodb_atlas_private_key
}

provider "google" {
  project                     = var.gcp_project_id
  region                      = var.gcp_region
  impersonate_service_account = "sa-terraform@${var.gcp_project_id}.iam.gserviceaccount.com"

  default_labels = local.standard_tags
}

provider "google" {
  alias                       = "weave_apps"
  project                     = var.weave_apps_project_id
  region                      = var.gcp_region
  impersonate_service_account = "sa-terraform@${var.weave_apps_project_id}.iam.gserviceaccount.com"

  default_labels = local.standard_tags
}
