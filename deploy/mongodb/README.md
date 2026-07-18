# MongoDB Atlas Terraform Setup

This directory contains Terraform configuration for provisioning MongoDB Atlas databases across environments.

## Architecture

- **MongoDB Atlas**: Managed MongoDB clusters
- **GCP Secret Manager**: Stores connection strings automatically
- **GitHub Actions**: Automated deployment pipeline

## Directory Structure

```
deploy/mongodb/
├── terraform/
│   ├── backend.tf          # Terraform backend config (GCS)
│   ├── providers.tf        # MongoDB Atlas + Google provider config
│   ├── variables.tf        # Input variables
│   ├── main.tf            # MongoDB Atlas resources
│   ├── outputs.tf         # Terraform outputs
│   └── envs/
│       └── dev.tfvars     # Dev environment config
└── README.md
```

## Prerequisites

### 1. MongoDB Atlas API Keys

1. Go to [MongoDB Atlas Console](https://cloud.mongodb.com/)
2. Organization → Access Manager → API Keys
3. Click **Create API Key**
4. Set permissions: **Organization Project Creator** (minimum) or **Organization Owner**
5. Save both **Public Key** and **Private Key**
6. **API Access List**: Add GitHub runner NAT Gateway IPs
   - Dev runners (AWS NAT): `18.133.53.159/32`, `3.11.222.224/32`, `3.9.206.95/32`
   - QA runners: Add QA NAT IPs when configuring QA environment
   - Prod runners: Add Prod NAT IPs when configuring Prod environment
   - **Important**: API calls from GitHub Actions use runner NAT IPs, not GCP NAT IPs

### 2. GitHub Secrets

Add these secrets to the repository at `Settings → Secrets and variables → Actions`:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `MONGODB_ATLAS_PUBLIC_KEY` | `<your-public-key>` | MongoDB Atlas API public key |
| `MONGODB_ATLAS_PRIVATE_KEY` | `<your-private-key>` | MongoDB Atlas API private key |
| `GOOGLE_CREDENTIALS` | `<service-account-json>` | GCP credentials (already exists) |

### 3. GCP Secret Manager

Terraform automatically creates three secrets in GCP Secret Manager:
- `{env}-mongo-host` - MongoDB connection hostname
- `{env}-mongo-user` - MongoDB username
- `{env}-mongo-password` - MongoDB password

For example, dev environment creates:
- `dev-mongo-host`
- `dev-mongo-user`
- `dev-mongo-password`

## Resources Created

For each environment, Terraform creates:

1. **MongoDB Atlas Project**: `{env}-{project_name}` (e.g., `dev-weave`)
2. **MongoDB Cluster**: `{env}` (e.g., `dev`, `qa`, `prod`)
   - **Note**: M0/M2/M5 shared clusters do not support tagging (API limitation)
   - Tags are only applied to M10+ dedicated clusters
3. **Database User**: `app-user` with `readWrite` role on `{database_name}` database
4. **IP Access List**: Cloud NAT IPs + developer IPs
5. **GCP Secrets**: Three secrets in Secret Manager
   - `{env}-mongo-host`
   - `{env}-mongo-user`
   - `{env}-mongo-password`

## Usage

### Deploy via GitHub Actions

MongoDB infrastructure is deployed **manually only** for explicit control over database changes.

**Why manual deployment?**
- Unlike application code, database infrastructure changes can cause data loss or service disruption if deployed incorrectly
- MongoDB clusters are created once per environment and rarely modified, making automation less valuable
- Self-hosted GitHub runners are labeled by environment (dev/qa/prod), requiring explicit environment selection for correct runner routing
- Forces review and approval before creating/modifying database resources
- Manual deployment ensures team awareness of infrastructure costs before deployment

#### Pull Request Validation:
- Automatically runs `terraform plan` on PR creation
- Validates Terraform configuration
- No deployment occurs

#### Manual Deployment:
1. Go to **Actions** tab → **MongoDB Terraform** workflow
2. Click **Run workflow**
3. Select:
   - **Environment**: `dev`, `qa`, or `prod`
   - **Terraform action**: `plan` or `apply`
4. For `plan`: Review output in workflow logs
5. For `apply`: Approve environment deployment when prompted
6. MongoDB cluster created + connection string injected to Secret Manager

## Configuration

### Environment Variables (envs/dev.tfvars)

| Variable | Description | Example |
|----------|-------------|---------|
| `env` | Environment name | `dev` |
| `gcp_project_id` | GCP project ID | `cera-dev-weave` |
| `project_name` | MongoDB Atlas project name | `weave` |
| `cluster_tier` | MongoDB cluster size | `M10`, `M20`, `M30` |
| `mongodb_version` | MongoDB version | `8.0` |
| `mongodb_region` | MongoDB region | `EUROPE_WEST_2` |
| `api_mono_database_name` | Database name for api-mono service | `api-mono` |
| `repo_name` | Repository name (injected by workflow) | `app-skeleton` |
| `ip_access_list` | Allowed IPs | Cloud NAT IPs + developer IPs |

### Cluster Tiers

| Tier | RAM | Storage | Cost | Use Case |
|------|-----|---------|------|----------|
| `M0` | Shared | 512MB | Free | POC |
| `M10` | 2GB | 10GB | ~$57/mo | Dev/QA |
| `M20` | 4GB | 20GB | ~$140/mo | Production |
| `M30` | 8GB | 40GB | ~$280/mo | Production |

## Outputs

After deployment, Terraform outputs:

- `mongodb_project_name`: Atlas project name
- `mongodb_cluster_name`: Atlas cluster name
- `mongodb_cluster_state`: Cluster status (IDLE when ready)
- `gcp_secret_host`: Secret name for MongoDB host

## MongoDB Connection Details

MongoDB credentials are stored separately in GCP Secret Manager:
- **Host**: `{env}-mongo-host` (e.g., `dev-weave-cluster.08mfvgz.mongodb.net`)
- **User**: `{env}-mongo-user` (e.g., `app-user`)
- **Password**: `{env}-mongo-password` (auto-generated 32-char password)

These secrets are injected into Cloud Run as environment variables.

## Database Architecture

**Service-Oriented Architecture (SOA) Design Principle**: Each service maintains its own isolated database to avoid schema sharing.

- **Current setup**: `api-mono` service → `api-mono` database
- **Database creation**: MongoDB automatically creates databases on first connection (no manual creation needed)
- **User permissions**: Terraform pre-grants `readWrite` permissions on the database name before it exists
- **Application startup**: Service connects and writes data → database is created automatically

**Adding New Services**:
When introducing new services to the cluster, expand Terraform configuration:
1. Add new `<service>_database_name` variable (e.g., `frontend_database_name`)
2. Create additional `random_password` and `mongodbatlas_database_user` resources for the new service
3. Each service gets isolated database user following SOA principles

## Troubleshooting

### Cluster Creation Takes Long

MongoDB Atlas clusters take **7-10 minutes** to provision. Check status:
```bash
terraform output mongodb_cluster_state
```

Wait for `IDLE` status before connecting.

### Cloud Run Not Picking Up New Secret

After Terraform updates the secret, Cloud Run needs a restart to pick up the new version:

```bash
gcloud run services update <service-name> \
  --project=<project-id> \
  --region=europe-west2 \
  --update-labels=updated=$(date +%s)
```

Replace placeholders with values from the table below:

| Environment | `<service-name>` | `<project-id>` |
|-------------|------------------|----------------|
| Dev | `dev-weave-api` | `cera-dev-weave` |
| QA | `qa-weave-api` | `cera-qa-weave` |
| Prod | `prod-weave-api` | `cera-prod-weave` |

Alternatively, redeploy via GitHub Actions - any new deployment automatically uses the latest secret version.

### IP Access Denied

Ensure your IP is in the `ip_access_list` in the tfvars file.

## Next Steps

After deployment:
1. Verify cluster state: `terraform output mongodb_cluster_state`
2. Check GCP Secret Manager for updated connection string
3. Restart Cloud Run to pick up new secret version:
   ```bash
   gcloud run services update <service-name> \
     --project=<project-id> \
     --region=europe-west2 \
     --update-labels=updated=$(date +%s)
   ```

   Replace placeholders with values from the table in the Troubleshooting section.

4. Test database connection from Cloud Run or locally
