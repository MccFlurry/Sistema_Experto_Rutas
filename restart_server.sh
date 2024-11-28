#!/bin/bash

echo "Stopping any existing Node.js processes..."
pkill -f "node.*server.js" || true

echo "Starting backend server..."
cd backend
npm start
