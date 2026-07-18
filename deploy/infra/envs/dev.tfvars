project_id        = "cera-dev-weave-apps"
shared_project_id = "cera-dev-shared"
region            = "europe-west2"
env               = "dev"
app               = "weave-apps"
subdomain         = "app"

default_backend_service = ""
routes = [
  {
    paths                = ["/*"]
    backend_service_name = "dev-weave-apps-api"
  },
  {
    paths                = ["/socket", "/socket/*"]
    backend_service_name = "dev-weave-apps-socket"
  },
]

shared_secrets = [
  # Auth0
  "auth0-domain",
  "auth0-client-id",
  "auth0-client-secret",

  # Session cookie signing
  "session-secret",

  # SendGrid SMTP
  "sendgrid-smtp-server-username",
  "sendgrid-smtp-server-password",
]
