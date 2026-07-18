# Environment
env = "dev"

# GCP Configuration
gcp_project_id        = "cera-dev-weave"
weave_apps_project_id = "cera-dev-weave-apps"
gcp_region            = "europe-west2"

# MongoDB Configuration
mongodb_atlas_org_id = "68f225f27843783f86795be7"

# Project Configuration
project_name           = "weave"
api_mono_database_name = "api-mono"

# MongoDB Cluster Configuration
cluster_tier    = "M10"
mongodb_version = "8.0"
mongodb_region  = "EUROPE_WEST_2"
cloud_provider  = "GCP"

# IP Access List
ip_access_list = [
  {
    cidr_block = "34.89.67.197/32"
    comment    = "Dev Cloud NAT IP"
  }
]
