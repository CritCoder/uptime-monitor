# Uptime Monitor - Professional Monitoring SaaS

A comprehensive uptime monitoring platform built with Node.js, React, and modern technologies. Monitor websites, APIs, and services with real-time alerts, beautiful status pages, and detailed analytics.

## 🚀 Features

### Core Monitoring
- **Multi-Type Monitoring**: HTTP/HTTPS, Ping, Port, SSL certificates, Domain expiry, Heartbeat
- **Real-time Checks**: Configurable intervals from 30 seconds to 1 hour
- **Global Monitoring**: Check from multiple regions
- **Advanced Retry Logic**: Configurable retry attempts with exponential backoff

### Alerting & Notifications
- **Multiple Channels**: Email, SMS (Twilio), Slack, Discord, Telegram, Webhooks
- **Smart Alerting**: Alert escalation, quiet hours, alert grouping
- **Incident Management**: Automatic incident creation and resolution
- **Status Updates**: Real-time incident updates and notifications

### Status Pages
- **Public Status Pages**: Customizable branding and domains
- **Real-time Updates**: Live status updates via WebSocket
- **Incident Timeline**: Public incident history and updates
- **Subscriber Notifications**: Email subscriptions for status updates

### Analytics & Reporting
- **Uptime Statistics**: 24h, 7d, 30d, 90d uptime tracking
- **Response Time Analysis**: Detailed response time trends
- **Incident Analytics**: MTTR, MTTF, and incident patterns
- **Performance Reports**: Weekly/monthly uptime reports

### Team Collaboration
- **Workspace Management**: Multiple workspaces with role-based access
- **Team Roles**: Admin, Member, Viewer permissions
- **API Access**: RESTful API with authentication tokens
- **Audit Logs**: Track all team actions and changes

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js (ESM modules)
- **PostgreSQL** with Prisma ORM
- **Redis** for queues and caching
- **Bull Queue** for distributed job processing
- **Socket.io** for real-time updates
- **JWT** authentication

### Frontend
- **React 18** with Vite
- **TailwindCSS** for styling
- **Recharts** for data visualization
- **React Query** for data fetching
- **React Hook Form** for forms

### Infrastructure
- **PM2** for process management
- **Caddy** for reverse proxy with auto-SSL
- **Docker** for containerization
- **Nginx** for static file serving

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 13+
- Redis 6+
- PM2 (for production)

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd uptime-monitor
```

2. **Install dependencies**
```bash
npm run setup
```

3. **Configure environment**
```bash
cd server
cp env.example .env
# Edit .env with your configuration
```

4. **Set up the database**
```bash
cd server
npm run db:migrate
npm run db:seed
```

5. **Start the development servers**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Queue Dashboard: http://localhost:3000/admin/queues

### Environment Configuration

Create a `.env` file in the `server` directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/uptime_monitor"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Redis
REDIS_URL="redis://localhost:6379"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@uptime-monitor.com"

# Twilio (SMS)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Telegram
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"

# Webhooks
WEBHOOK_SECRET="your-webhook-secret"

# Client URL
CLIENT_URL="http://localhost:5173"
```

## 🚀 Production Deployment

### Using Docker Compose

1. **Configure environment**
```bash
cp .env.example .env
# Edit .env with production values
```

2. **Start services**
```bash
docker-compose up -d
```

3. **Run database migrations**
```bash
docker-compose exec backend npx prisma migrate deploy
```

### Using PM2

1. **Build the frontend**
```bash
cd client
npm run build
```

2. **Start with PM2**
```bash
pm2 start ecosystem.config.js
```

3. **Configure Caddy**
```bash
# Copy Caddyfile to your Caddy configuration directory
sudo cp Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## 📊 Monitoring Types

### HTTP/HTTPS Monitors
- GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS methods
- Custom headers and request body
- Expected status codes validation
- Keyword presence/absence checking
- SSL certificate verification
- Follow redirects option

### Ping Monitors
- ICMP ping to any IP address
- Latency measurement
- Timeout configuration

### Port Monitors
- TCP port connectivity checks
- Custom port numbers
- Connection timeout handling

### SSL Certificate Monitors
- Certificate expiry monitoring
- Early warning alerts (30, 14, 7 days)
- Certificate chain validation

### Domain Expiry Monitors
- WHOIS-based domain expiry checking
- Multiple TLD support
- Early warning system

### Heartbeat Monitors
- Cron job monitoring
- Expected ping intervals
- Timeout detection

## 🔔 Alert Channels

### Email Alerts
- SMTP configuration
- HTML email templates
- Custom sender addresses

### SMS Alerts (Twilio)
- Phone number validation
- International SMS support
- Rate limiting

### Slack Integration
- Webhook URLs
- Rich message formatting
- Channel-specific alerts

### Discord Integration
- Webhook URLs
- Embed formatting
- Server-specific channels

### Telegram Integration
- Bot token authentication
- Markdown formatting
- Group and channel support

### Webhook Integration
- Custom payload formatting
- Signature verification
- Retry logic

## 📈 API Documentation

### Authentication
All API endpoints require authentication via JWT token or API key.

```bash
# JWT Token
Authorization: Bearer <jwt-token>

# API Key
X-API-Token: <api-token>
```

### Core Endpoints

#### Monitors
```bash
GET    /api/monitors                    # List monitors
POST   /api/monitors                    # Create monitor
GET    /api/monitors/:id                # Get monitor details
PUT    /api/monitors/:id                # Update monitor
DELETE /api/monitors/:id                # Delete monitor
POST   /api/monitors/:id/pause          # Pause monitor
POST   /api/monitors/:id/resume         # Resume monitor
GET    /api/monitors/:id/checks         # Get check history
GET    /api/monitors/:id/stats          # Get uptime stats
```

#### Incidents
```bash
GET    /api/incidents                   # List incidents
GET    /api/incidents/:id               # Get incident details
POST   /api/incidents/:id/acknowledge   # Acknowledge incident
PUT    /api/incidents/:id               # Update incident
POST   /api/incidents/:id/resolve       # Resolve incident
```

#### Alert Contacts
```bash
GET    /api/alerts/contacts             # List alert contacts
POST   /api/alerts/contacts             # Create alert contact
PUT    /api/alerts/contacts/:id         # Update alert contact
DELETE /api/alerts/contacts/:id         # Delete alert contact
POST   /api/alerts/contacts/:id/test    # Test alert contact
```

#### Status Pages
```bash
GET    /api/status-pages                # List status pages
POST   /api/status-pages                # Create status page
PUT    /api/status-pages/:id            # Update status page
DELETE /api/status-pages/:id            # Delete status page
GET    /status/:slug                    # Public status page
```

### WebSocket Events

#### Client → Server
```javascript
socket.emit('join-workspace', workspaceId)
socket.emit('leave-workspace', workspaceId)
```

#### Server → Client
```javascript
socket.on('monitor-update', (data) => {})
socket.on('incident-update', (data) => {})
socket.on('notification', (data) => {})
socket.on('check-result', (data) => {})
```

## 🔧 Development

### Project Structure
```
uptime-monitor/
├── server/                 # Backend API
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middleware/        # Express middleware
│   └── prisma/            # Database schema
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── lib/           # Utilities
├── docker-compose.yml     # Docker configuration
├── ecosystem.config.js    # PM2 configuration
└── Caddyfile             # Reverse proxy config
```

### Database Schema
The application uses Prisma ORM with PostgreSQL. Key models include:

- **User**: User accounts and authentication
- **Workspace**: Team workspaces with role-based access
- **Monitor**: Monitoring targets with configuration
- **Check**: Individual check results and metrics
- **Incident**: Service incidents and status updates
- **AlertContact**: Notification channels and settings
- **StatusPage**: Public status page configuration

### Adding New Monitor Types

1. **Update Prisma schema** (`server/prisma/schema.prisma`)
2. **Add checker function** (`server/services/monitorChecker.js`)
3. **Update frontend forms** (`client/src/pages/CreateMonitorPage.jsx`)
4. **Add validation** (`server/routes/monitors.js`)

### Adding New Alert Channels

1. **Update notification service** (`server/services/notifications.js`)
2. **Add frontend form** (`client/src/pages/AlertsPage.jsx`)
3. **Update validation** (`server/routes/alerts.js`)

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

### Integration Tests
```bash
npm run test:integration
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Join our community Discord

## 🎯 Roadmap

- [ ] Multi-region monitoring
- [ ] Advanced analytics dashboard
- [ ] Mobile app
- [ ] White-label solutions
- [ ] Enterprise SSO
- [ ] Custom check scripts
- [ ] API rate limiting
- [ ] Advanced incident management
- [ ] Performance monitoring
- [ ] Synthetic monitoring

---

Built with ❤️ for developers who care about uptime.
