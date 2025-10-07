import express from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticateToken, requireWorkspace } from '../middleware/auth.js';
import { scheduleMonitorCheck } from '../services/queue.js';

const router = express.Router();

// Helper function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// Helper function to ensure unique slug
async function generateUniqueSlug(name, monitorId = null) {
  let slug = generateSlug(name);
  let counter = 1;
  
  while (true) {
    const existing = await prisma.monitor.findUnique({
      where: { slug: counter > 1 ? `${slug}-${counter}` : slug }
    });
    
    if (!existing || existing.id === monitorId) {
      return counter > 1 ? `${slug}-${counter}` : slug;
    }
    counter++;
  }
}

// Validation schemas
const createMonitorSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['http', 'https', 'ping', 'port', 'keyword', 'heartbeat', 'ssl', 'domain']),
  url: z.string().optional(),
  ip: z.string().optional(),
  port: z.number().int().min(1).max(65535).optional(),
  interval: z.number().int().min(30).max(3600).default(300),
  timeout: z.number().int().min(5).max(300).default(30),
  httpMethod: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']).default('GET'),
  expectedStatus: z.string().optional().default('200'),
  keyword: z.string().optional(),
  keywordType: z.enum(['exists', 'not-exists']).optional(),
  headers: z.string().optional(),
  body: z.string().optional(),
  followRedirects: z.boolean().default(true),
  verifySsl: z.boolean().default(true),
  retryCount: z.number().int().min(1).max(5).default(2),
  workspaceId: z.string().uuid()
});

const updateMonitorSchema = createMonitorSchema.partial().omit({ workspaceId: true });

// Get all monitors (simplified)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get user's workspace
    const userWorkspace = await prisma.workspaceMember.findFirst({
      where: { userId: req.user.id }
    });

    if (!userWorkspace) {
      return res.json({ monitors: [] });
    }

    const { page = 1, search } = req.query;

    const where = {
      workspaceId: userWorkspace.workspaceId,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { url: { contains: search } }
        ]
      })
    };

    const monitors = await prisma.monitor.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({ monitors });
  } catch (error) {
    console.error('Get monitors error:', error);
    res.status(500).json({ error: 'Failed to fetch monitors' });
  }
});

// Get monitors for workspace (simplified)
router.get('/workspace/:workspaceId', authenticateToken, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { page = 1, search } = req.query;

    const where = {
      workspaceId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { url: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const monitors = await prisma.monitor.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({ monitors });
  } catch (error) {
    console.error('Get workspace monitors error:', error);
    res.status(500).json({ error: 'Failed to fetch monitors' });
  }
});

// Get all monitors for a workspace
router.get('/workspace/:workspaceId', authenticateToken, requireWorkspace('viewer'), async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { page = 1, limit = 20, status, type, search } = req.query;

    const where = {
      workspaceId,
      ...(status && { status }),
      ...(type && { type }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { url: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [monitors, total] = await Promise.all([
      prisma.monitor.findMany({
        where,
        include: {
          tags: true,
          alertRules: {
            include: { alertContact: true }
          },
          _count: {
            select: {
              checks: true,
              incidents: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      prisma.monitor.count({ where })
    ]);

    res.json({
      monitors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get monitors error:', error);
    res.status(500).json({ error: 'Failed to fetch monitors' });
  }
});

// Get monitor details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if id is a UUID or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const monitor = await prisma.monitor.findFirst({
      where: {
        ...(isUUID ? { id } : { slug: id }),
        workspace: {
          members: {
            some: { userId: req.user.id }
          }
        }
      },
      include: {
        workspace: true,
        tags: true,
        alertRules: {
          include: { alertContact: true }
        },
        maintenanceWindows: {
          where: {
            endTime: { gte: new Date() }
          },
          orderBy: { startTime: 'asc' }
        },
        checks: {
          orderBy: { checkedAt: 'desc' },
          take: 100
        },
        incidents: {
          where: {
            status: { in: ['investigating', 'identified', 'monitoring'] }
          },
          orderBy: { startedAt: 'desc' }
        }
      }
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    res.json({ monitor });
  } catch (error) {
    console.error('Get monitor error:', error);
    res.status(500).json({ error: 'Failed to fetch monitor' });
  }
});

// Create monitor
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Get user's workspace
    const userWorkspace = await prisma.workspaceMember.findFirst({
      where: { userId: req.user.id },
      include: { workspace: true }
    });

    if (!userWorkspace) {
      return res.status(403).json({ error: 'No workspace found for user' });
    }

    // Use user's workspace ID instead of the one from request
    const data = {
      ...req.body,
      workspaceId: userWorkspace.workspaceId
    };

    const validatedData = createMonitorSchema.parse(data);
    
    // Generate unique slug
    const slug = await generateUniqueSlug(validatedData.name);

    const monitor = await prisma.monitor.create({
      data: {
        ...validatedData,
        slug,
        status: 'up', // Start as up, will update after first check
        isActive: true
      },
      include: {
        tags: true,
        alertRules: {
          include: { alertContact: true }
        }
      }
    });

    // Schedule initial check immediately
    await scheduleMonitorCheck(monitor.id, 1000); // Check after 1 second

    res.status(201).json({ monitor });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create monitor error:', error);
    res.status(500).json({ error: 'Failed to create monitor' });
  }
});

// Update monitor
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = updateMonitorSchema.parse(req.body);
    
    // Check if id is a UUID or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // Check if user has access to this monitor
    const existingMonitor = await prisma.monitor.findFirst({
      where: {
        ...(isUUID ? { id } : { slug: id }),
        workspace: {
          members: {
            some: { userId: req.user.id }
          }
        }
      }
    });

    if (!existingMonitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    // If name is being updated, regenerate slug
    if (data.name && data.name !== existingMonitor.name) {
      data.slug = await generateUniqueSlug(data.name, existingMonitor.id);
    }

    const monitor = await prisma.monitor.update({
      where: { id: existingMonitor.id },
      data,
      include: {
        tags: true,
        alertRules: {
          include: { alertContact: true }
        }
      }
    });

    res.json({ monitor });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update monitor error:', error);
    res.status(500).json({ error: 'Failed to update monitor' });
  }
});

// Delete monitor
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has access to this monitor
    const monitor = await prisma.monitor.findFirst({
      where: {
        id,
        workspace: {
          members: {
            some: { 
              userId: req.user.id,
              role: { in: ['admin', 'member'] }
            }
          }
        }
      }
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    await prisma.monitor.delete({
      where: { id }
    });

    res.json({ message: 'Monitor deleted successfully' });
  } catch (error) {
    console.error('Delete monitor error:', error);
    res.status(500).json({ error: 'Failed to delete monitor' });
  }
});

// Pause monitor
router.post('/:id/pause', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const monitor = await prisma.monitor.findFirst({
      where: {
        id,
        workspace: {
          members: {
            some: { userId: req.user.id }
          }
        }
      }
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    await prisma.monitor.update({
      where: { id },
      data: { isActive: false, status: 'paused' }
    });

    res.json({ message: 'Monitor paused successfully' });
  } catch (error) {
    console.error('Pause monitor error:', error);
    res.status(500).json({ error: 'Failed to pause monitor' });
  }
});

// Resume monitor
router.post('/:id/resume', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const monitor = await prisma.monitor.findFirst({
      where: {
        id,
        workspace: {
          members: {
            some: { userId: req.user.id }
          }
        }
      }
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    await prisma.monitor.update({
      where: { id },
      data: { isActive: true, status: 'up' }
    });

    // Schedule immediate check
    await scheduleMonitorCheck(id, 1000);

    res.json({ message: 'Monitor resumed successfully' });
  } catch (error) {
    console.error('Resume monitor error:', error);
    res.status(500).json({ error: 'Failed to resume monitor' });
  }
});

// Get monitor checks
router.get('/:id/checks', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 100, status, startDate, endDate } = req.query;

    // Check if user has access to this monitor
    const monitor = await prisma.monitor.findFirst({
      where: {
        id,
        workspace: {
          members: {
            some: { userId: req.user.id }
          }
        }
      }
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    const where = {
      monitorId: id,
      ...(status && { status }),
      ...(startDate && endDate && {
        checkedAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const [checks, total] = await Promise.all([
      prisma.check.findMany({
        where,
        orderBy: { checkedAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      prisma.check.count({ where })
    ]);

    res.json({
      checks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get monitor checks error:', error);
    res.status(500).json({ error: 'Failed to fetch monitor checks' });
  }
});

// Get monitor statistics
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { timeRange = '24h' } = req.query;

    // Check if user has access to this monitor
    const monitor = await prisma.monitor.findFirst({
      where: {
        id,
        workspace: {
          members: {
            some: { userId: req.user.id }
          }
        }
      }
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    const hours = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

    const checks = await prisma.check.findMany({
      where: {
        monitorId: id,
        checkedAt: { gte: startDate }
      },
      orderBy: { checkedAt: 'asc' }
    });

    const upChecks = checks.filter(check => check.status === 'up');
    const downChecks = checks.filter(check => check.status === 'down');
    
    const uptimePercentage = checks.length > 0 ? (upChecks.length / checks.length) * 100 : 0;
    const avgResponseTime = upChecks.length > 0 
      ? upChecks.reduce((sum, check) => sum + (check.responseTime || 0), 0) / upChecks.length 
      : 0;

    const incidents = await prisma.incident.findMany({
      where: {
        monitorId: id,
        startedAt: { gte: startDate }
      }
    });

    res.json({
      uptimePercentage: Math.round(uptimePercentage * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime),
      totalChecks: checks.length,
      upChecks: upChecks.length,
      downChecks: downChecks.length,
      incidents: incidents.length,
      lastCheck: checks[checks.length - 1]?.checkedAt || null
    });
  } catch (error) {
    console.error('Get monitor stats error:', error);
    res.status(500).json({ error: 'Failed to fetch monitor statistics' });
  }
});

// Test monitor (manual check)
router.post('/:id/test', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has access to this monitor
    const monitor = await prisma.monitor.findFirst({
      where: {
        id,
        workspace: {
          members: {
            some: { userId: req.user.id }
          }
        }
      }
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    // Schedule immediate check
    await scheduleMonitorCheck(id, 100);

    res.json({ message: 'Test check scheduled' });
  } catch (error) {
    console.error('Test monitor error:', error);
    res.status(500).json({ error: 'Failed to test monitor' });
  }
});

export default router;
