import cron from 'node-cron';
import { prisma } from '../index.js';
import { scheduleMonitorCheck } from './queue.js';

// Start monitor scheduler
export function startMonitorScheduler(queues) {
  console.log('🕐 Starting monitor scheduler...');

  // Schedule active monitors every minute
  cron.schedule('* * * * *', async () => {
    try {
      await scheduleActiveMonitors();
    } catch (error) {
      console.error('Monitor scheduling error:', error);
    }
  });

  // Cleanup old data daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      await cleanupOldData();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  // Calculate uptime statistics hourly
  cron.schedule('0 * * * *', async () => {
    try {
      await calculateUptimeStats();
    } catch (error) {
      console.error('Uptime calculation error:', error);
    }
  });

  // Check SSL certificates daily
  cron.schedule('0 3 * * *', async () => {
    try {
      await checkSSLCertificates();
    } catch (error) {
      console.error('SSL check error:', error);
    }
  });

  // Check domain expiry weekly
  cron.schedule('0 4 * * 0', async () => {
    try {
      await checkDomainExpiry();
    } catch (error) {
      console.error('Domain expiry check error:', error);
    }
  });

  console.log('✅ Monitor scheduler started');
}

// Schedule active monitors
async function scheduleActiveMonitors() {
  try {
    const monitors = await prisma.monitor.findMany({
      where: {
        isActive: true,
        status: { not: 'maintenance' }
      },
      include: {
        maintenanceWindows: {
          where: {
            startTime: { lte: new Date() },
            endTime: { gte: new Date() }
          }
        }
      }
    });

    for (const monitor of monitors) {
      // Skip if in maintenance window
      if (monitor.maintenanceWindows.length > 0) {
        await prisma.monitor.update({
          where: { id: monitor.id },
          data: { status: 'maintenance' }
        });
        continue;
      }

      // Calculate next check time based on interval
      const now = new Date();
      const lastCheck = monitor.lastCheckAt || new Date(0);
      const intervalMs = monitor.interval * 1000;
      const timeSinceLastCheck = now.getTime() - lastCheck.getTime();

      if (timeSinceLastCheck >= intervalMs) {
        await scheduleMonitorCheck(monitor.id);
      }
    }
  } catch (error) {
    console.error('Failed to schedule monitors:', error);
  }
}

// Cleanup old data
async function cleanupOldData() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // Keep last 90 days

    // Delete old checks
    const deletedChecks = await prisma.check.deleteMany({
      where: {
        checkedAt: { lt: cutoffDate }
      }
    });

    // Delete old resolved incidents
    const deletedIncidents = await prisma.incident.deleteMany({
      where: {
        status: 'resolved',
        resolvedAt: { lt: cutoffDate }
      }
    });

    console.log(`🧹 Cleaned up ${deletedChecks.count} old checks and ${deletedIncidents.count} old incidents`);
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

// Calculate uptime statistics
async function calculateUptimeStats() {
  try {
    const monitors = await prisma.monitor.findMany({
      where: { isActive: true }
    });

    for (const monitor of monitors) {
      // Calculate 24h uptime
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const checks = await prisma.check.findMany({
        where: {
          monitorId: monitor.id,
          checkedAt: { gte: yesterday }
        }
      });

      const upChecks = checks.filter(check => check.status === 'up');
      const uptimePercentage = checks.length > 0 ? (upChecks.length / checks.length) * 100 : 0;

      // Calculate average response time
      const avgResponseTime = upChecks.length > 0 
        ? upChecks.reduce((sum, check) => sum + (check.responseTime || 0), 0) / upChecks.length 
        : 0;

      await prisma.monitor.update({
        where: { id: monitor.id },
        data: {
          uptimePercentage: Math.round(uptimePercentage * 100) / 100,
          avgResponseTime: Math.round(avgResponseTime)
        }
      });
    }

    console.log('📊 Uptime statistics calculated');
  } catch (error) {
    console.error('Failed to calculate uptime stats:', error);
  }
}

// Check SSL certificates
async function checkSSLCertificates() {
  try {
    const sslMonitors = await prisma.monitor.findMany({
      where: {
        type: 'ssl',
        isActive: true
      }
    });

    for (const monitor of sslMonitors) {
      try {
        // This would use a real SSL certificate check
        // For now, we'll just schedule a check
        await scheduleMonitorCheck(monitor.id);
      } catch (error) {
        console.error(`SSL check failed for monitor ${monitor.id}:`, error);
      }
    }

    console.log('🔒 SSL certificate checks completed');
  } catch (error) {
    console.error('SSL certificate check failed:', error);
  }
}

// Check domain expiry
async function checkDomainExpiry() {
  try {
    const domainMonitors = await prisma.monitor.findMany({
      where: {
        type: 'domain',
        isActive: true
      }
    });

    for (const monitor of domainMonitors) {
      try {
        // This would use a real domain expiry check
        // For now, we'll just schedule a check
        await scheduleMonitorCheck(monitor.id);
      } catch (error) {
        console.error(`Domain expiry check failed for monitor ${monitor.id}:`, error);
      }
    }

    console.log('🌐 Domain expiry checks completed');
  } catch (error) {
    console.error('Domain expiry check failed:', error);
  }
}
