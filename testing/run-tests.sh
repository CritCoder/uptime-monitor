#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Starting End-to-End Test Suite ===${NC}\n"

# Check if servers are running
check_servers() {
    echo "Checking if servers are running..."
    
    # Check client server
    if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${RED}❌ Client server is not running on port 5173${NC}"
        echo "Please start the client server with: cd client && npm run dev"
        return 1
    fi
    echo -e "${GREEN}✓ Client server is running${NC}"
    
    # Check API server
    if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠ API server health check failed (this is okay if endpoint doesn't exist)${NC}"
    else
        echo -e "${GREEN}✓ API server is running${NC}"
    fi
    
    return 0
}

# Run tests
run_tests() {
    echo -e "\n${YELLOW}Running Playwright tests...${NC}\n"
    
    # Run Playwright tests
    npx playwright test testing/specs/ \
        --reporter=list,html,json \
        --output=testing/reports \
        "$@"
    
    TEST_EXIT_CODE=$?
    
    if [ $TEST_EXIT_CODE -eq 0 ]; then
        echo -e "\n${GREEN}✓ All tests passed!${NC}"
        return 0
    else
        echo -e "\n${RED}❌ Some tests failed!${NC}"
        return 1
    fi
}

# Generate report
generate_report() {
    echo -e "\n${YELLOW}Generating test report...${NC}"
    
    if [ -f "testing/reports/results.json" ]; then
        echo -e "${GREEN}✓ Test results saved to testing/reports/${NC}"
    fi
    
    if [ -f "playwright-report/index.html" ]; then
        echo -e "${GREEN}✓ HTML report available at playwright-report/index.html${NC}"
        
        # Open report in browser if not in CI
        if [ -z "$CI" ]; then
            echo -e "${YELLOW}Opening HTML report in browser...${NC}"
            open playwright-report/index.html 2>/dev/null || \
            xdg-open playwright-report/index.html 2>/dev/null || \
            echo "Please open playwright-report/index.html manually"
        fi
    fi
}

# Main execution
main() {
    # Check servers
    if ! check_servers; then
        exit 1
    fi
    
    # Create reports directory
    mkdir -p testing/reports/screenshots
    
    # Run tests
    if run_tests "$@"; then
        generate_report
        echo -e "\n${GREEN}=== Test Suite Completed Successfully ===${NC}\n"
        exit 0
    else
        generate_report
        echo -e "\n${RED}=== Test Suite Failed ===${NC}\n"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"

