# **COMPLETE PRODUCTION DEPLOYMENT PROMPT FOR UPTIME MONITORING SAAS**

## **PROJECT OVERVIEW**
Build and deploy a professional uptime monitoring SaaS platform with the following architecture:

### **TECH STACK**
- **Frontend**: React 18 + Vite + TailwindCSS + React Router + React Query + Recharts + Socket.io-client
- **Backend**: Node.js (ESM) + Express.js + Socket.io + Prisma ORM + Bull queues + Redis
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: JWT + Google OAuth (Passport.js)
- **Infrastructure**: PM2 (process manager) + Caddy (reverse proxy with auto-SSL) + Docker support
- **Testing**: Playwright for E2E tests
- **Monitoring**: Bull Board for queue dashboard

### **CORE FEATURES**
- Multi-type monitoring: HTTP/HTTPS, Ping, Port, SSL certificates, Domain expiry, Heartbeat
- Real-time alerting: Email (SMTP), SMS (Twilio), Slack, Discord, Telegram, Webhooks
- Incident management with automatic detection and resolution
- Public customizable status pages with real-time WebSocket updates
- Workspace management with role-based access (Admin, Member, Viewer)
- Analytics dashboard with uptime percentage, response times, and incident tracking
- Subscription/billing system (Stripe integration)
- Screenshot capture for monitored websites
- RESTful API with JWT/API token authentication
- Real-time notifications via Socket.io

---

## **PROJECT STRUCTURE**
```
uptime/
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   ├── pages/                   # Page components (Dashboard, Monitors, etc.)
│   │   ├── contexts/                # React Context (Auth, Workspace, Socket)
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── lib/                     # Utilities (API client, helpers)
│   │   ├── App.jsx                  # Main app with routing
│   │   └── main.jsx                 # Entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile                   # Multi-stage Nginx build
├── server/                          # Node.js backend
│   ├── routes/                      # API routes (auth, monitors, incidents, etc.)
│   ├── services/                    # Business logic
│   │   ├── queue.js                 # Bull queue initialization
│   │   ├── scheduler.js             # Monitor scheduling with node-cron
│   │   ├── monitorChecker.js        # Monitor checking logic
│   │   ├── notifications.js         # Multi-channel alerting
│   │   ├── incidentManager.js       # Incident detection/management
│   │   ├── email.js                 # Email service (Nodemailer)
│   │   ├── screenshot.js            # Screenshot API integration
│   │   └── socket.js                # Socket.io initialization
│   ├── middleware/                  # Auth middleware
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   ├── migrations/              # Migration history
│   │   └── seed.js                  # Seed data
│   ├── config/                      # Configuration files
│   ├── index.js                     # Main server entry point
│   ├── package.json
│   └── Dockerfile                   # Production server image
├── testing/                         # E2E Playwright tests
│   ├── specs/                       # Test specifications
│   ├── run-tests.sh                 # Test runner
│   └── pre-deploy.sh                # Pre-deployment validation
├── docker-compose.yml               # Full stack orchestration
├── ecosystem.config.js              # PM2 configuration
├── Caddyfile                        # Reverse proxy + auto-SSL
├── package.json                     # Workspace root
└── README.md
```

---

## **ENVIRONMENT CONFIGURATION** (.env in server/)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/uptime_monitor"

# JWT
JWT_SECRET="generate-secure-random-string-here"

# Redis (for Bull queues)
REDIS_URL="redis://localhost:6379"
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@your-domain.com"

# Twilio (SMS)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Telegram Bot
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe (Subscriptions)
STRIPE_SECRET_KEY="sk_live_xxx"
STRIPE_PUBLISHABLE_KEY="pk_live_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# Screenshot API
SCREENSHOT_API_URL="https://screenshot.support/api/screenshots"
SCREENSHOT_API_KEY="your-screenshot-api-key"

# Application URLs
CLIENT_URL="https://your-domain.com"
SERVER_URL="https://your-domain.com"
PORT=3000
NODE_ENV="production"
CHECK_REGION="us-east"

# Webhooks
WEBHOOK_SECRET="generate-secure-random-string"
```

---

## **DEPLOYMENT STEPS**

### **METHOD 1: DOCKER COMPOSE (RECOMMENDED FOR QUICK DEPLOYMENT)**

```bash
# 1. Clone and setup
git clone <your-repo-url>
cd uptime

# 2. Create .env file in server/ with production values
cp server/env.example server/.env
nano server/.env  # Edit with production values

# 3. Build and start all services
docker-compose up -d

# 4. Run database migrations
docker-compose exec backend npx prisma migrate deploy

# 5. (Optional) Seed initial data
docker-compose exec backend npx prisma db seed

# 6. Check services
docker-compose ps
docker-compose logs -f
```

**Services running:**
- postgres:5432 (Database)
- redis:6379 (Queue/Cache)
- backend:3000 (API + WebSocket)
- worker (Background jobs)
- frontend:80/443 (Nginx with React build)

---

### **METHOD 2: PM2 + CADDY (RECOMMENDED FOR PRODUCTION VPS)**

```bash
# Prerequisites: Node.js 18+, PostgreSQL 13+, Redis 6+, PM2, Caddy

# 1. Clone repository
git clone <your-repo-url>
cd uptime

# 2. Install all dependencies
npm run setup  # Installs root, server, and client deps

# 3. Setup database
cd server
# Edit .env with production DATABASE_URL
npx prisma migrate deploy
npx prisma generate
npx prisma db seed  # Optional
cd ..

# 4. Build frontend
cd client
npm run build
cd ..

# 5. Configure Caddy
# Edit Caddyfile with your domain
sudo cp Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy

# 6. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow instructions to enable on boot

# 7. Monitor
pm2 status
pm2 logs
pm2 monit
```

**PM2 Processes:**
- `uptime-server` (1 instance, cluster mode) - Main API server
- `uptime-worker` (2 instances, cluster mode) - Background job processors

---

### **METHOD 3: MANUAL VPS SETUP (FULL CONTROL)**

#### **Server Setup (Ubuntu 22.04)**

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql
CREATE DATABASE uptime_monitor;
CREATE USER uptime WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE uptime_monitor TO uptime;
\q

# 4. Install Redis
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# 5. Install PM2 globally
sudo npm install -g pm2

# 6. Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

#### **Application Deployment**

```bash
# 7. Setup application directory
sudo mkdir -p /var/www/uptime
sudo chown $USER:$USER /var/www/uptime
cd /var/www/uptime

# 8. Clone and install
git clone <your-repo-url> .
npm run setup

# 9. Configure environment
cd server
cp env.example .env
nano .env  # Edit with production values

# 10. Database setup
npx prisma migrate deploy
npx prisma generate

# 11. Build frontend
cd ../client
npm run build

# 12. Configure Caddy
cd ..
sudo nano /etc/caddy/Caddyfile
# Paste Caddyfile content, replace example.com with your domain
sudo systemctl reload caddy

# 13. Create PM2 ecosystem file
nano ecosystem.config.js
# Use the ecosystem.config.js from repo

# 14. Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow instructions

# 15. Setup logs directory
mkdir -p logs
```

#### **Caddy Configuration** (/etc/caddy/Caddyfile)

```
your-domain.com {
    tls your-email@domain.com

    # API routes
    handle /api/* {
        reverse_proxy localhost:3000
    }

    # WebSocket
    handle /socket.io/* {
        reverse_proxy localhost:3000
    }

    # Public status pages
    handle /status/* {
        reverse_proxy localhost:3000
    }

    # Static files (React)
    handle {
        root * /var/www/uptime/client/dist
        try_files {path} /index.html
        file_server

        header /index.html {
            Cache-Control "no-cache, no-store, must-revalidate"
        }

        header /assets/* {
            Cache-Control "public, max-age=31536000, immutable"
        }
    }
}
```

---

## **PRE-DEPLOYMENT TESTING**

```bash
# Run comprehensive pre-deployment tests
npm run pre-deploy

# This will:
# 1. Check Git status
# 2. Verify dependencies
# 3. Run linter
# 4. Build client
# 5. Start test servers
# 6. Run Playwright E2E tests
# 7. Generate test report

# View test report
npm run test:report
```

---

## **DATABASE SCHEMA (Key Models)**

Prisma schema includes:
- **User**: Authentication, profiles, subscriptions
- **Workspace**: Team workspaces with RBAC
- **Monitor**: Monitoring targets (HTTP, Ping, Port, SSL, Domain, Heartbeat)
- **Check**: Individual check results with metrics
- **Incident**: Downtime incidents with timeline
- **AlertContact**: Notification channels (Email, SMS, Slack, Discord, etc.)
- **StatusPage**: Public status pages with custom branding
- **Subscription**: Stripe subscriptions and billing
- **Integration**: Workspace integrations (Slack, Discord, PagerDuty)

---

## **MONITORING & MAINTENANCE**

```bash
# PM2 Commands
pm2 status           # Check process status
pm2 logs             # View logs
pm2 restart all      # Restart all processes
pm2 reload all       # Zero-downtime reload
pm2 monit            # Real-time monitoring

# Database Maintenance
cd server
npx prisma studio    # GUI database browser
npx prisma migrate deploy  # Run migrations

# Backup Database
pg_dump uptime_monitor > backup-$(date +%Y%m%d).sql

# View Queue Dashboard
# Access: https://your-domain.com/admin/queues

# System Monitoring
htop                 # CPU/Memory usage
df -h                # Disk usage
systemctl status caddy redis-server postgresql
```

---

## **CONTINUOUS DEPLOYMENT**

```bash
# Standard deployment workflow
ssh user@your-server
cd /var/www/uptime
git pull origin main
npm run setup        # Update dependencies if needed
cd client && npm run build && cd ..
pm2 reload all       # Zero-downtime restart
```

---

## **SECURITY CHECKLIST**

- ✅ Use strong JWT_SECRET (min 64 chars)
- ✅ Enable HTTPS with Caddy auto-SSL
- ✅ Configure firewall (ufw): Allow 80, 443, 22 only
- ✅ Setup PostgreSQL authentication
- ✅ Use Redis password in production
- ✅ Enable rate limiting (configured in server/index.js)
- ✅ Use helmet.js for security headers
- ✅ Validate all inputs with Joi/Zod
- ✅ Setup regular database backups
- ✅ Enable PM2 monitoring and logs rotation
- ✅ Use environment variables for all secrets
- ✅ Configure CORS properly
- ✅ Setup fail2ban for SSH protection

---

## **SCALING CONSIDERATIONS**

- **Horizontal Scaling**: Add more PM2 instances (cluster mode)
- **Database**: Setup PostgreSQL replication/connection pooling
- **Redis**: Use Redis Cluster for high availability
- **CDN**: Serve static assets via CDN (Cloudflare, etc.)
- **Monitoring Regions**: Deploy workers in multiple regions
- **Load Balancing**: Add Nginx/HAProxy for multi-server setup
- **Queue Workers**: Scale worker instances based on queue load

---

## **TROUBLESHOOTING**

```bash
# Server not starting
pm2 logs uptime-server --lines 100
# Check database connection in .env

# Workers not processing
pm2 logs uptime-worker --lines 100
redis-cli ping  # Verify Redis connection

# Frontend 404 errors
# Check Caddyfile configuration
# Verify client/dist exists

# Database errors
cd server && npx prisma migrate status
npx prisma generate

# Port conflicts
sudo lsof -i :3000  # Find process using port
pm2 delete all && pm2 start ecosystem.config.js
```

---

## **API ENDPOINTS**

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth
- `GET /api/dashboard` - Dashboard stats
- `GET /api/monitors` - List monitors
- `POST /api/monitors` - Create monitor
- `GET /api/monitors/:id` - Monitor details
- `GET /api/incidents` - List incidents
- `POST /api/alerts/contacts` - Create alert contact
- `GET /api/status-pages` - List status pages
- `GET /status/public/:slug` - Public status page
- `POST /api/subscription/create-checkout` - Stripe checkout

---

## **MONITORING QUEUE WORKERS**

The application uses Bull queues for:
- **Monitor checks** (scheduled at configured intervals)
- **Alert notifications** (email, SMS, webhooks)
- **Incident detection** (automatic based on failed checks)
- **Screenshot capture** (periodic website screenshots)
- **Report generation** (uptime reports)

Access Bull Board at: `https://your-domain.com/admin/queues`

---

This comprehensive deployment guide ensures a production-ready uptime monitoring platform with high availability, security, and scalability. All components are battle-tested and follow industry best practices.
