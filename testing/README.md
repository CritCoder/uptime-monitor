# End-to-End Testing Suite

This directory contains comprehensive end-to-end tests for the Uptime Monitor application.

## Directory Structure

```
testing/
├── README.md                 # This file
├── config/
│   ├── test.config.js       # Test configuration
│   └── setup.js             # Test setup and teardown
├── specs/
│   ├── auth.test.js         # Authentication tests
│   ├── monitors.test.js     # Monitor management tests
│   ├── alerts.test.js       # Alert configuration tests
│   ├── incidents.test.js    # Incident management tests
│   ├── status-pages.test.js # Status page tests
│   ├── dashboard.test.js    # Dashboard tests
│   └── api.test.js          # API endpoint tests
├── utils/
│   ├── helpers.js           # Test helper functions
│   ├── fixtures.js          # Test data fixtures
│   └── db-helpers.js        # Database helper functions
└── reports/                 # Test reports (generated)
```

## Running Tests

### Run all tests
```bash
npm run test
```

### Run specific test suite
```bash
npm run test:auth
npm run test:monitors
npm run test:alerts
```

### Run tests in headless mode
```bash
npm run test:headless
```

### Generate test report
```bash
npm run test:report
```

## Pre-Deployment Testing

Tests are automatically run before deployment using the pre-deploy script:

```bash
npm run pre-deploy
```

This will:
1. Run all E2E tests
2. Generate coverage report
3. Fail if any test fails (preventing deployment)
4. Create deployment report

## Test Coverage Requirements

- All tests must pass (100%)
- Critical paths must have E2E coverage
- API endpoints must be tested
- User flows must be validated

## Writing New Tests

1. Create test file in `specs/` directory
2. Follow existing test patterns
3. Use helper functions from `utils/`
4. Add test data to `fixtures.js`
5. Update this README with new test descriptions

