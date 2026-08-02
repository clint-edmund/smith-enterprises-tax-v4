#!/usr/bin/env bash

set -Eeuo pipefail

BRANCH="develop"

echo ""
echo "=============================================="
echo " Smith Enterprises — Publish to Develop"
echo "=============================================="
echo ""

CURRENT_BRANCH="$(git branch --show-current)"

if [[ "$CURRENT_BRANCH" != "$BRANCH" ]]; then
  echo "Error: You are currently on '$CURRENT_BRANCH'."
  echo "Switch to '$BRANCH' before publishing."
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "Error: Git is not installed or unavailable."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed or unavailable."
  exit 1
fi

if ! command -v supabase >/dev/null 2>&1; then
  echo "Error: Supabase CLI is not installed or unavailable."
  exit 1
fi

if [[ -z "$(git status --porcelain)" ]]; then
  echo "There are no local changes to publish."
  exit 0
fi

echo "Current changes:"
git status --short
echo ""

read -r -p "Enter a commit message: " COMMIT_MESSAGE

if [[ -z "${COMMIT_MESSAGE// }" ]]; then
  echo "Error: A commit message is required."
  exit 1
fi

echo ""
read -r -p "Push pending Supabase migrations first? [y/N]: " PUSH_DATABASE

if [[ "$PUSH_DATABASE" =~ ^[Yy]$ ]]; then
  echo ""
  echo "Pushing Supabase migrations..."
  supabase db push

  echo ""
  echo "Regenerating Supabase TypeScript types..."
  supabase gen types typescript \
    --linked \
    --schema public \
    > src/types/database.types.ts
else
  echo ""
  echo "Skipping Supabase database push."
fi

echo ""
echo "Running production build..."
npm run build

echo ""
echo "Build successful."

echo ""
echo "Staging changes..."
git add --all

echo ""
echo "Creating commit..."
git commit -m "$COMMIT_MESSAGE"

echo ""
echo "Pushing to origin/$BRANCH..."
git push origin "$BRANCH"

echo ""
echo "=============================================="
echo " Publish completed successfully"
echo " Branch: $BRANCH"
echo "=============================================="