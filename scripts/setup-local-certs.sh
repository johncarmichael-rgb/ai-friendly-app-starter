#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CERTS_DIR="$PROJECT_ROOT/nginx/tmp-certs"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Detect OS
detect_os() {
  case "$(uname -s)" in
    Darwin) echo "macos" ;;
    Linux)  echo "linux" ;;
    *)      error "Unsupported OS: $(uname -s). This script supports macOS and Linux." ;;
  esac
}

# Install mkcert if not present
install_mkcert() {
  if command -v mkcert &>/dev/null; then
    info "mkcert is already installed ($(mkcert --version 2>/dev/null || echo 'unknown version'))"
    return 0
  fi

  local os
  os=$(detect_os)

  info "Installing mkcert..."

  if [ "$os" = "macos" ]; then
    if ! command -v brew &>/dev/null; then
      error "Homebrew is required on macOS. Install it from https://brew.sh"
    fi
    brew install mkcert nss
  elif [ "$os" = "linux" ]; then
    if command -v apt &>/dev/null; then
      sudo apt update && sudo apt install -y mkcert libnss3-tools
    elif command -v pacman &>/dev/null; then
      sudo pacman -S --noconfirm mkcert nss
    elif command -v dnf &>/dev/null; then
      sudo dnf install -y mkcert nss-tools
    else
      error "Could not detect package manager. Install mkcert manually: https://github.com/FiloSottile/mkcert#installation"
    fi
  fi

  if ! command -v mkcert &>/dev/null; then
    error "mkcert installation failed. Install it manually: https://github.com/FiloSottile/mkcert#installation"
  fi

  info "mkcert installed successfully"
}

# Install local CA and generate certificates
generate_certs() {
  local cert_file key_file
  cert_file="$CERTS_DIR/localhost.pem"
  key_file="$CERTS_DIR/localhost-key.pem"

  info "Installing local CA (this may prompt for your password)..."
  mkcert -install

  info "Generating localhost certificates in $CERTS_DIR/"
  mkdir -p "$CERTS_DIR"

  # Recover from bad previous state where target file paths were created as directories.
  if [ -d "$cert_file" ]; then
    warn "$cert_file is a directory; removing it so mkcert can write the certificate file"
    rmdir "$cert_file" 2>/dev/null || rm -rf "$cert_file"
  fi

  if [ -d "$key_file" ]; then
    warn "$key_file is a directory; removing it so mkcert can write the key file"
    rmdir "$key_file" 2>/dev/null || rm -rf "$key_file"
  fi

  mkcert \
    -cert-file "$cert_file" \
    -key-file "$key_file" \
    localhost 127.0.0.1 ::1

  info "Certificates generated:"
  echo "  $cert_file"
  echo "  $key_file"
}

main() {
  echo ""
  echo "=== App Skeleton Local HTTPS Setup ==="
  echo ""

  install_mkcert
  generate_certs

  echo ""
  info "Setup complete! Your browser will trust https://localhost"
  echo ""
  echo "  Next steps:"
  echo "    make up          # Start all services"
  echo "    # or"
  echo "    docker compose -f docker-compose.dev.yml up"
  echo ""
  echo "  Then open: https://localhost"
  echo ""
}

main
