project_id        = "cera-prod-weave-apps"
shared_project_id = "cera-prod-shared"
region            = "europe-west2"
env               = "prod"
app               = "weave-apps"
subdomain         = "app"

default_backend_service = ""
routes = [
  {
    paths                = ["/*"]
    backend_service_name = "prod-weave-apps-api"
  },
  {
    paths                = ["/socket", "/socket/*"]
    backend_service_name = "prod-weave-apps-socket"
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
