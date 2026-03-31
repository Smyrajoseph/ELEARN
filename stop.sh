#!/bin/bash

# E-Learn Application Stop Script

echo "🛑 Stopping E-Learn Application..."

if [ -f ".elearn.pids" ]; then
    # Read PIDs from file
    BACKEND_PID=$(sed -n '1p' .elearn.pids)
    FRONTEND_PID=$(sed -n '2p' .elearn.pids)
    
    # Kill processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null && echo "✓ Backend stopped (PID: $BACKEND_PID)"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null && echo "✓ Frontend stopped (PID: $FRONTEND_PID)"
    fi
    
    # Remove PID file
    rm .elearn.pids
    echo "✓ Cleanup complete"
else
    echo "⚠ No PID file found. Searching for processes..."
    
    # Find and kill node processes
    pkill -f "node.*server.js" && echo "✓ Backend processes stopped"
    pkill -f "react-scripts" && echo "✓ Frontend processes stopped"
fi

echo "🎯 E-Learn Application stopped"
