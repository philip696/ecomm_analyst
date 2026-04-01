#!/bin/bash
set -e

echo "🚀 MarketLens Cloudflare Pages Deployment"
echo "==========================================="
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing wrangler..."
    npm install -g @cloudflare/wrangler
fi

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "📂 Project root: $PROJECT_ROOT"
echo "📂 Frontend directory: $FRONTEND_DIR"
echo ""

# Change to frontend directory
cd "$FRONTEND_DIR"

echo "🔨 Building frontend..."
npm run build:cf

echo ""
echo "✅ Build complete!"
echo ""
echo "🚀 Deploying to Cloudflare Pages..."
echo ""
echo "Choose deployment method:"
echo "1. Deploy via wrangler (local CLI)"
echo "2. Push to GitHub (auto-deploy via CI/CD)"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo "Deploying via wrangler..."
        wrangler pages deploy .next --project-name=marketlens-frontend
        echo "✅ Deployment complete!"
        ;;
    2)
        echo "Push to GitHub to trigger auto-deployment:"
        cd "$PROJECT_ROOT"
        git add .
        git commit -m "chore: cloudflare deployment update"
        git push origin main
        echo "✅ Pushed to GitHub! CI/CD will deploy automatically."
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "📊 Deployment Summary:"
echo "- Frontend: Cloudflare Pages"
echo "- Backend: Railway/Fly.io (deploy separately)"
echo "- Database: Supabase (setup separately)"
echo ""
