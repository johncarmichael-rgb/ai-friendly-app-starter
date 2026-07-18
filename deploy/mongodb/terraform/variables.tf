# MongoDB Atlas Configuration
variable "mongodb_atlas_public_key" {
  type        = string
  description = "MongoDB Atlas API public key"
  sensitive   = true
}

variable "mongodb_atlas_private_key" {
  type        = string
  description = "MongoDB Atlas API private key"
  sensitive   = true
}

variable "mongodb_atlas_org_id" {
  type        = string
  description = "MongoDB Atlas organization ID"
}

# GCP Configuration
variable "gcp_project_id" {
  type        = string
  description = "GCP project ID where Secret Manager secret will be stored"
}

variable "weave_apps_project_id" {
  type        = string
  description = "GCP project ID (cera-{env}-weave-apps) where the same Mongo secrets are mirrored"
}

variable "gcp_region" {
  type        = string
  description = "GCP region for resources"
  default     = "europe-west2"
}

# Environment Configuration
variable "env" {
  type        = string
  description = "Environment name (dev, qa, prod)"
  validation {
    condition     = contains(["dev", "qa", "prod"], var.env)
    error_message = "Environment must be one of: dev, qa, prod"
  }
}

variable "project_name" {
  type        = string
  description = "Project name used for MongoDB Atlas project naming"
  default     = "weave"
}

# MongoDB Cluster Configuration
variable "cluster_tier" {
  type        = string
  description = "MongoDB Atlas cluster tier (e.g., M0, M10, M20, M30)"
  default     = "M0"
}

variable "mongodb_version" {
  type        = string
  description = "MongoDB version"
  default     = "8.0"
}

variable "mongodb_region" {
  type        = string
  description = "MongoDB Atlas region (e.g., EUROPE_WEST_2 for London)"
  default     = "EUROPE_WEST_2"
}

variable "cloud_provider" {
  type        = string
  description = "Cloud provider for MongoDB Atlas cluster (GCP, AWS, AZURE)"
  default     = "GCP"
}

variable "api_mono_database_name" {
  type        = string
  description = "Database name for api-mono service"
  default     = "api-mono"
}

# IP Access List Configuration
variable "ip_access_list" {
  type = list(object({
    cidr_block = string
    comment    = string
  }))
  description = "List of IP CIDR blocks allowed to access MongoDB cluster"
  default     = []
}

# Repository name for tagging
variable "repo_name" {
  type        = string
  description = "Repository name for resource tagging"
}
