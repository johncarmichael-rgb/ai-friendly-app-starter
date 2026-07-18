terraform {
  required_version = ">= 1.10.0"

  backend "gcs" {
    bucket                      = "cera-management--tf-states"
    impersonate_service_account = "sa-terraform@cera-management.iam.gserviceaccount.com"
  }

  required_providers {
    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "~> 1.15.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 6.9.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6.0"
    }
  }
}
