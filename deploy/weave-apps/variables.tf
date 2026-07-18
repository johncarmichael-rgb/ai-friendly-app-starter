variable "project_id" {
  description = "GCP project ID (e.g. cera-dev-weave-apps)"
  type        = string
}

variable "shared_project_id" {
  description = "Shared VPC host project (e.g. cera-dev-shared)"
  type        = string
}

variable "region" {
  description = "GCP region for Cloud Run + NEG"
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
  description = "App name. Used only for labels. Resource names derive from be_configs/gcs_configs/events_configs keys directly, mirroring foundation-envs."
  type        = string
  default     = "weave-apps"
}

variable "repo_name" {
  description = "Repository name. Supplied via pipeline. Used as the `repo` standard label on every resource."
  type        = string
}

# Map of service configs, keyed by short name (api, socket).
# Mirrors weave's foundation-envs `be_configs` shape.
variable "be_configs" {
  description = "Map of service name => Cloud Run config"
  type = map(object({
    image_override        = optional(string, "")
    version               = optional(string, "latest")
    cpu                   = optional(string, "1")
    memory                = optional(string, "512Mi")
    min_instance_count    = optional(number, 1)
    max_instance_count    = optional(number, 10)
    container_concurrency = optional(number, null)
    request_timeout       = optional(number, 300)
    startup_delay         = optional(number, 0)
    startup_period        = optional(number, 10)
    startup_timeout       = optional(number, 1)
    startup_failures      = optional(number, 3)
    # When set, the startup probe is an HTTP GET against this path (used to gate
    # traffic on app readiness, e.g. "/readyz" once the DB is connected).
    # When "" (default) the probe is a plain TCP check that the port is open.
    startup_probe_path    = optional(string, "")
    egress_all_traffic    = optional(bool, true)
    deletion_protection   = optional(bool, false)
    additional_roles      = optional(list(string), [])
    env_vars              = optional(map(string), {})
    secret_env_vars       = optional(map(string), {})
  }))
}

# GCS buckets. Bucket name = "${env}-${key}" — set the key to e.g. "weave-apps-frontend" to get "dev-weave-apps-frontend".
variable "gcs_configs" {
  description = "Map of bucket short-name => bucket config"
  type = map(object({
    location = optional(string, "europe-west2")
    allowed_members = optional(list(object({
      member = string
      role   = string
    })), [])
    # When set, objects older than this many days are auto-deleted (garbage
    # collection).
    retention_days = optional(number, null)
  }))
  default = {}
}

# Pub/Sub topics. Map key is the full topic name (e.g. dev-weave-apps-ws-messages).
variable "events_configs_producer" {
  description = "Map of pubsub topic name => topic config (publishers list)"
  type = map(object({
    retention  = optional(string, "3600s")
    publishers = optional(list(string), [])
  }))
  default = {}
}

# Pub/Sub subscriptions. Map key is the full subscription name.
variable "events_configs_consumer" {
  description = "Map of subscription name => subscription config"
  type = map(object({
    topic                      = string
    ack_deadline_seconds       = optional(number, 10)
    message_retention_duration = optional(string, "600s")
    subscribers                = optional(list(string), [])
  }))
  default = {}
}

# Cloud Armor configuration
variable "armor_enabled" {
  description = "Attach the Cloud Armor security policy to backend services. Set false to roll back without destroying the policy."
  type        = bool
  default     = true
}

variable "armor_geo_block_enabled" {
  description = "Enable geo-blocking rules on the Cloud Armor policy."
  type        = bool
  default     = true
}

variable "armor_geo_block_countries" {
  description = "ISO 3166-1 alpha-2 country codes to block."
  type        = list(string)
  default = [
    "KP", # North Korea
    "IR", # Iran
    "SY", # Syria
    "CU", # Cuba
    "RU", # Russia
    "CN", # China
  ]

  validation {
    condition     = alltrue([for c in var.armor_geo_block_countries : length(c) == 2 && upper(c) == c])
    error_message = "Each country code must be a valid ISO 3166-1 alpha-2 uppercase code."
  }
}

variable "armor_rate_limit_count" {
  description = "Requests allowed per IP per interval before throttling."
  type        = number
  default     = 1500
}

variable "armor_rate_limit_interval_sec" {
  description = "Rate-limit window in seconds."
  type        = number
  default     = 60
}
