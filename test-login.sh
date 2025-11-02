#!/bin/bash

# Test login on Vercel
# Usage: ./test-login.sh [vercel-url]

VERCEL_URL="${1:-http://localhost:3000}"

echo "🧪 Testing login on: $VERCEL_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test login
RESPONSE=$(curl -s -w "\n%{http_code}" "$VERCEL_URL/api/auth/login" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "varangian@admin.com",
    "password": "password123"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "📡 Response:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""
echo "📊 HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Login successful!"
  TOKEN=$(echo "$BODY" | jq -r '.token' 2>/dev/null)
  if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo "✅ JWT Token received"
    echo "🔑 Token (first 20 chars): ${TOKEN:0:20}..."
  fi
else
  echo "❌ Login failed"
  ERROR=$(echo "$BODY" | jq -r '.error' 2>/dev/null)
  if [ -n "$ERROR" ] && [ "$ERROR" != "null" ]; then
    echo "❌ Error: $ERROR"
  fi
fi

