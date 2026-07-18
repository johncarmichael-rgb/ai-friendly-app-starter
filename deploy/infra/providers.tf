provider "google" {
  project = var.project_id
  region  = var.region

  impersonate_service_account = "sa-terraform@${var.project_id}.iam.gserviceaccount.com"
  default_labels              = local.standard_tags
}

provider "google-beta" {
  project = var.project_id
  region  = var.region

  impersonate_service_account = "sa-terraform@${var.project_id}.iam.gserviceaccount.com"
  default_labels              = local.standard_tags
}

provider "google" {
  alias   = "shared"
  project = var.shared_project_id
  region  = var.region

  impersonate_service_account = "sa-terraform@${var.shared_project_id}.iam.gserviceaccount.com"
  default_labels              = local.standard_tags
}
