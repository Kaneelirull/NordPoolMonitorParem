#!/bin/bash

clear

echo ""
echo "========================================"
echo "   NordPool Monitor v4.0"
echo "========================================"
echo ""
echo "Starting server..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo ""
    echo "Please install Node.js from https://nodejs.org"
    echo "Then run this script again."
    echo ""
    exit 1
fi

# Start the server
node server.js
