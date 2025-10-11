# Testing Quick Start Guide

## 🚀 Quick Commands

### Before Every Production Deploy
```bash
npm run pre-deploy
```
This is **mandatory** - it runs all tests and blocks deployment if anything fails.

### Run Tests Locally
```bash
# Run all tests with browser visible
npm run test

# Run all tests headless (faster)
npm run test:headless

# Run specific test suites
npm run test:auth
npm run test:monitors
npm run test:dashboard
```

### View Test Results
```bash
npm run test:report
```

### Interactive Testing (for debugging)
```bash
npm run test:ui
```

## 📋 Pre-Deploy Checklist

✅ **Step 1:** Ensure both servers are running
```bash
# Terminal 1
cd client && npm run dev

# Terminal 2
cd server && npm start
```

✅ **Step 2:** Run pre-deployment tests
```bash
npm run pre-deploy
```

✅ **Step 3:** Wait for all tests to pass (100%)

✅ **Step 4:** Review any failures in the HTML report

✅ **Step 5:** If all tests pass, deploy to production

## 🔧 Quick Fixes

### Registration not working?
✓ Fixed - API now returns `success: true` field

### Need to test locally?
```bash
# Start servers first
cd client && npm run dev &
cd server && npm start &

# Then run tests
npm run test
```

### Tests failing?
```bash
# Check if servers are running
curl http://localhost:5173
curl http://localhost:3000

# Restart database
npm run db:migrate
npm run db:generate
```

## 📁 Test Structure

```
testing/
├── specs/           # Test files
│   ├── auth.test.js
│   ├── monitors.test.js
│   └── dashboard.test.js
├── utils/           # Helper functions
├── config/          # Test configuration
├── reports/         # Generated reports
└── run-tests.sh     # Test runner
```

## 🎯 What Gets Tested

### Authentication (12 tests)
- Registration, login, logout
- Password validation
- Email verification
- Session persistence

### Monitors (13 tests)
- CRUD operations
- Pause/resume
- Search/filter
- Statistics

### Dashboard (10 tests)
- Summary cards
- Navigation
- Metrics display

## ⚠️ Important Rules

1. **Never deploy without running tests**
2. **All tests must pass (100%)**
3. **Review test report if any fail**
4. **Add tests for new features**
5. **Keep test data separate from production**

## 🚨 Emergency Only

If you absolutely must deploy without tests (not recommended):
```bash
ssh root@rollout.site
cd tryweb3
git pull origin working-anthropic-flow
yarn build
pm2 restart all
```

**Use this only in emergencies! You're bypassing all safety checks.**

## 📞 Need Help?

1. Check `testing/README.md` for detailed docs
2. Check `DEPLOYMENT.md` for full deployment guide
3. View test reports in `testing/reports/html/`
4. Check test logs for specific errors

