import express from 'express';
import { prisma } from '../index.js';
import { authenticateToken, requireWorkspace } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard data
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get user's workspace
    const userWorkspace = await prisma.workspaceMember.findFirst({
      where: { userId: req.user.id }
    });

    if (!userWorkspace) {
      return res.json({
        stats: {
          totalMonitors: 0,
          upMonitors: 0,
          downMonitors: 0,
          avgUptime: 0,
          avgResponseTime: 0
        },
        monitors: [],
        incidents: [],
        uptimeData: [],
        responseTimeData: []
      });
    }

    // Get monitors for user's workspace
    const monitors = await prisma.monitor.findMany({
      where: { workspaceId: userWorkspace.workspaceId },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    const totalMonitors = monitors.length;
    const upMonitors = monitors.filter(m => m.status === 'up').length;
    const downMonitors = monitors.filter(m => m.status === 'down').length;
    
    // Calculate average uptime
    const avgUptime = totalMonitors > 0 
      ? monitors.reduce((sum, m) => sum + (m.uptimePercentage || 0), 0) / totalMonitors 
      : 0;
    
    // Calculate average response time
    const avgResponseTime = monitors.length > 0
      ? monitors.reduce((sum, m) => sum + (m.avgResponseTime || 0), 0) / monitors.length
      : 0;

    // Fetch recent checks for response time trend (last 50 checks across all monitors)
    const recentChecks = await prisma.check.findMany({
      where: {
        monitor: {
          workspaceId: userWorkspace.workspaceId
        }
      },
      orderBy: { checkedAt: 'desc' },
      take: 50,
      select: {
        responseTime: true,
        status: true,
        checkedAt: true
      }
    });

    // Format response time data for chart
    const responseTimeData = recentChecks.reverse().map(check => ({
      time: new Date(check.checkedAt).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      responseTime: check.responseTime || 0,
      status: check.status
    }));

    res.json({
      stats: {
        totalMonitors,
        upMonitors,
        downMonitors,
        avgUptime: Math.round(avgUptime * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime)
      },
      monitors: monitors.map(monitor => ({
        id: monitor.id,
        name: monitor.name,
        type: monitor.type,
        status: monitor.status,
        url: monitor.url,
        ip: monitor.ip,
        uptimePercentage: monitor.uptimePercentage,
        avgResponseTime: monitor.avgResponseTime,
        lastCheckAt: monitor.lastCheckAt
      })),
      incidents: [],
      uptimeData: [],
      responseTimeData
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
