#!/bin/bash

echo ""
echo "====================================="
echo " Resetting Atlas Local Database"
echo "====================================="
echo ""

supabase db reset --local

echo ""
echo "====================================="
echo " Database Ready"
echo "====================================="