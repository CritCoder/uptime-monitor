import Queue from 'bull';
import Redis from 'redis';
import { prisma } from '../index.js';
import { checkMonitor } from './monitorChecker.js';
import { handleStatusChange } from './incidentManager.js';

// Redis connection
const redis = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.on('error', (err) => console.error('Redis Client Error', err));
redis.connect();

// Create queues
export const monitorQueue = new Queue('monitor checks', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  }
});

export const notificationQueue = new Queue('notifications', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  }
});

export const cleanupQueue = new Queue('cleanup', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  }
});

// Process monitor checks
monitorQueue.process('check-monitor', async (job) => {
  const { monitorId } = job.data;
  
  try {
    const monitor = await prisma.monitor.findUnique({
      where: { id: monitorId },
      include: {
        workspace: true,
        maintenanceWindows: {
          where: {
            startTime: { lte: new Date() },
            endTime: { gte: new Date() }
          }
        }
      }
    });

    if (!monitor || !monitor.isActive) {
      return;
    }

    // Check if in maintenance window
    if (monitor.maintenanceWindows.length > 0) {
      await prisma.monitor.update({
        where: { id: monitorId },
        data: { status: 'maintenance' }
      });
      return;
    }

    // Perform the check
    const result = await checkMonitor(monitor);
    
    // Save check result
    await prisma.check.create({
      data: {
        monitorId: monitor.id,
        status: result.status,
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        errorMessage: result.error,
        region: result.region || 'us-east',
        checkedAt: new Date()
      }
    });

    // Update monitor stats
    await updateMonitorStats(monitorId, result);

    // Handle status changes
    if (result.status !== monitor.status) {
      await handleStatusChange(monitor, result);
    }

    console.log(`✅ Checked monitor ${monitor.name}: ${result.status} (${result.responseTime}ms)`);
    
  } catch (error) {
    console.error(`❌ Monitor check failed for ${monitorId}:`, error);
    
    // Save failed check
    await prisma.check.create({
      data: {
        monitorId,
        status: 'down',
        errorMessage: error.message,
        checkedAt: new Date()
      }
    });
  }
});

// Process notifications
notificationQueue.process('send-notification', async (job) => {
  const { type, data } = job.data;
  
  try {
    const { sendNotification } = await import('./notifications.js');
    await sendNotification(type, data);
  } catch (error) {
    console.error('Notification failed:', error);
    throw error;
  }
});

// Process cleanup tasks
cleanupQueue.process('cleanup-old-data', async (job) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // Keep last 90 days

    // Delete old checks
    const deletedChecks = await prisma.check.deleteMany({
      where: {
        checkedAt: { lt: cutoffDate }
      }
    });

    console.log(`🧹 Cleaned up ${deletedChecks.count} old check records`);
  } catch (error) {
    console.error('Cleanup failed:', error);
    throw error;
  }
});

// Update monitor statistics
async function updateMonitorStats(monitorId, result) {
  try {
    // Get recent checks for uptime calculation
    const recentChecks = await prisma.check.findMany({
      where: {
        monitorId,
        checkedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: { checkedAt: 'desc' }
    });

    const upChecks = recentChecks.filter(check => check.status === 'up').length;
    const uptimePercentage = recentChecks.length > 0 ? (upChecks / recentChecks.length) * 100 : 0;

    // Calculate average response time
    const avgResponseTime = recentChecks
      .filter(check => check.responseTime)
      .reduce((sum, check) => sum + check.responseTime, 0) / recentChecks.length || 0;

    // Update monitor
    await prisma.monitor.update({
      where: { id: monitorId },
      data: {
        status: result.status,
        lastCheckAt: new Date(),
        uptimePercentage,
        avgResponseTime: Math.round(avgResponseTime),
        lastUptime: result.status === 'up' ? new Date() : undefined,
        lastDowntime: result.status === 'down' ? new Date() : undefined
      }
    });
  } catch (error) {
    console.error('Failed to update monitor stats:', error);
  }
}

// Add monitor to queue
export async function scheduleMonitorCheck(monitorId, delay = 0) {
  try {
    await monitorQueue.add('check-monitor', { monitorId }, {
      delay,
      removeOnComplete: 10,
      removeOnFail: 5
    });
  } catch (error) {
    console.error('Failed to schedule monitor check:', error);
  }
}

// Add notification to queue
export async function scheduleNotification(type, data, delay = 0) {
  try {
    await notificationQueue.add('send-notification', { type, data }, {
      delay,
      removeOnComplete: 10,
      removeOnFail: 5
    });
  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
}

// Schedule cleanup job
export async function scheduleCleanup() {
  try {
    await cleanupQueue.add('cleanup-old-data', {}, {
      repeat: { cron: '0 2 * * *' }, // Daily at 2 AM
      removeOnComplete: 1,
      removeOnFail: 1
    });
  } catch (error) {
    console.error('Failed to schedule cleanup:', error);
  }
}

// Initialize queues
export async function initializeQueues() {
  try {
    // Start cleanup job
    await scheduleCleanup();
    
    console.log('✅ Queues initialized successfully');
    return [monitorQueue, notificationQueue, cleanupQueue];
  } catch (error) {
    console.error('❌ Failed to initialize queues:', error);
    throw error;
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await monitorQueue.close();
  await notificationQueue.close();
  await cleanupQueue.close();
  await redis.quit();
});

process.on('SIGINT', async () => {
  await monitorQueue.close();
  await notificationQueue.close();
  await cleanupQueue.close();
  await redis.quit();
});
