# Environment
env = "prod"

# GCP Configuration
gcp_project_id        = "cera-prod-weave"
weave_apps_project_id = "cera-prod-weave-apps"
gcp_region            = "europe-west2"

# MongoDB Configuration
mongodb_atlas_org_id = "68f225f27843783f86795be7"

# Project Configuration
project_name           = "weave"
api_mono_database_name = "api-mono"

# MongoDB Cluster Configuration
cluster_tier    = "M20"
mongodb_version = "8.0"
mongodb_region  = "EUROPE_WEST_2"
cloud_provider  = "GCP"

# IP Access List
ip_access_list = [
  {
    cidr_block = "34.147.203.163/32"
    comment    = "Prod Cloud NAT IP"
  }
]
