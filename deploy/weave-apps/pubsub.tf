# Flatten publisher / subscriber bindings (service-key per topic/sub).
locals {
  topic_publishers = merge([
    for topic_name, topic in var.events_configs_producer : {
      for svc_key in topic.publishers :
      "${topic_name}:${svc_key}" => { topic = topic_name, service = svc_key }
    }
  ]...)

  subscription_subscribers = merge([
    for sub_name, sub in var.events_configs_consumer : {
      for svc_key in sub.subscribers :
      "${sub_name}:${svc_key}" => { subscription = sub_name, service = svc_key }
    }
  ]...)
}

resource "google_pubsub_topic" "events" {
  for_each = var.events_configs_producer

  name                       = each.key
  message_retention_duration = each.value.retention
}

resource "google_pubsub_subscription" "events" {
  for_each = var.events_configs_consumer

  name  = each.key
  topic = google_pubsub_topic.events[each.value.topic].id

  ack_deadline_seconds       = each.value.ack_deadline_seconds
  message_retention_duration = each.value.message_retention_duration

  expiration_policy {
    ttl = "" # never expire
  }
}

resource "google_pubsub_topic_iam_member" "publishers" {
  for_each = local.topic_publishers

  topic  = google_pubsub_topic.events[each.value.topic].id
  role   = "roles/pubsub.publisher"
  member = "serviceAccount:${google_service_account.be[each.value.service].email}"
}

resource "google_pubsub_subscription_iam_member" "subscribers" {
  for_each = local.subscription_subscribers

  subscription = google_pubsub_subscription.events[each.value.subscription].id
  role         = "roles/pubsub.subscriber"
  member       = "serviceAccount:${google_service_account.be[each.value.service].email}"
}
