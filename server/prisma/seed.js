import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 12);
  
  const user = await prisma.user.create({
    data: {
      email: 'demo@uptime-monitor.com',
      password: hashedPassword,
      name: 'Demo User',
      timezone: 'UTC',
      plan: 'pro',
      isEmailVerified: true
    }
  });

  // Create demo workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Demo Workspace',
      slug: 'demo-workspace'
    }
  });

  // Add user as admin to workspace
  await prisma.workspaceMember.create({
    data: {
      userId: user.id,
      workspaceId: workspace.id,
      role: 'admin'
    }
  });

  // Create demo monitors
  const monitors = [
    {
      name: 'Google',
      type: 'http',
      url: 'https://www.google.com',
      interval: 300,
      timeout: 30,
      workspaceId: workspace.id,
      status: 'up',
      isActive: true
    },
    {
      name: 'GitHub',
      type: 'http',
      url: 'https://github.com',
      interval: 300,
      timeout: 30,
      workspaceId: workspace.id,
      status: 'up',
      isActive: true
    },
    {
      name: 'Cloudflare DNS',
      type: 'ping',
      ip: '1.1.1.1',
      interval: 300,
      timeout: 30,
      workspaceId: workspace.id,
      status: 'up',
      isActive: true
    },
    {
      name: 'SSH Port Check',
      type: 'port',
      ip: 'github.com',
      port: 22,
      interval: 600,
      timeout: 30,
      workspaceId: workspace.id,
      status: 'up',
      isActive: true
    }
  ];

  for (const monitorData of monitors) {
    await prisma.monitor.create({
      data: monitorData
    });
  }

  // Create demo alert contacts
  const alertContacts = [
    {
      name: 'Email Alert',
      type: 'email',
      value: 'demo@uptime-monitor.com',
      workspaceId: workspace.id
    },
    {
      name: 'Slack Webhook',
      type: 'slack',
      value: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
      workspaceId: workspace.id
    }
  ];

  for (const contactData of alertContacts) {
    await prisma.alertContact.create({
      data: contactData
    });
  }

  // Create demo status page
  const statusPage = await prisma.statusPage.create({
    data: {
      name: 'Demo Status Page',
      slug: 'demo-status',
      description: 'This is a demo status page',
      workspaceId: workspace.id,
      isPublic: true
    }
  });

  // Add monitors to status page
  const createdMonitors = await prisma.monitor.findMany({
    where: { workspaceId: workspace.id }
  });

  for (let i = 0; i < createdMonitors.length; i++) {
    await prisma.statusPageMonitor.create({
      data: {
        statusPageId: statusPage.id,
        monitorId: createdMonitors[i].id,
        displayOrder: i
      }
    });
  }

  // Create demo API token
  await prisma.apiToken.create({
    data: {
      token: 'demo-api-token-12345',
      name: 'Demo API Token',
      userId: user.id,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    }
  });

  // Create some demo checks
  const demoChecks = [];
  for (let i = 0; i < 100; i++) {
    const checkTime = new Date(Date.now() - i * 5 * 60 * 1000); // Every 5 minutes
    const isUp = Math.random() > 0.1; // 90% uptime
    
    demoChecks.push({
      monitorId: createdMonitors[0].id,
      status: isUp ? 'up' : 'down',
      statusCode: isUp ? 200 : 500,
      responseTime: isUp ? Math.floor(Math.random() * 1000) + 100 : null,
      errorMessage: isUp ? null : 'Connection timeout',
      checkedAt: checkTime,
      region: 'us-east'
    });
  }

  await prisma.check.createMany({
    data: demoChecks
  });

  console.log('✅ Database seeded successfully');
  console.log('📧 Demo user: demo@uptime-monitor.com');
  console.log('🔑 Demo password: demo123');
  console.log('🔗 Demo status page: http://localhost:3000/status/demo-status');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
