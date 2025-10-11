# Deployment Guide

This guide explains how to deploy to production with automated testing.

## Pre-Deployment Testing

Before deploying to production, **always** run the pre-deployment script:

```bash
npm run pre-deploy
```

This will:
1. ✅ Check Git status
2. ✅ Verify dependencies
3. ✅ Run linter
4. ✅ Build the client
5. ✅ Start test servers
6. ✅ Run all E2E tests
7. ✅ Generate test reports

**⚠️ IMPORTANT: Deployment will be blocked if any tests fail!**

## Running Tests Locally

### Run all tests
```bash
npm run test
```

### Run tests in headless mode (faster)
```bash
npm run test:headless
```

### Run specific test suites
```bash
npm run test:auth       # Authentication tests
npm run test:monitors   # Monitor tests
npm run test:dashboard  # Dashboard tests
```

### View test results
```bash
npm run test:report
```

### Interactive test mode (for debugging)
```bash
npm run test:ui
```

## Production Deployment

### Step 1: Run Pre-Deploy Tests
```bash
npm run pre-deploy
```

Wait for all tests to pass. This ensures:
- All features work correctly
- No regressions introduced
- API endpoints functional
- UI components working
- Authentication flows secure

### Step 2: Deploy to Production
If all tests pass, deploy using:

```bash
ssh root@rollout.site
cd tryweb3
git pull origin working-anthropic-flow
yarn build
pm2 restart all
```

Or use the automated deploy command:
```bash
npm run deploy
```

## Test Coverage

Current test suites:

### 1. Authentication Tests (`testing/specs/auth.test.js`)
- ✓ User registration
- ✓ Login/logout
- ✓ Password validation
- ✓ Email verification
- ✓ Forgot password flow
- ✓ Session persistence

### 2. Monitor Tests (`testing/specs/monitors.test.js`)
- ✓ Create monitors (HTTP, HTTPS, Ping, Port)
- ✓ Edit monitors
- ✓ Delete monitors
- ✓ Pause/resume monitors
- ✓ View monitor details
- ✓ Monitor statistics
- ✓ Search and filter

### 3. Dashboard Tests (`testing/specs/dashboard.test.js`)
- ✓ Summary cards display
- ✓ Recent incidents
- ✓ Navigation
- ✓ Status overview
- ✓ Response time metrics

## Continuous Integration

### GitHub Actions Setup (Optional)
Create `.github/workflows/test.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm run setup
        
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Run tests
        run: npm run test:headless
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests failing locally?

1. **Ensure servers are running:**
   ```bash
   # Terminal 1: Start client
   cd client && npm run dev
   
   # Terminal 2: Start server
   cd server && npm start
   ```

2. **Check database:**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

3. **Clear browser data:**
   ```bash
   rm -rf ~/.cache/ms-playwright
   npx playwright install
   ```

### Tests failing in CI?

1. Check browser versions are up to date
2. Ensure environment variables are set
3. Verify database is seeded with test data
4. Check network/firewall settings

## Best Practices

1. **Always run `npm run pre-deploy` before deploying**
2. **Never skip tests** - they catch critical bugs
3. **Review test reports** if any tests fail
4. **Add new tests** for new features
5. **Keep test data isolated** from production

## Test Reports

After running tests, reports are available:

- **HTML Report**: `testing/reports/html/index.html`
- **JSON Report**: `testing/reports/results.json`
- **Screenshots**: `testing/reports/screenshots/` (on failure)

## Adding New Tests

1. Create test file in `testing/specs/`
2. Import helpers from `testing/utils/helpers.js`
3. Use fixtures from `testing/utils/fixtures.js`
4. Follow existing test patterns
5. Run and verify tests pass
6. Update this documentation

## Emergency Deployment (USE WITH CAUTION)

If you absolutely must deploy without running tests:

```bash
# NOT RECOMMENDED - Only for emergencies
ssh root@rollout.site
cd tryweb3
git pull origin working-anthropic-flow
yarn build
pm2 restart all
```

**⚠️ This bypasses all safety checks and should only be used in emergency situations!**

