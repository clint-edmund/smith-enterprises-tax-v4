#!/bin/bash

echo ""
echo "====================================="
echo " Atlas Development Status"
echo "====================================="
echo ""

docker ps >/dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Docker is not running"
    exit 1
fi

echo "✅ Docker Running"
echo ""

supabase status

echo ""
echo "====================================="