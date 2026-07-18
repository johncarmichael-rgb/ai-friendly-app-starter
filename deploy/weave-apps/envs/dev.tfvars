project_id        = "cera-dev-weave-apps"
shared_project_id = "cera-dev-shared"
region            = "europe-west2"
env               = "dev"
app               = "weave-apps"

be_configs = {
  "weave-apps-api" = {
    cpu                   = "1"
    memory                = "4096Mi"
    container_concurrency = 80
    # Listen-first with a plain TCP startup probe (mirrors prod): Cloud Run marks
    # the pod started as soon as the port is open, while Mongo connects in the
    # background and Mongoose buffers queries until it's up. (Gating on /readyz
    # was too brittle — a slow Mongo connect during deploy failed the revision.)
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
      NODE_ENV            = "development"
      GCS_FRONTEND_BUCKET = "dev-weave-apps-frontend"
      GCS_BASE_URL        = "https://storage.googleapis.com"
      LOGGER_MODE         = "verbose"

      IAP_ENABLED           = "false"
      DOMAIN                = "https://app.dev.weave-apps.com"
      FRONTEND_USER_APP_URL = "https://app.dev.weave-apps.com"

      WORKOS_REDIRECT_URI   = "https://app.dev.weave-apps.com/api/auth/callback"
      SESSION_COOKIE_DOMAIN = "app.dev.weave-apps.com"

      GCP_PROJECT_ID = "cera-dev-weave-apps"

      # WebSocket Pub/Sub (publisher)
      SOCKET_PUBSUB_TOPIC = "dev-weave-apps-ws-messages"

      # Pod-to-pod broadcast (cross-pod cache invalidation today)
      POD_BROADCAST_TOPIC      = "dev-weave-apps-pod-broadcast"
      POD_BROADCAST_PROJECT_ID = "cera-dev-weave-apps"
    }

    secret_env_vars = {
      MONGO_HOST = "dev-mongo-host"
      MONGO_USER = "dev-mongo-api-mono-user"
      MONGO_PW   = "dev-mongo-api-mono-password"

      WORKOS_CLIENT_ID = "dev-weave-apps-workos-client-id"
      WORKOS_API_KEY   = "dev-weave-apps-workos-api-key"

      EMAIL_USERNAME = "dev-weave-apps-sendgrid-smtp-server-username"
      EMAIL_PASSWORD = "dev-weave-apps-sendgrid-smtp-server-password"
    }
  }

  "weave-apps-socket" = {
    cpu                   = "1"
    memory                = "1024Mi"
    min_instance_count    = 1
    max_instance_count    = 2
    container_concurrency = 1000
    request_timeout       = 3600
    egress_all_traffic    = true

    # pubsub.editor is required because each pod creates an ephemeral
    # subscription on the ws-messages topic at boot so PubSub fans every
    # message out to every pod (a shared subscription would load-balance
    # and clients connected to other pods would miss events).
    additional_roles = ["roles/pubsub.editor"]

    env_vars = {
      NODE_ENV       = "development"
      IAP_ENABLED    = "false"
      GCP_PROJECT_ID = "cera-dev-weave-apps"

      SOCKET_IO_PATH           = "/socket/socket-io"
      SOCKET_PUBSUB_TOPIC      = "dev-weave-apps-ws-messages"
      SOCKET_PUBSUB_PROJECT_ID = "cera-dev-weave-apps"
    }

    secret_env_vars = {
      MONGO_HOST = "dev-mongo-host"
      MONGO_USER = "dev-mongo-api-mono-user"
      MONGO_PW   = "dev-mongo-api-mono-password"
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
  "dev-weave-apps-ws-messages" = {
    retention  = "3600s"
    publishers = ["weave-apps-api"]
  }
  "dev-weave-apps-pod-broadcast" = {
    # Short retention — subscribers are ephemeral and only care about live
    # messages; nothing replays history.
    retention  = "600s"
    publishers = ["weave-apps-api"]
  }
}

# No pre-provisioned subscriptions on dev-weave-apps-ws-messages — every
# api-sockets pod creates its own ephemeral subscription at boot via
# PubSubSubscriber. See apis/api-sockets/src/services/PubSubSubscriber.ts.
events_configs_consumer = {}
