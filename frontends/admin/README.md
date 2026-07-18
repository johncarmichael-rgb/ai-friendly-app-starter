# Sidekick Admin Console

Administrative console for Sidekick platform administrators to manage enterprise customer accounts.

**Deployment**: Automatically deployed to GCS on push to `develop`/`main` branches.

## Features

- **Company Management**: Create, edit, and manage enterprise customer companies
- **Dashboard**: Overview of system statistics and metrics
- **No Authentication Required**: Access is controlled at the load balancer level

## Development

```bash
# Install dependencies
pnpm install

# Start development server (port 3003)
pnpm dev

# Build for production
pnpm build
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
VITE_API_BASE_URL=https://localhost
```

## Architecture

This app is designed for Weave administrators only. Access control is handled at the GCP Load Balancer level, so no email/password authentication is implemented in the app itself.
