#!/bin/bash

set -e

echo ""
echo "=================================="
echo " Smith Enterprises Verification"
echo "=================================="
echo ""

echo "Building application..."
npm run build

echo ""
echo "Previewing Clients..."
npm run dev:seed:preview-clients

echo ""
echo "Previewing Returns..."
npm run dev:seed:preview-returns

echo ""
echo "Previewing Payments..."
npm run dev:seed:preview-payments

echo ""
echo "Testing Seeder Profiles..."
npm run dev:seed:test-options

echo ""
echo "All verification completed."