#!/bin/bash

set -u

PASS_COUNT=0
FAIL_COUNT=0

pass() {
  echo "✅ $1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  echo "❌ $1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

echo ""
echo "============================================"
echo " Atlas Development Health Check"
echo "============================================"
echo ""

# ------------------------------------------------------------
# Docker
# ------------------------------------------------------------

if docker info >/dev/null 2>&1; then
  pass "Docker Running"
else
  fail "Docker is not running"
fi

# ------------------------------------------------------------
# Supabase
# ------------------------------------------------------------

if supabase status >/dev/null 2>&1; then
  pass "Supabase Running"
else
  fail "Supabase is not running"
fi

# ------------------------------------------------------------
# PostgreSQL
# ------------------------------------------------------------

if pg_isready \
  -h 127.0.0.1 \
  -p 54322 \
  -U postgres \
  >/dev/null 2>&1; then
  pass "PostgreSQL Reachable"
else
  fail "PostgreSQL is not reachable"
fi

# ------------------------------------------------------------
# Supabase API
# ------------------------------------------------------------

if curl -fsS \
  http://127.0.0.1:54321/rest/v1/ \
  >/dev/null 2>&1; then
  pass "REST API Online"
else
  fail "REST API is unavailable"
fi

# ------------------------------------------------------------
# Studio
# ------------------------------------------------------------

if curl -fsS \
  http://127.0.0.1:54323 \
  >/dev/null 2>&1; then
  pass "Supabase Studio Online"
else
  fail "Supabase Studio is unavailable"
fi

# ------------------------------------------------------------
# Storage
# ------------------------------------------------------------

if curl -fsS \
  http://127.0.0.1:54321/storage/v1/status \
  >/dev/null 2>&1; then
  pass "Storage API Online"
else
  fail "Storage API is unavailable"
fi

# ------------------------------------------------------------
# Authentication
# ------------------------------------------------------------

if curl -fsS \
  http://127.0.0.1:54321/auth/v1/health \
  >/dev/null 2>&1; then
  pass "Auth API Online"
else
  fail "Auth API is unavailable"
fi

# ------------------------------------------------------------
# Environment file
# ------------------------------------------------------------

if [ -f ".env.local" ]; then
  pass ".env.local Present"
else
  fail ".env.local is missing"
fi

# ------------------------------------------------------------
# Local Supabase URL
# ------------------------------------------------------------

LOCAL_URL=$(grep '^VITE_SUPABASE_URL=' .env.local 2>/dev/null)

if echo "$LOCAL_URL" | grep -Eq 'http://(127\.0\.0\.1|localhost):54321/?$'; then
    pass "Vite Points to Local Supabase"
else
    fail "Vite is not configured for local Supabase"
fi

# ------------------------------------------------------------
# Baseline migrations
# ------------------------------------------------------------

if [ -f \
  "supabase/migrations/20260807010000_atlas_foundation_v1.sql" ]; then
  pass "Atlas Foundation Migration Present"
else
  fail "Atlas Foundation Migration Missing"
fi

if [ -f \
  "supabase/migrations/20260807010001_atlas_bootstrap_v1.sql" ]; then
  pass "Atlas Bootstrap Migration Present"
else
  fail "Atlas Bootstrap Migration Missing"
fi

# ------------------------------------------------------------
# Required database objects
# ------------------------------------------------------------

DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

check_table() {
  TABLE_NAME="$1"

  RESULT=$(psql "$DB_URL" \
    -tAc \
    "select to_regclass('public.${TABLE_NAME}') is not null;" \
    2>/dev/null)

  if [ "$RESULT" = "t" ]; then
    pass "Table: ${TABLE_NAME}"
  else
    fail "Missing table: ${TABLE_NAME}"
  fi
}

check_table "profiles"
check_table "clients"
check_table "tax_returns"
check_table "payments"
check_table "client_documents"
check_table "client_portal_profiles"
check_table "client_tax_organizers"
check_table "client_tax_organizer_businesses"

# ------------------------------------------------------------
# Storage bucket
# ------------------------------------------------------------

BUCKET_RESULT=$(psql "$DB_URL" \
  -tAc \
  "select exists(
     select 1
     from storage.buckets
     where id = 'client-documents'
   );" \
  2>/dev/null)

if [ "$BUCKET_RESULT" = "t" ]; then
  pass "Storage Bucket: client-documents"
else
  fail "Storage Bucket Missing: client-documents"
fi

# ------------------------------------------------------------
# Summary
# ------------------------------------------------------------

echo ""
echo "============================================"
echo " Health Check Summary"
echo "============================================"
echo ""
echo "Passed: ${PASS_COUNT}"
echo "Failed: ${FAIL_COUNT}"
echo ""

if [ "$FAIL_COUNT" -eq 0 ]; then
  echo "✅ Atlas local environment is healthy."
  echo ""
  exit 0
else
  echo "❌ Atlas local environment has problems."
  echo ""
  exit 1
fi