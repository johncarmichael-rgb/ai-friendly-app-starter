# Localhost HTTPS Development Setup

Setup HTTPS for local development using Docker Compose on macOS and Linux.

## Quick Start

```bash
# One-time setup: installs mkcert, generates trusted certs, creates .env
make setup

# Start all services
make up
```

Then open https://localhost — green padlock, no browser warnings.

The setup script automatically:
1. Installs `mkcert` via your package manager (Homebrew / apt / dnf / pacman)
2. Creates and trusts a local Certificate Authority
3. Generates certificates in `nginx/tmp-certs/`
4. Copies `.env.example` to `.env` if missing

### Other Make targets

| Command | Description |
|---------|-------------|
| `make up` | Start all services (foreground) |
| `make up-d` | Start all services (detached) |
| `make down` | Stop all services |
| `make logs` | Tail logs |
| `make reset` | Stop, remove volumes, restart |

### Access the Application

- **HTTPS**: https://localhost (port 443)
- **HTTP**: http://localhost (redirects to HTTPS)
- **Mailhog**: http://localhost:8025

## Troubleshooting

### Browser Still Shows Certificate Warning

Close the browser and kill the processes, start again and the certificate should be valid.

### Certificate Expired

Run make setup to generate a new certificate.


### Localhost Not Resolving

```bash
# Test DNS resolution
ping localhost
```

### Port 443 Already in Use

```bash
# Check what's using port 443
sudo lsof -i :443

# Stop the conflicting service or change nginx port in docker-compose.dev.yml
```

## Alternative: Automated Script

If you prefer not to use `make`, run the setup script directly:

```bash
./scripts/setup-local-certs.sh
docker compose -f docker-compose.dev.yml up
```

## Production vs Development

**Development (Local)**:
- Self-signed certificates or local CA
- `localhost` domain (no hosts file required)
- Nginx serves HTTPS directly

**Production (GCP)**:
- Google-managed SSL certificates
- Real domain with DNS
- Google Cloud Load Balancer handles HTTPS
- Cloud Run services run HTTP internally

## Next Steps

After setting up HTTPS:
1. Start Docker Compose: `docker-compose -f docker-compose.dev.yml up`
2. Access the platform: https://localhost
3. Test the Chrome extension with the test page: https://localhost/test
4. Review the [Development Guide](../README.md#development) for more information

## References

- [OpenSSL Documentation](https://www.openssl.org/docs/)
- [mkcert GitHub](https://github.com/FiloSottile/mkcert)
- [Chrome Certificate Management](chrome://settings/certificates)
- [Firefox Certificate Management](about:preferences#privacy)
