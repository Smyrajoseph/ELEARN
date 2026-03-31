#!/bin/bash

# E-Learn Application Startup Script
# This script starts both backend and frontend servers

echo "🚀 Starting E-Learn Application..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Start Backend
echo -e "${BLUE}[1/2] Starting Backend Server...${NC}"
cd "ELEARN Backend/server"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Start backend in background
node server.js > backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID) on http://localhost:5000${NC}"
echo "  Log file: ELEARN Backend/server/backend.log"
echo ""

# Go back to root
cd ../..

# Wait a moment for backend to start
sleep 3

# Start Frontend
echo -e "${BLUE}[2/2] Starting Frontend Server...${NC}"
cd "E-Learn-frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start frontend in background
BROWSER=none npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID) on http://localhost:3000${NC}"
echo "  Log file: E-Learn-frontend/frontend.log"
echo ""

# Go back to root
cd ..

echo "═══════════════════════════════════════════════════════"
echo -e "${GREEN}🎉 E-Learn Application is Running!${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo ""
echo "  Backend PID:  $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop the application:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Or save these PIDs to a file:"
echo "$BACKEND_PID" > .elearn.pids
echo "$FRONTEND_PID" >> .elearn.pids
echo -e "${GREEN}✓ PIDs saved to .elearn.pids${NC}"
echo ""
echo "To stop later: kill \$(cat .elearn.pids)"
echo "═══════════════════════════════════════════════════════"
