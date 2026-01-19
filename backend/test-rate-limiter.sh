#!/bin/bash

# Rate Limiter Test Script
# This script tests the rate limiter reset functionality

echo "🧪 Rate Limiter Reset Test"
echo "================================"
echo ""

# Configuration
API_URL="http://localhost:3001"
ENDPOINT="/api/submissions/questions/test-question-id/run"
TOKEN="your-jwt-token-here"  # Replace with actual token

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📋 Test Configuration:"
echo "   API URL: $API_URL"
echo "   Endpoint: $ENDPOINT"
echo "   Environment: Development (1000 req/min)"
echo ""

# Test 1: Rapid requests within limit
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Sending 5 requests rapidly (should all succeed)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for i in {1..5}; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$API_URL$ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"code":"print(1)","language":"python","teamId":"test"}')
  
  if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓${NC} Request $i: Success (HTTP $HTTP_CODE)"
  else
    echo -e "${RED}✗${NC} Request $i: Failed (HTTP $HTTP_CODE)"
  fi
  sleep 0.1
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Check rate limit headers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

RESPONSE=$(curl -s -i \
  -X POST "$API_URL$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"code":"print(1)","language":"python","teamId":"test"}')

echo "Rate Limit Headers:"
echo "$RESPONSE" | grep -i "ratelimit" || echo "No rate limit headers found"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Production limit simulation (10 requests)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "${YELLOW}Note: In development, limit is 1000/min, so this won't trigger rate limit${NC}"
echo "To test production limits, set NODE_ENV=production and restart backend"
echo ""

for i in {1..12}; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$API_URL$ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"code":"print(1)","language":"python","teamId":"test"}')
  
  if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓${NC} Request $i: Success (HTTP $HTTP_CODE)"
  elif [ "$HTTP_CODE" == "429" ]; then
    echo -e "${RED}✗${NC} Request $i: Rate Limited (HTTP $HTTP_CODE)"
    
    # Get the reset time from response
    RESET_INFO=$(curl -s \
      -X POST "$API_URL$ENDPOINT" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{"code":"print(1)","language":"python","teamId":"test"}')
    
    echo "   Reset Info: $RESET_INFO"
  else
    echo -e "${YELLOW}⚠${NC} Request $i: Unexpected (HTTP $HTTP_CODE)"
  fi
  sleep 0.1
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: Manual rate limit test (requires production mode)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To test rate limit reset:"
echo "1. Set NODE_ENV=production in backend/.env"
echo "2. Restart backend: cd backend && npm run dev"
echo "3. Run this script again"
echo "4. After hitting limit (10 requests), wait 61 seconds"
echo "5. Try again - should succeed"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Test Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  • Development limit: 1000 requests/minute"
echo "  • Production limit: 10 requests/minute"
echo "  • Window: 60 seconds (resets automatically)"
echo "  • Headers: RateLimit-* headers included in response"
echo "  • Error response includes reset time and countdown"
echo ""
