#!/bin/bash

set -e

echo "================================"
echo "  Song Game - Setup Script"
echo "================================"

# Check prerequisites
echo ""
echo "Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed. Aborting."; exit 1; }

echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"

# Install all Turborepo workspace dependencies from the repo root
echo ""
echo "Installing workspace dependencies..."
npm install
echo "Workspace dependencies installed."

# Generate Prisma client via Turbo
echo ""
echo "Generating Prisma client..."
npm run db:generate
echo "Prisma client generated."

# Setup complete
echo ""
echo "================================"
echo "  Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "  1. Configure environment variables in apps/api/.env"
echo "  2. Start PostgreSQL and Redis"
echo "  3. Push the schema: npm run db:push"
echo "  4. Start everything: npm run dev"
echo "  5. Start API only: npm run dev:api"
echo "  6. Start web only: npm run dev:web"
echo ""
echo "API: http://localhost:3001"
echo "Web: http://localhost:3000"
echo ""
