# App Skeleton - Monorepo

A monorepo starter for a multi-tenant SaaS app: WorkOS AuthKit authentication, roles/permissions, feature gates, a multi-tenant admin console, Socket.IO realtime via PubSub, and an email skeleton.

## Structure

```
├── apis/api-mono/           # Backend API (Express, MongoDB)
├── apis/api-sockets/        # Socket.IO gateway (PubSub-fed)
├── frontends/               # Frontend apps (pnpm workspace: user-main, admin, services, apis)
├── deploy/                  # Infrastructure (Terraform: GCP + MongoDB Atlas)
├── nginx/                   # Local development proxy
└── .github/workflows/       # CI/CD pipelines
```

## Initial Setup (run once per new project)

This repository is a skeleton. When starting a new project from it, ask Claude (e.g. Claude Code) to run through the following initial setup. Claude should complete these steps in order:

### 1. Rebrand the GitHub workflows and actions

- Go through every file in `.github/workflows/` (and `.github/actions/` if present).
- Rename workflow files, workflow `name:` fields, job names, and any environment/deployment identifiers that reference the skeleton (e.g. `app-skeleton`, `app_skeleton`, `App Skeleton`) so they make sense for the current project.
- Check for skeleton naming in artifact names, Docker image tags, GCP service names, and cache keys within the workflows, and update those too.

### 2. Fix the Docker env naming

- Update `.env.example` (and `.env` if it exists) so any variable values, container names, database names, project IDs, or comments referencing `app-skeleton` are renamed to the current project.
- Do the same in `docker-compose.dev.yml` and any other compose files: service names, container names, network names, volume names, and image tags should reflect the current project, not the skeleton.
- Double-check that renamed values stay consistent across `.env.example`, the compose files, `nginx/` config, and the `Makefile`.

### 3. Build a general understanding of the codebase

- Read through the whole repository to get a working mental model of it: the API (`apis/api-mono/`), the sockets gateway (`apis/api-sockets/`), the frontend workspace (`frontends/`), the Terraform infrastructure (`deploy/`), the Nginx proxy (`nginx/`), and the CI/CD pipelines (`.github/workflows/`).
- Pay particular attention to the API-first generation loop (BOATS spec → GenerateIt server stubs → frontend consumer generation) described below, since most feature work flows through it.
- Summarise the architecture back to the developer, flagging anything that still carries skeleton naming or looks like it needs project-specific configuration (WorkOS keys, `SUPER_ADMIN_EMAILS`, GCP/Atlas settings in Terraform, etc.).

Once these three steps are done, the project is considered initialised and normal development can begin.

## Documentation-Driven Development

This project follows **API-first development** using:
- [BOATS](https://j-d-carmichael.github.io/boats/#/) ([npm](https://www.npmjs.com/package/boats)) - OpenAPI spec builder
- [GenerateIt](https://acr-lfr.github.io/generate-it/) ([npm](https://www.npmjs.com/package/generate-it)) - Code generator

The loop:

1. Edit the spec in `apis/api-mono/api-spec/src/`, then from `apis/api-mono/api-spec/` run `npm run build`
2. From `apis/api-mono/api/` run `npm run generate:server`, then implement the domain stubs
3. From `frontends/apis/` run `npm run generate:api-consumers` to regenerate the frontend HTTP consumers

## Local Development

### Prerequisites

- [Docker](https://docs.docker.com/get-desktop/) and Docker Compose
- [Homebrew](https://brew.sh) (macOS) or a supported package manager (Linux)

### 1. Generate local HTTPS certificates

Run the one-time setup to install [mkcert](https://github.com/FiloSottile/mkcert), generate trusted TLS certificates, and create your `.env` file:

```bash
make setup
```

This will:

- Install `mkcert` (via Homebrew on macOS or your system package manager on Linux)
- Install a local Certificate Authority so your browser trusts `https://localhost`
- Generate certificates in `nginx/tmp-certs/`
- Copy `.env.example` to `.env` if it doesn't already exist

> After running setup, edit `.env` with your credentials (WorkOS keys, `SUPER_ADMIN_EMAILS`, etc.).

### 2. Start the dev environment

```bash
docker compose -f docker-compose.dev.yml up   # or: make up
```

This starts all services (Nginx, API, sockets, Mailhog) via Docker Compose in the foreground.

### 3. Build the frontends

Frontends are not run by Docker — build them in watch mode:

```bash
cd frontends && pnpm install
cd user-main && pnpm build:watch
```

Then open https://localhost/users. The admin console at https://localhost/admin (build `frontends/admin` the same way) requires your email in `SUPER_ADMIN_EMAILS` in `.env`.

### 4. Available make commands

| Command      | Description                          |
| ------------ | ------------------------------------ |
| `make setup` | First-time setup (certs + .env)      |
| `make up`    | Start all services (foreground)      |
| `make up-d`  | Start all services (detached)        |
| `make down`  | Stop all services                    |
| `make logs`  | Tail service logs                    |
| `make reset` | Stop, remove volumes, and restart    |
