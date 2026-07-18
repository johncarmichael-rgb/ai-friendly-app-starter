# .github — CI/CD Workflows

GitHub Actions workflows for the app skeleton. All deploy workflows use in-repo Terraform (`deploy/`) and Workload Identity Federation for GCP auth (no SA key JSON).

---

## Workflow Files

### Reusable Workflows (called by other workflows, prefixed with `_`)

| File | Purpose |
|------|---------|
| `_build-push.yml` | Combined Docker build + multi-env push to Artifact Registry in one workflow. Pushes to all envs in the `environments` JSON array. |
| `_test.yml` | Runs API and/or frontend test suites. Flags (`test_api`, `test_frontends`) control which suites run. |

### Deploy Workflows

| File | Trigger | Envs | What it does |
|------|---------|------|--------------|
| `deploy-weave-apps-apis.yml` | PR/push `develop`/`main` on `apis/**`, `deploy/weave-apps/**` + dispatch | dev / prod | Full pipeline: build+push (matrix from `weave-apps-matrix.json`) → TF plan/apply (`deploy/weave-apps`) → Cloud Run image bump. |
| `deploy-weave-apps-frontends.yml` | PR/push `develop`/`main` on `frontends/**` + dispatch | dev / prod | Builds changed frontends (`admin`, `user-main`) with pnpm and uploads to the `{env}-weave-apps-frontend` GCS bucket. |
| `deploy-weave-apps-infra.yml` | PR/push on `deploy/infra/**` + dispatch | dev / prod | TF plan/apply for edge infra (load balancer, URL map, SSL, DNS, secret shells). Posts plan to PR comments. |
| `mongodb-terraform.yml` | PR on `deploy/mongodb/**` + dispatch | dev / qa / prod | TF plan (auto on PR) + apply (manual dispatch only) for MongoDB Atlas. |

### Test-Only Workflows

| File | Trigger | What it tests |
|------|---------|---------------|
| `test-api.yml` | PR on `apis/**` | API lint + unit tests |
| `test-frontends.yml` | PR on `frontends/{admin,user-main,services,apis}/**` | Frontend package tests (pnpm workspace) |

---

## Supporting Files

| File | Purpose |
|------|---------|
| `weave-apps-matrix.json` | Service matrix for the API deploy (`weave-apps-api`, `weave-apps-socket`) — Dockerfiles, build contexts |
