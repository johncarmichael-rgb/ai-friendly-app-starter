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

### Services

| Service | URL                    | Description                |
| ------- | ---------------------- | -------------------------- |
| App     | https://localhost/users | Main user app (via Nginx)  |
| Admin   | https://localhost/admin | Admin console (via Nginx)  |
| API     | https://localhost/api  | Backend API (via Nginx)    |
| Mailhog | http://localhost:8025  | Dev email UI               |
