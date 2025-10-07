import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { prisma } from '../index.js';

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// Get comprehensive analytics for admin dashboard
router.get('/analytics', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // User Statistics
    const totalUsers = await prisma.user.count();
    const newUsers = await prisma.user.count({
      where: {
        createdAt: { gte: startDate }
      }
    });
    
    // User growth over time (daily breakdown)
    const userGrowthRaw = await prisma.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as count
      FROM users
      WHERE createdAt >= ${startDate}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `;
    
    // Convert BigInt to Number
    const userGrowth = userGrowthRaw.map(row => ({
      date: row.date,
      count: Number(row.count)
    }));

    // Workspace Statistics
    const totalWorkspaces = await prisma.workspace.count();
    const newWorkspaces = await prisma.workspace.count({
      where: {
        createdAt: { gte: startDate }
      }
    });

    // Monitor Statistics
    const totalMonitors = await prisma.monitor.count();
    const activeMonitors = await prisma.monitor.count({
      where: {
        status: 'active'
      }
    });
    const newMonitors = await prisma.monitor.count({
      where: {
        createdAt: { gte: startDate }
      }
    });

    // Monitor type breakdown
    const monitorsByType = await prisma.monitor.groupBy({
      by: ['type'],
      _count: true
    });

    // Incident Statistics
    const totalIncidents = await prisma.incident.count();
    const openIncidents = await prisma.incident.count({
      where: {
        resolvedAt: null
      }
    });
    const recentIncidents = await prisma.incident.count({
      where: {
        startedAt: { gte: startDate }
      }
    });

    // Incident trend over time
    const incidentTrendRaw = await prisma.$queryRaw`
      SELECT 
        DATE(startedAt) as date,
        COUNT(*) as count
      FROM incidents
      WHERE startedAt >= ${startDate}
      GROUP BY DATE(startedAt)
      ORDER BY date ASC
    `;
    
    // Convert BigInt to Number
    const incidentTrend = incidentTrendRaw.map(row => ({
      date: row.date,
      count: Number(row.count)
    }));

    // Average resolution time (MTTR - Mean Time To Resolution)
    const resolvedIncidents = await prisma.incident.findMany({
      where: {
        resolvedAt: { not: null },
        startedAt: { gte: startDate }
      },
      select: {
        startedAt: true,
        resolvedAt: true
      }
    });

    let avgResolutionTime = 0;
    if (resolvedIncidents.length > 0) {
      const totalResolutionTime = resolvedIncidents.reduce((acc, incident) => {
        const duration = new Date(incident.resolvedAt) - new Date(incident.startedAt);
        return acc + duration;
      }, 0);
      avgResolutionTime = Math.floor(totalResolutionTime / resolvedIncidents.length / 1000 / 60); // in minutes
    }

    // Status Page Statistics
    const totalStatusPages = await prisma.statusPage.count();
    const publicStatusPages = await prisma.statusPage.count({
      where: {
        isPublic: true
      }
    });

    // Alert Statistics
    const totalAlerts = await prisma.alertContact.count();
    const enabledAlerts = await prisma.alertContact.count({
      where: {
        isActive: true
      }
    });

    // Alert channel breakdown
    const alertsByChannel = await prisma.alertContact.groupBy({
      by: ['type'],
      _count: true
    });

    // Top monitors by uptime (best performing)
    const topMonitors = await prisma.monitor.findMany({
      take: 10,
      where: {
        uptimePercentage: { not: null }
      },
      orderBy: {
        uptimePercentage: 'desc'
      },
      select: {
        id: true,
        name: true,
        url: true,
        uptimePercentage: true,
        status: true,
        workspace: {
          select: {
            name: true
          }
        }
      }
    });

    // Bottom monitors by uptime (worst performing)
    const bottomMonitors = await prisma.monitor.findMany({
      take: 10,
      where: {
        uptimePercentage: { not: null }
      },
      orderBy: {
        uptimePercentage: 'asc'
      },
      select: {
        id: true,
        name: true,
        url: true,
        uptimePercentage: true,
        status: true,
        workspace: {
          select: {
            name: true
          }
        }
      }
    });

    // Most active users (by monitor count)
    const activeUsersByMonitors = await prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        workspaces: {
          include: {
            workspace: {
              include: {
                _count: {
                  select: {
                    monitors: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Process active users data
    const processedActiveUsers = activeUsersByMonitors.map(user => {
      const totalMonitors = user.workspaces.reduce((acc, ws) => {
        return acc + ws.workspace._count.monitors;
      }, 0);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        workspaceCount: user.workspaces.length,
        monitorCount: totalMonitors
      };
    }).sort((a, b) => b.monitorCount - a.monitorCount);

    // Platform health metrics
    const platformUptime = await prisma.monitor.aggregate({
      _avg: {
        uptimePercentage: true
      },
      where: {
        status: 'active'
      }
    });

    const response = {
      timeRange,
      startDate,
      endDate: now,
      users: {
        total: totalUsers,
        new: newUsers,
        growth: userGrowth
      },
      workspaces: {
        total: totalWorkspaces,
        new: newWorkspaces
      },
      monitors: {
        total: totalMonitors,
        active: activeMonitors,
        new: newMonitors,
        byType: monitorsByType,
        top: topMonitors,
        bottom: bottomMonitors
      },
      incidents: {
        total: totalIncidents,
        open: openIncidents,
        recent: recentIncidents,
        trend: incidentTrend,
        avgResolutionTimeMinutes: avgResolutionTime
      },
      statusPages: {
        total: totalStatusPages,
        public: publicStatusPages
      },
      alerts: {
        total: totalAlerts,
        enabled: enabledAlerts,
        byChannel: alertsByChannel
      },
      platformHealth: {
        averageUptime: platformUptime._avg.uptimePercentage || 0
      },
      topUsers: processedActiveUsers
    };

    console.log('📊 Admin Analytics Response:', {
      totalUsers,
      totalWorkspaces,
      totalMonitors,
      totalIncidents
    });

    res.json(response);
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get all users with detailed information
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          workspaces: {
            include: {
              workspace: {
                include: {
                  _count: {
                    select: {
                      monitors: true,
                      statusPages: true
                    }
                  }
                }
              }
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Process user data
    const processedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      workspaces: user.workspaces.map(ws => ({
        id: ws.workspace.id,
        name: ws.workspace.name,
        role: ws.role,
        monitorCount: ws.workspace._count.monitors,
        statusPageCount: ws.workspace._count.statusPages
      }))
    }));

    res.json({
      users: processedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user details by ID
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        workspaces: {
          include: {
            workspace: {
              include: {
                monitors: {
                  select: {
                    id: true,
                    name: true,
                    url: true,
                    status: true,
                    uptime: true,
                    createdAt: true
                  }
                },
                statusPages: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    isPublic: true,
                    createdAt: true
                  }
                },
                _count: {
                  select: {
                    monitors: true,
                    statusPages: true,
                    members: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Get all workspaces with detailed information
router.get('/workspaces', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [workspaces, total] = await Promise.all([
      prisma.workspace.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true
                }
              }
            }
          },
          _count: {
            select: {
              monitors: true,
              statusPages: true,
              members: true
            }
          }
        }
      }),
      prisma.workspace.count()
    ]);

    res.json({
      workspaces,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

// Get system-wide statistics
router.get('/system-stats', async (req, res) => {
  try {
    // Database stats
    const dbStatsRaw = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM users) as userCount,
        (SELECT COUNT(*) FROM workspaces) as workspaceCount,
        (SELECT COUNT(*) FROM monitors) as monitorCount,
        (SELECT COUNT(*) FROM incidents) as incidentCount,
        (SELECT COUNT(*) FROM status_pages) as statusPageCount,
        (SELECT COUNT(*) FROM alert_contacts) as alertCount
    `;
    
    // Convert BigInt to Number
    const dbStats = {
      userCount: Number(dbStatsRaw[0].userCount),
      workspaceCount: Number(dbStatsRaw[0].workspaceCount),
      monitorCount: Number(dbStatsRaw[0].monitorCount),
      incidentCount: Number(dbStatsRaw[0].incidentCount),
      statusPageCount: Number(dbStatsRaw[0].statusPageCount),
      alertCount: Number(dbStatsRaw[0].alertCount)
    };

    res.json({
      database: dbStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ error: 'Failed to fetch system stats' });
  }
});

export default router;

