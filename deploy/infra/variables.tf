variable "project_id" {
  description = "GCP project ID (e.g. cera-dev-weave-apps)"
  type        = string
}

variable "shared_project_id" {
  description = "GCP shared project ID hosting Cloud DNS (e.g. cera-dev-shared)"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "europe-west2"
}

variable "env" {
  description = "Environment"
  type        = string

  validation {
    condition     = contains(["dev", "qa", "prod"], var.env)
    error_message = "env must be one of: dev, qa, prod"
  }
}

variable "app" {
  description = "App name prefix for resources (e.g. weave-apps)"
  type        = string
}

variable "repo_name" {
  description = "Repository name. Supplied via pipeline. Used as the `repo` standard label on every resource."
  type        = string
}

variable "subdomain" {
  description = "Hostname subdomain (e.g. app -> app.dev.weave-apps.com)."
  type        = string
}

variable "default_backend_service" {
  description = "Name of a backend service in var.project_id to use as the URL map default. When empty, the 404 fallback bucket is used."
  type        = string
  default     = ""
}

variable "routes" {
  description = "Path-based routes. Each route matches one or more path prefixes and forwards to a backend service in var.project_id."
  type = list(object({
    paths                = list(string)
    backend_service_name = string
  }))
  default = []
}

variable "default_redirect_path" {
  description = "Path to redirect unmatched requests to within the main path_matcher (e.g. /auth/login)."
  type        = string
  default     = "/"
}

variable "shared_secrets" {
  description = "Shared secret short names. Created as shells (no version) with id {env}-{app}-{short}. Consumer services grant their own IAM in deploy/api-v2."
  type        = list(string)
  default     = []
}
