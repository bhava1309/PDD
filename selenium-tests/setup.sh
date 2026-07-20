#!/bin/bash
# PawPal Selenium E2E Test Suite - Quick Start Script
# Run this from the selenium-tests directory: bash setup.sh

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   🐾 PawPal Selenium Test Suite - Setup & Run       ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo "   Please install Node.js from: https://nodejs.org"
    echo "   Or via Homebrew: brew install node"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js found: ${NODE_VERSION}${NC}"

# Check npm
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm found: v${NPM_VERSION}${NC}"

# Check Chrome
if ! command -v google-chrome &> /dev/null && ! command -v "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Google Chrome not found in standard location.${NC}"
    echo "   Make sure Chrome is installed: https://www.google.com/chrome"
fi

echo ""
echo -e "${CYAN}📦 Installing dependencies...${NC}"
npm install

echo ""
echo -e "${CYAN}🌐 Starting PawPal local server on port 3000...${NC}"
# Start server in background
npx http-server ../ -p 3000 --silent &
SERVER_PID=$!
echo -e "${GREEN}✅ Server started (PID: ${SERVER_PID})${NC}"
sleep 2

echo ""
echo -e "${CYAN}🚀 Running all E2E tests...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
node tests/runner.js
TEST_EXIT=$?

# Cleanup server
kill $SERVER_PID 2>/dev/null || true

if [ $TEST_EXIT -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Tests completed! Check the reports/ folder for your Excel report.${NC}"
else
    echo ""
    echo -e "${RED}⚠️  Some tests failed. Check reports/ folder for details.${NC}"
fi
