# Testing Flow Diagram

## 🔄 Pre-Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    npm run pre-deploy                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  1. Check Git Status   │
              │     Uncommitted?       │
              └──────────┬─────────────┘
                         │ Clean ✓
                         ▼
              ┌────────────────────────┐
              │  2. Install Dependencies│
              │   node_modules present? │
              └──────────┬─────────────┘
                         │ Installed ✓
                         ▼
              ┌────────────────────────┐
              │    3. Run Linter       │
              │   Code quality check   │
              └──────────┬─────────────┘
                         │ Pass ✓
                         ▼
              ┌────────────────────────┐
              │    4. Build Client     │
              │  Production build OK?  │
              └──────────┬─────────────┘
                         │ Success ✓
                         ▼
              ┌────────────────────────┐
              │  5. Start Test Servers │
              │   Client: port 5173    │
              │   Server: port 3000    │
              └──────────┬─────────────┘
                         │ Running ✓
                         ▼
              ┌────────────────────────┐
              │   6. Run E2E Tests     │
              │      45 Tests          │
              └──────────┬─────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│   ALL PASS ✅    │          │  ANY FAIL ❌     │
│  100% Success    │          │  Block Deploy    │
└────────┬─────────┘          └────────┬─────────┘
         │                              │
         │                              │
         ▼                              ▼
┌──────────────────┐          ┌──────────────────┐
│ ✓ Ready to Deploy│          │  Fix Issues!     │
│   Generate Report│          │  Review Report   │
│   Show Commands  │          │  Run Again       │
└──────────────────┘          └──────────────────┘
         │
         ▼
┌──────────────────┐
│  Deploy to Prod  │
│  ssh rollout.site│
│  git pull        │
│  yarn build      │
│  pm2 restart all │
└──────────────────┘
```

## 📋 Test Execution Flow

```
┌────────────────────────────────────────────────────────────┐
│                    npm run test                             │
└──────────────────────┬─────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  Launch Playwright Browser    │
        │     (Chromium by default)     │
        └──────────────┬────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│  Auth Tests (12) │    │ Monitor Tests    │
│                  │    │     (13)         │
│ • Registration   │    │ • Create HTTP    │
│ • Login/Logout   │    │ • Edit Monitor   │
│ • Validation     │    │ • Delete         │
│ • Sessions       │    │ • Pause/Resume   │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Dashboard Tests (10)  │
        │                        │
        │ • Summary Cards        │
        │ • Navigation           │
        │ • Metrics Display      │
        └──────────┬─────────────┘
                   │
                   ▼
        ┌────────────────────────┐
        │ Integration Tests (10) │
        │                        │
        │ • Full User Journey    │
        │ • Route Protection     │
        │ • Error Handling       │
        │ • Responsive Design    │
        └──────────┬─────────────┘
                   │
                   ▼
        ┌────────────────────────┐
        │   Generate Reports     │
        │                        │
        │ • HTML Report          │
        │ • JSON Results         │
        │ • Screenshots (fails)  │
        └──────────┬─────────────┘
                   │
       ┌───────────┴──────────┐
       │                      │
       ▼                      ▼
┌─────────────┐      ┌──────────────┐
│  All Pass ✅│      │  Some Fail ❌│
│  Exit 0     │      │  Exit 1      │
└─────────────┘      └──────────────┘
```

## 🎯 Test Categories

```
┌─────────────────────────────────────────────────────────┐
│                     45 E2E Tests                         │
└────────────────────┬────────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┬──────────────┐
     │               │               │              │
     ▼               ▼               ▼              ▼
┌──────────┐  ┌───────────┐  ┌──────────┐  ┌────────────┐
│   Auth   │  │  Monitors │  │Dashboard │  │Integration │
│    12    │  │     13    │  │    10    │  │     10     │
└──────────┘  └───────────┘  └──────────┘  └────────────┘
     │               │               │              │
     │               │               │              │
     ▼               ▼               ▼              ▼
┌──────────┐  ┌───────────┐  ┌──────────┐  ┌────────────┐
│Register  │  │Create     │  │Summary   │  │User        │
│Login     │  │Edit       │  │Cards     │  │Journey     │
│Logout    │  │Delete     │  │Navigation│  │Routes      │
│Validate  │  │Search     │  │Metrics   │  │Errors      │
│Session   │  │Filter     │  │Refresh   │  │Mobile      │
└──────────┘  └───────────┘  └──────────┘  └────────────┘
```

## 🛠️ Helper Functions Flow

```
┌────────────────────────────────────────────────┐
│            testing/utils/helpers.js             │
└───────────────────┬────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌──────────┐  ┌─────────┐  ┌──────────┐
│  Auth    │  │ Monitor │  │  Utils   │
│ Helpers  │  │ Helpers │  │ Helpers  │
└──────────┘  └─────────┘  └──────────┘
     │             │             │
     ▼             ▼             ▼
• login()    • createMonitor()   • waitForNetworkIdle()
• register() • deleteMonitor()   • waitForToast()
• logout()   • isVisible()       • takeScreenshot()
                                 • generateEmail()
                                 • navigateTo()
```

## 📊 Report Generation

```
Test Execution
      │
      ▼
┌─────────────┐
│  Test Run   │
│  Complete   │
└──────┬──────┘
       │
   ┌───┴────┬─────────┬──────────┐
   │        │         │          │
   ▼        ▼         ▼          ▼
┌──────┐ ┌─────┐ ┌────────┐ ┌─────────┐
│ HTML │ │JSON │ │Screenshots│ │Video  │
│Report│ │Data │ │(failures) │ │(fails)│
└───┬──┘ └──┬──┘ └────┬───┘ └────┬────┘
    │       │         │          │
    └───────┴─────────┴──────────┘
                │
                ▼
        ┌───────────────┐
        │  testing/     │
        │  reports/     │
        └───────────────┘
```

## 🚀 Quick Commands Reference

```bash
# Development Testing
npm run test              # Run all tests (visible)
npm run test:headless     # Run all tests (fast)
npm run test:ui           # Interactive mode

# Specific Test Suites
npm run test:auth         # Auth tests only
npm run test:monitors     # Monitor tests only
npm run test:dashboard    # Dashboard tests only

# Deployment
npm run pre-deploy        # MANDATORY before deploy
npm run deploy            # Test + deploy flow

# Reports
npm run test:report       # View HTML report
```

## ✅ Success Flow

```
Developer                Pre-Deploy              Production
    │                         │                       │
    │  npm run pre-deploy     │                       │
    │─────────────────────────>│                       │
    │                         │                       │
    │                         │  Run All Tests        │
    │                         │  45 Tests             │
    │                         │                       │
    │  ✅ All Pass            │                       │
    │<─────────────────────────│                       │
    │                         │                       │
    │  Deploy Command         │                       │
    │─────────────────────────┼──────────────────────>│
    │                         │                       │
    │                         │  git pull             │
    │                         │  yarn build           │
    │                         │  pm2 restart          │
    │                         │                       │
    │  ✅ Deployed            │                       │
    │<──────────────────────────────────────────────────│
```

## ❌ Failure Flow

```
Developer                Pre-Deploy              Production
    │                         │                       │
    │  npm run pre-deploy     │                       │
    │─────────────────────────>│                       │
    │                         │                       │
    │                         │  Run All Tests        │
    │                         │  ❌ Test #23 Failed   │
    │                         │                       │
    │  ❌ BLOCKED             │                       │
    │<─────────────────────────│                       │
    │                         │                       │
    │  Fix Issues             │                       │
    │  Review Report          │                       │
    │                         │                       │
    │  npm run pre-deploy     │                       │
    │─────────────────────────>│                       │
    │                         │                       │
    │  ✅ All Pass            │                       │
    │<─────────────────────────│                       │
    │                         │                       │
    │  Now Deploy             │                       │
    │─────────────────────────┼──────────────────────>│
```

---

**Remember: NEVER deploy without running `npm run pre-deploy` first! 🚫🚀**

