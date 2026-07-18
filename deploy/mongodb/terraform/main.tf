# Local values
locals {
  is_shared_tier = contains(["M0", "M2", "M5"], var.cluster_tier)
  # Extract hostname from connection string (remove mongodb+srv:// prefix)
  mongodb_host = replace(mongodbatlas_cluster.cluster.connection_strings[0].standard_srv, "mongodb+srv://", "")

  standard_tags = {
    managedby = "terraform"
    repo      = var.repo_name
    env       = var.env
  }

  api_mono_credentials = {
    "api-mono-user"     = mongodbatlas_database_user.api_mono_user.username
    "api-mono-password" = mongodbatlas_database_user.api_mono_user.password
  }
}

# MongoDB Atlas Project
resource "mongodbatlas_project" "project" {
  name   = "${var.env}-${var.project_name}"
  org_id = var.mongodb_atlas_org_id
}

# MongoDB Atlas Cluster
resource "mongodbatlas_cluster" "cluster" {
  project_id = mongodbatlas_project.project.id
  name       = var.env

  # Provider Settings
  # M0/M2/M5 require TENANT, M10+ use actual cloud provider
  provider_name               = local.is_shared_tier ? "TENANT" : var.cloud_provider
  provider_region_name        = var.mongodb_region
  provider_instance_size_name = var.cluster_tier
  # backing_provider_name only for TENANT tiers
  backing_provider_name = local.is_shared_tier ? var.cloud_provider : null

  # MongoDB Version
  mongo_db_major_version = var.mongodb_version

  # Auto-scaling (only for M10+)
  auto_scaling_disk_gb_enabled = var.cluster_tier != "M0"

  # Backup (only for M10+)
  cloud_backup = var.cluster_tier != "M0"

  # Tags (only for M10+ dedicated clusters, M0/M2/M5 shared clusters do not support tags)
  dynamic "tags" {
    for_each = local.is_shared_tier ? {} : local.standard_tags
    content {
      key   = tags.key
      value = tags.value
    }
  }
}

# Random password for api-mono database user
resource "random_password" "api_mono_db_password" {
  length           = 32
  special          = true
  override_special = "-_"
}

# MongoDB Database User for api-mono service
resource "mongodbatlas_database_user" "api_mono_user" {
  username           = "api-mono-user"
  password           = random_password.api_mono_db_password.result
  project_id         = mongodbatlas_project.project.id
  auth_database_name = "admin"

  roles {
    role_name     = "readWrite"
    database_name = var.api_mono_database_name
  }

  scopes {
    name = mongodbatlas_cluster.cluster.name
    type = "CLUSTER"
  }
}

# IP Access List (Allow specific IPs to access cluster)
resource "mongodbatlas_project_ip_access_list" "access_list" {
  for_each = { for ip in var.ip_access_list : ip.cidr_block => ip }

  project_id = mongodbatlas_project.project.id
  cidr_block = each.value.cidr_block
  comment    = each.value.comment
}

# GCP Secret Manager - Cluster-level MongoDB Host (shared across all services)
resource "google_secret_manager_secret" "mongodb_host_weave_apps" {
  provider = google.weave_apps

  secret_id = "${var.env}-mongo-host"
  project   = var.weave_apps_project_id

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "mongodb_host_weave_apps" {
  provider = google.weave_apps

  secret      = google_secret_manager_secret.mongodb_host_weave_apps.id
  secret_data = local.mongodb_host
}

# GCP Secret Manager - API Mono Service-specific Credentials
resource "google_secret_manager_secret" "api_mono_mongodb_weave_apps" {
  for_each = local.api_mono_credentials
  provider = google.weave_apps

  secret_id = "${var.env}-mongo-${each.key}"
  project   = var.weave_apps_project_id

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "api_mono_mongodb_weave_apps" {
  for_each = local.api_mono_credentials
  provider = google.weave_apps

  secret      = google_secret_manager_secret.api_mono_mongodb_weave_apps[each.key].id
  secret_data = each.value
}
