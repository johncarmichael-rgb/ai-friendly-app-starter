terraform {
  required_version = "~> 1.14"

  backend "gcs" {
    bucket                      = "cera-management--tf-states"
    impersonate_service_account = "sa-terraform@cera-management.iam.gserviceaccount.com"
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.29.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 7.29.0"
    }
  }
}
