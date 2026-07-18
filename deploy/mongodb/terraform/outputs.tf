output "mongodb_project_name" {
  description = "MongoDB Atlas project name"
  value       = mongodbatlas_project.project.name
}

output "mongodb_cluster_name" {
  description = "MongoDB Atlas cluster name"
  value       = mongodbatlas_cluster.cluster.name
}

output "mongodb_cluster_state" {
  description = "Current state of the MongoDB cluster"
  value       = mongodbatlas_cluster.cluster.state_name
}

output "gcp_secret_host" {
  description = "GCP Secret Manager secret name for MongoDB host"
  value       = google_secret_manager_secret.mongodb_host_weave_apps.secret_id
}
