# deploy/weave-apps — Terraform Infrastructure

End-to-end Terraform configuration for the **Weave Apps** platform (v2 stack). This module owns all compute, networking, storage, eventing, and IAM resources in a dedicated GCP project (`cera-{env}-weave-apps`), deployed per environment.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  External HTTPS Load Balancer (EXTERNAL_MANAGED)                    │
│  ┌───────────────────────┐    ┌────────────────────────────────┐    │
│  │ Backend Service (api) │    │ Backend Service (socket)       │    │
│  │  → Serverless NEG     │    │  → Serverless NEG              │    │
│  └──────────┬────────────┘    └──────────────┬─────────────────┘    │
└─────────────┼────────────────────────────────┼──────────────────────┘
              │                                │
┌─────────────▼────────────────────────────────▼──────────────────────┐
│  Cloud Run v2 Services (ingress: INTERNAL_LOAD_BALANCER)            │
│  ┌──────────────────┐         ┌───────────────────────┐             │
│  │ weave-apps-api   │────────▶│ Pub/Sub Topic         │             │
│  │ (publisher)      │         │ (ws-messages)         │             │
│  └──────────────────┘         └──────────┬────────────┘             │
│                                          │                          │
│  ┌──────────────────┐         ┌──────────▼────────────┐             │
│  │ weave-apps-socket│◀────────│ Pub/Sub Subscription  │             │
│  │ (subscriber)     │         │ (ws-messages-sub)     │             │
│  └──────────────────┘         └───────────────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────┐    ┌──────────────────────────────┐
│  GCS Bucket (frontend assets)   │    │  Secret Manager (mongo creds,│
│                                 │    │  Auth0 secrets)              │
└─────────────────────────────────┘    └──────────────────────────────┘
```

## What This Module Manages

| Resource | File | Purpose |
|----------|------|---------|
| Cloud Run v2 services | `main.tf` | API + Socket compute workloads |
| IAM invoker policy | `main.tf` | `allUsers` invoker (LB reaches Cloud Run; network-gated by ingress policy) |
| Serverless NEGs | `neg.tf` | Network Endpoint Groups — connect LB backend services to Cloud Run (serverless endpoints) |
| Backend services | `backend_service.tf` | HTTPS backend services for the external LB |
| Service accounts | `sa.tf` | Per-service SA + additional project-level roles |
| Secret Manager IAM | `secrets_iam.tf` | Least-privilege `secretAccessor` per secret per service |
| GCS buckets | `bucket.tf` | Frontend asset storage with per-service IAM |
| Pub/Sub topics & subs | `pubsub.tf` | WebSocket message fan-out (api → socket) |
| Artifact Registry IAM | `registry.tf` | Cross-project image pull from shared registry |
| VPC connector access | `vpc.tf` | Shared VPC serverless connector + IAM binding |

## Key Design Decisions

- **No IAP** — Auth is enforced at the application layer (Auth0). No `iap {}` block on backend services.
- **Network-gated ingress** — Cloud Run services set `ingress = INTERNAL_LOAD_BALANCER` so the `*.run.app` URL is unreachable externally even though IAM is `allUsers`.
- **Data-driven** — All services, buckets, topics, and subscriptions are declared via `be_configs`, `gcs_configs`, `events_configs_producer`, and `events_configs_consumer` variable maps. Adding a new service = adding a map entry.
- **Cross-project shared resources** — Images are pulled from `cera-{env}-shared` Artifact Registry; VPC connector lives in the shared project. A `google.shared` provider alias handles these.
- **Terraform state** — Remote GCS backend in `cera-management--tf-states`, service-account impersonation for auth.

## File Layout

```
deploy/weave-apps/
├── backend.tf          # Terraform version, backend config, required providers
├── providers.tf        # google / google-beta / google.shared providers
├── variables.tf        # All input variables with validation & defaults
├── locals.tf           # Standard labels + additional_roles flattening
├── main.tf             # Cloud Run v2 services + public invoker IAM
├── neg.tf              # Serverless network endpoint groups
├── backend_service.tf  # Compute backend services for the LB
├── sa.tf               # Service accounts + additional roles
├── secrets_iam.tf      # Per-secret accessor grants
├── bucket.tf           # GCS buckets + per-bucket IAM
├── pubsub.tf           # Topics, subscriptions, publisher/subscriber IAM
├── registry.tf         # Cross-project Artifact Registry reader
├── vpc.tf              # VPC connector data source + serverless user IAM
└── envs/
    └── dev.tfvars      # Dev environment variable values
```

## Environments

Per-environment values live in `envs/{env}.tfvars`. Currently:

- **dev** — `cera-dev-weave-apps` / `cera-dev-shared`

Additional `qa.tfvars` and `prod.tfvars` files will follow the same shape.

## Usage

```bash
# Init (from this directory)
terraform init -backend-config="prefix=weave-apps/dev"

# Plan
terraform plan -var-file=envs/dev.tfvars -var="repo_name=1-weave-main" -out=dev.tfplan

# Apply
terraform apply dev.tfplan
```

## Adding a New Service

1. Add a new key to `be_configs` in the appropriate `envs/{env}.tfvars`.
2. Optionally add GCS bucket, Pub/Sub topic/subscription entries.
3. Run `terraform plan` — all resources (SA, Cloud Run, NEG, backend service, secret IAM) are created automatically from the map entry.

## Prerequisites

- Terraform `~> 1.14`
- Google provider `~> 7.29`
- Service account impersonation configured (`sa-terraform@{project}.iam.gserviceaccount.com`)
- Secrets pre-created in Secret Manager before first apply
- Container images pushed to `{region}-docker.pkg.dev/{shared_project}/cera/{env}_{service}:{version}`
