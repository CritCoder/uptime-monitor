#!/bin/bash

# Pre-Deployment Test Script
# This script runs before deploying to production to ensure everything works

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║        PRE-DEPLOYMENT VALIDATION SUITE                  ║"
echo "║        Testing before production deployment             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Exit on any error
set -e

# Track overall status
OVERALL_STATUS=0

# Step 1: Check Git status
echo -e "${YELLOW}[1/6] Checking Git status...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠  Warning: You have uncommitted changes${NC}"
    git status --short
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Git working directory is clean${NC}"
fi

# Step 2: Install dependencies
echo -e "\n${YELLOW}[2/6] Checking dependencies...${NC}"
if [ ! -d "node_modules" ] || [ ! -d "client/node_modules" ] || [ ! -d "server/node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    cd client && npm install && cd ..
    cd server && npm install && cd ..
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies are installed${NC}"
fi

# Step 3: Lint check
echo -e "\n${YELLOW}[3/6] Running linter...${NC}"
if npm run lint --silent 2>/dev/null; then
    echo -e "${GREEN}✓ Linting passed${NC}"
else
    echo -e "${YELLOW}⚠  Linting warnings detected (non-critical)${NC}"
fi

# Step 4: Build client
echo -e "\n${YELLOW}[4/6] Building client...${NC}"
cd client
if npm run build; then
    echo -e "${GREEN}✓ Client build successful${NC}"
else
    echo -e "${RED}❌ Client build failed${NC}"
    OVERALL_STATUS=1
fi
cd ..

# Step 5: Run tests
echo -e "\n${YELLOW}[5/6] Running end-to-end tests...${NC}"
echo -e "${BLUE}Starting test servers...${NC}"

# Start servers in background
cd client && npm run dev > /tmp/vite.log 2>&1 &
VITE_PID=$!
cd ..

cd server && npm start > /tmp/server.log 2>&1 &
SERVER_PID=$!
cd ..

# Wait for servers to start
echo "Waiting for servers to start..."
sleep 5

# Check if servers started successfully
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${RED}❌ Client server failed to start${NC}"
    cat /tmp/vite.log
    kill $VITE_PID $SERVER_PID 2>/dev/null || true
    exit 1
fi

if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠  API server may not be fully ready${NC}"
fi

echo -e "${GREEN}✓ Test servers running${NC}"

# Run tests
if bash testing/run-tests.sh --headless; then
    echo -e "${GREEN}✓ All tests passed${NC}"
else
    echo -e "${RED}❌ Tests failed${NC}"
    OVERALL_STATUS=1
fi

# Stop test servers
echo -e "\n${YELLOW}Stopping test servers...${NC}"
kill $VITE_PID $SERVER_PID 2>/dev/null || true
sleep 2

# Step 6: Final validation
echo -e "\n${YELLOW}[6/6] Final validation...${NC}"

if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "\n${GREEN}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                  ✓ ALL CHECKS PASSED                    ║"
    echo "║            Ready for production deployment              ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    echo -e "${BLUE}To deploy to production, run:${NC}"
    echo -e "  ssh root@rollout.site"
    echo -e "  cd tryweb3"
    echo -e "  git pull origin working-anthropic-flow"
    echo -e "  yarn build"
    echo -e "  pm2 restart all"
    echo ""
    
    exit 0
else
    echo -e "\n${RED}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                  ❌ CHECKS FAILED                        ║"
    echo "║          Please fix errors before deploying             ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    echo -e "${RED}Deployment blocked due to test failures${NC}"
    echo "Please review the errors above and fix them before deploying."
    echo ""
    
    exit 1
fi

