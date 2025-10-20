#!/bin/bash
# User Path Simulation Test Runner
# This script runs comprehensive user path tests that trace complete user journeys
# from the root of the application through key workflows.

set -e

echo "=================================="
echo "User Path Simulation Test Runner"
echo "=================================="
echo ""

# Colors for output
RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Run the user path tests
echo "📍 Running user path simulation tests..."
echo ""

npm run test:run __tests__/e2e/userPath.simulation.test.tsx

EXIT_CODE=$?

echo ""
echo "=================================="
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ All user path tests passed!${NC}"
else
    echo -e "${YELLOW}⚠ Some user path tests failed (exit code: $EXIT_CODE)${NC}"
    echo "Review the output above for details on which paths need attention."
fi
echo "=================================="
echo ""

echo "User paths tested:"
echo "  1. First-time user onboarding flow"
echo "  2. Keyword research workflow"
echo "  3. View navigation and state persistence"
echo "  4. Settings and API configuration"
echo "  5. Multi-brand workflow"
echo "  6. Error handling and edge cases"
echo "  7. Campaign planning workflow"
echo "  8. Function tracing during user journeys"
echo ""

exit $EXIT_CODE
