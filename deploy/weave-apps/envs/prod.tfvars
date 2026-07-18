project_id        = "cera-prod-weave-apps"
shared_project_id = "cera-prod-shared"
region            = "europe-west2"
env               = "prod"
app               = "weave-apps"

be_configs = {
  "weave-apps-api" = {
    cpu                   = "1"
    memory                = "4096Mi"
    container_concurrency = 80
    # The api opens its port immediately (listen-first) and connects Mongo in
    # the BACKGROUND. The startup probe is therefore a plain TCP check on the
    # port (startup_probe_path = ""): Cloud Run marks the pod started as soon as
    # it listens, and routes traffic to it while Mongoose buffers queries until
    # the connection establishes. Gating the probe on /readyz (DB-connected) was
    # too brittle — during a deploy the Mongo connect can exceed the probe
    # window and fail the whole revision; letting the new pods take traffic also
    # drains the old pods, freeing Atlas connections so the new ones connect.
    startup_delay      = 10
    startup_period     = 10
    startup_timeout    = 5
    startup_failures   = 6
    startup_probe_path = ""
    request_timeout    = 300
    egress_all_traffic = true

    # pubsub.editor is required because each pod creates an ephemeral
    # subscription on the pod-broadcast topic at boot (cross-pod cache
    # invalidation). Subscription create is a project-level permission.
    additional_roles = ["roles/pubsub.editor"]

    env_vars = {
      NODE_ENV            = "production"
      GCS_FRONTEND_BUCKET = "prod-weave-apps-frontend"
      GCS_BASE_URL        = "https://storage.googleapis.com"
      LOGGER_MODE         = "info"

      IAP_ENABLED           = "false"
      DOMAIN                = "https://app.weave-apps.com"
      FRONTEND_USER_APP_URL = "https://app.weave-apps.com"

      WORKOS_REDIRECT_URI   = "https://app.weave-apps.com/api/auth/callback"
      SESSION_COOKIE_DOMAIN = "app.weave-apps.com"

      GCP_PROJECT_ID = "cera-prod-weave-apps"

      # WebSocket Pub/Sub (publisher)
      SOCKET_PUBSUB_TOPIC = "prod-weave-apps-ws-messages"

      # Pod-to-pod broadcast (cross-pod cache invalidation today)
      POD_BROADCAST_TOPIC      = "prod-weave-apps-pod-broadcast"
      POD_BROADCAST_PROJECT_ID = "cera-prod-weave-apps"
    }

    secret_env_vars = {
      MONGO_HOST = "prod-mongo-host"
      MONGO_USER = "prod-mongo-api-mono-user"
      MONGO_PW   = "prod-mongo-api-mono-password"

      WORKOS_CLIENT_ID = "prod-weave-apps-workos-client-id"
      WORKOS_API_KEY   = "prod-weave-apps-workos-api-key"

      EMAIL_USERNAME = "prod-weave-apps-sendgrid-smtp-server-username"
      EMAIL_PASSWORD = "prod-weave-apps-sendgrid-smtp-server-password"
    }
  }

  "weave-apps-socket" = {
    cpu                   = "1"
    memory                = "2048Mi"
    min_instance_count    = 1
    max_instance_count    = 10
    container_concurrency = 1000
    request_timeout       = 3600
    egress_all_traffic    = true

    # pubsub.editor is required because each pod creates an ephemeral
    # subscription on the ws-messages topic at boot so PubSub fans every
    # message out to every pod (a shared subscription would load-balance
    # and clients connected to other pods would miss events).
    additional_roles = ["roles/pubsub.editor"]

    env_vars = {
      NODE_ENV       = "production"
      IAP_ENABLED    = "false"
      GCP_PROJECT_ID = "cera-prod-weave-apps"

      SOCKET_IO_PATH           = "/socket/socket-io"
      SOCKET_PUBSUB_TOPIC      = "prod-weave-apps-ws-messages"
      SOCKET_PUBSUB_PROJECT_ID = "cera-prod-weave-apps"
    }

    secret_env_vars = {
      MONGO_HOST = "prod-mongo-host"
      MONGO_USER = "prod-mongo-api-mono-user"
      MONGO_PW   = "prod-mongo-api-mono-password"
    }
  }
}

gcs_configs = {
  "weave-apps-frontend" = {
    location = "europe-west2"
    allowed_members = [
      { member = "weave-apps-api", role = "roles/storage.objectViewer" },
    ]
  }
}

events_configs_producer = {
  "prod-weave-apps-ws-messages" = {
    retention  = "3600s"
    publishers = ["weave-apps-api"]
  }
  "prod-weave-apps-pod-broadcast" = {
    # Short retention — subscribers are ephemeral and only care about live
    # messages; nothing replays history.
    retention  = "600s"
    publishers = ["weave-apps-api"]
  }
}

# No pre-provisioned subscriptions on prod-weave-apps-ws-messages — every
# api-sockets pod creates its own ephemeral subscription at boot via
# PubSubSubscriber. See apis/api-sockets/src/services/PubSubSubscriber.ts.
events_configs_consumer = {}
