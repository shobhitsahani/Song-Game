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

# Install backend dependencies
echo ""
echo "Installing backend dependencies..."
cd backend
npm install
cp .env.example .env 2>/dev/null || true
echo "Backend dependencies installed."

# Generate Prisma client
echo ""
echo "Generating Prisma client..."
npx prisma generate
echo "Prisma client generated."

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
cd ../frontend
npm install
echo "Frontend dependencies installed."

# Setup complete
echo ""
echo "================================"
echo "  Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "  1. Configure environment variables in backend/.env"
echo "  2. Start PostgreSQL and Redis"
echo "  3. Run database migrations: cd backend && npm run db:migrate"
echo "  4. Seed the database: cd backend && npm run db:seed"
echo "  5. Start backend: cd backend && npm run dev"
echo "  6. Start frontend: cd frontend && npm run dev"
echo ""
echo "Backend: http://localhost:4000"
echo "Frontend: http://localhost:3000"
echo ""
