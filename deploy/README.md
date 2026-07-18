# Deploy — GCP Infrastructure

Terraform for running the app skeleton on **Google Cloud Platform**. Each environment lives in its own GCP project (`cera-{env}-weave-apps`), with shared resources (DNS zone, Artifact Registry, VPC connector) in `cera-{env}-shared` and Terraform state in `cera-management--tf-states`.

## Traffic Flow

```
User Browser
    │
    ▼
Google Cloud DNS (app.{env-}weave-apps.com → LB IP)
    │
    ▼
External HTTPS Load Balancer (EXTERNAL_MANAGED, Cloud Armor policy)
    │
    ├── /*                ──► Backend service → Serverless NEG → Cloud Run: {env}-weave-apps-api
    │                            │  Express: /api/* routes + FrontendAssetsService
    │                            │  streams frontend assets from GCS
    │                            ▼
    │                        MongoDB Atlas · GCS frontend bucket · Pub/Sub (publisher)
    │
    └── /socket, /socket/* ──► Backend service → Serverless NEG → Cloud Run: {env}-weave-apps-socket
                                 Socket.IO gateway, subscribes to the ws-messages Pub/Sub topic
```

Auth is enforced at the application layer (WorkOS AuthKit) — no IAP. Cloud Run ingress is `INTERNAL_LOAD_BALANCER`, so the `*.run.app` URLs are unreachable directly.

## Directory Structure

```
deploy/
├── README.md          # This file
├── infra/             # Per-env edge: global IP, cert, URL map + routes, DNS records,
│                      # default 404 backend bucket, shared secret shells
├── weave-apps/        # Per-env app stack: Cloud Run services (api + socket), SAs,
│                      # secret IAM, GCS frontend bucket, Pub/Sub topics, NEGs,
│                      # backend services, Cloud Armor, registry + VPC IAM
│                      # (see weave-apps/README.md)
└── mongodb/           # MongoDB Atlas project, cluster, users, IP access list;
                       # writes connection secrets to GCP Secret Manager
                       # (see mongodb/README.md)
```

## CI/CD (GitHub Actions)

| Concern | Workflow | Trigger |
|---------|----------|---------|
| API images (api-mono, api-sockets) | `.github/workflows/deploy-weave-apps-apis.yml` | Push to `main`/`develop` on `apis/**` |
| Frontends (user-main, admin) → GCS | `.github/workflows/deploy-weave-apps-frontends.yml` | Push on `frontends/**` |
| App infra (`deploy/weave-apps`) | `.github/workflows/deploy-weave-apps-infra.yml` | Push on `deploy/weave-apps/**` / dispatch |
| MongoDB Atlas | `.github/workflows/mongodb-terraform.yml` | Manual dispatch only |

## Key Secrets (GCP Secret Manager)

Secret shells are declared in Terraform; values are pasted via the console, never committed.

| Secret | Env Var | Description |
|--------|---------|-------------|
| `{env}-mongo-host` | `MONGO_HOST` | MongoDB Atlas connection hostname |
| `{env}-mongo-api-mono-user` | `MONGO_USER` | MongoDB database username |
| `{env}-mongo-api-mono-password` | `MONGO_PW` | MongoDB database password |
| `{env}-weave-apps-workos-client-id` | `WORKOS_CLIENT_ID` | WorkOS AuthKit client ID |
| `{env}-weave-apps-workos-api-key` | `WORKOS_API_KEY` | WorkOS API key |
| `{env}-weave-apps-sendgrid-smtp-server-username` | `EMAIL_USERNAME` | SendGrid SMTP username |
| `{env}-weave-apps-sendgrid-smtp-server-password` | `EMAIL_PASSWORD` | SendGrid SMTP password |
