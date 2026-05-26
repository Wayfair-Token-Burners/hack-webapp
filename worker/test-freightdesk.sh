#!/bin/bash

# FreightDesk AI Agent - Test Script

echo "🚛 FreightDesk AI Agent Test Suite"
echo "===================================="
echo ""

BASE_URL="http://localhost:3000"

# Test 1: Queue endpoint
echo "📋 Test 1: GET /api/queue"
curl -s "$BASE_URL/api/queue" | jq '.total, .exceptions[0].exception_id' 2>/dev/null || echo "Server not running or jq not installed"
echo ""

# Test 2: Run HERO-1 (Damage + Carrier Liability)
echo "🔧 Test 2: HERO-1 - Damage with carrier fault"
curl -s -N "$BASE_URL/api/exception/HERO-1/run" | head -20
echo ""

# Test 3: Run HERO-4 (Low confidence → Escalate)
echo "⚠️  Test 3: HERO-4 - Low confidence escalation"
curl -s -N "$BASE_URL/api/exception/HERO-4/run" | grep -E 'step|disposition_code' | head -10
echo ""

echo "✅ Tests complete! Check SSE output above."
echo ""
echo "To run full agent:"
echo "  curl http://localhost:3000/api/exception/HERO-1/run"
