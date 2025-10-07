import express from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticateToken, requireWorkspace } from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const createStatusPageSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  customDomain: z.string().optional().or(z.literal('')),
  isPublic: z.boolean().default(true),
  password: z.string().optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3b82f6'),
  workspaceId: z.string().uuid()
});

const updateStatusPageSchema = createStatusPageSchema.partial().omit({ workspaceId: true });

// Get all status pages (simplified)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get user's workspace
    const userWorkspace = await prisma.workspaceMember.findFirst({
      where: { userId: req.user.id }
    });

    if (!userWorkspace) {
      return res.json({ statusPages: [] });
    }

    const statusPages = await prisma.statusPage.findMany({
      where: { workspaceId: userWorkspace.workspaceId },
      include: {
        monitors: {
          include: {
            monitor: {
              select: {
                id: true,
                name: true,
                status: true
              }
            }
          }
        }
      },
      take: 20,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ statusPages });
  } catch (error) {
    console.error('Get status pages error:', error);
    res.status(500).json({ error: 'Failed to fetch status pages' });
  }
});

// Get status pages for workspace (simplified)
router.get('/workspace/:workspaceId', authenticateToken, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { page = 1 } = req.query;

    const statusPages = await prisma.statusPage.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({ statusPages });
  } catch (error) {
    console.error('Get workspace status pages error:', error);
    res.status(500).json({ error: 'Failed to fetch status pages' });
  }
});

// Get status pages for workspace
router.get('/workspace/:workspaceId', authenticateToken, requireWorkspace('viewer'), async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const statusPages = await prisma.statusPage.findMany({
      where: { workspaceId },
      include: {
        monitors: {
          include: {
            monitor: {
              select: {
                id: true,
                name: true,
                type: true,
                status: true,
                uptimePercentage: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ statusPages });
  } catch (error) {
    console.error('Get status pages error:', error);
    res.status(500).json({ error: 'Failed to fetch status pages' });
  }
});

// Get status page details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const statusPage = await prisma.statusPage.findFirst({
      where: {
        id,
        workspace: {
          members: {
            some: { userId: req.user.id }
          }
        }
      },
      include: {
        monitors: {
          include: {
            monitor: {
              select: {
                id: true,
                name: true,
                type: true,
                status: true,
                uptimePercentage: true,
                lastCheckAt: true
              }
            }
          },
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    if (!statusPage) {
      return res.status(404).json({ error: 'Status page not found' });
    }

    res.json({ statusPage });
  } catch (error) {
    console.error('Get status page error:', error);
    res.status(500).json({ error: 'Failed to fetch status page' });
  }
});

// Create status page
router.post('/', authenticateToken, requireWorkspace('member'), async (req, res) => {
  try {
    const data = createStatusPageSchema.parse(req.body);

    // Generate unique slug
    const baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let slug = baseSlug;
    let counter = 1;
    
    while (await prisma.statusPage.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const statusPage = await prisma.statusPage.create({
      data: {
        ...data,
        slug
      }
    });

    res.status(201).json({ statusPage });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create status page error:', error);
    res.status(500).json({ error: 'Failed to create status page' });
  }
});

// Update status page
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = updateStatusPageSchema.parse(req.body);

    // Check if user has access to this status page
    const statusPage = await prisma.statusPage.findFirst({
      where: {
        id,
        workspace: {
          members: {
            some: { userId: req.user.id }
          }
        }
      }
    });

    if (!statusPage) {
      return res.status(404).json({ error: 'Status page not found' });
    }

    const updatedStatusPage = await prisma.statusPage.update({
      where: { id },
      data
    });

    res.json({ statusPage: updatedStatusPage });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update status page error:', error);
    res.status(500).json({ error: 'Failed to update status page' });
  }
});

// Delete status page
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has access to this status page
    const statusPage = await prisma.statusPage.findFirst({
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

    if (!statusPage) {
      return res.status(404).json({ error: 'Status page not found' });
    }

    await prisma.statusPage.delete({
      where: { id }
    });

    res.json({ message: 'Status page deleted successfully' });
  } catch (error) {
    console.error('Delete status page error:', error);
    res.status(500).json({ error: 'Failed to delete status page' });
  }
});

// Add monitor to status page
router.post('/:id/monitors', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { monitorId, displayOrder = 0 } = req.body;

    // Check if user has access to this status page
    const statusPage = await prisma.statusPage.findFirst({
      where: {
        id,
        workspace: {
          members: {
            some: { userId: req.user.id }
          }
        }
      }
    });

    if (!statusPage) {
      return res.status(404).json({ error: 'Status page not found' });
    }

    // Check if monitor exists and user has access
    const monitor = await prisma.monitor.findFirst({
      where: {
        id: monitorId,
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

    const statusPageMonitor = await prisma.statusPageMonitor.create({
      data: {
        statusPageId: id,
        monitorId,
        displayOrder
      }
    });

    res.status(201).json({ statusPageMonitor });
  } catch (error) {
    console.error('Add monitor to status page error:', error);
    res.status(500).json({ error: 'Failed to add monitor to status page' });
  }
});

// Remove monitor from status page
router.delete('/:id/monitors/:monitorId', authenticateToken, async (req, res) => {
  try {
    const { id, monitorId } = req.params;

    // Check if user has access to this status page
    const statusPage = await prisma.statusPage.findFirst({
      where: {
        id,
        workspace: {
          members: {
            some: { userId: req.user.id }
          }
        }
      }
    });

    if (!statusPage) {
      return res.status(404).json({ error: 'Status page not found' });
    }

    await prisma.statusPageMonitor.deleteMany({
      where: {
        statusPageId: id,
        monitorId
      }
    });

    res.json({ message: 'Monitor removed from status page successfully' });
  } catch (error) {
    console.error('Remove monitor from status page error:', error);
    res.status(500).json({ error: 'Failed to remove monitor from status page' });
  }
});

// Public status page view
router.get('/public/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { password } = req.query;

    const statusPage = await prisma.statusPage.findUnique({
      where: { slug },
      include: {
        monitors: {
          include: {
            monitor: {
              select: {
                id: true,
                name: true,
                type: true,
                status: true,
                uptimePercentage: true,
                lastCheckAt: true,
                avgResponseTime: true
              }
            }
          },
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    if (!statusPage) {
      return res.status(404).json({ error: 'Status page not found' });
    }

    if (!statusPage.isPublic) {
      return res.status(403).json({ error: 'Status page is private' });
    }

    // Check password if required
    if (statusPage.password && statusPage.password !== password) {
      return res.status(401).json({ error: 'Password required' });
    }

    // Get recent incidents
    const incidents = await prisma.incident.findMany({
      where: {
        monitor: {
          statusPageMonitors: {
            some: { statusPageId: statusPage.id }
          }
        },
        startedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      include: {
        monitor: {
          select: {
            id: true,
            name: true
          }
        },
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { startedAt: 'desc' },
      take: 10
    });

    // Calculate overall uptime
    const monitors = statusPage.monitors.map(spm => spm.monitor);
    const avgUptime = monitors.length > 0 
      ? monitors.reduce((sum, monitor) => sum + (monitor.uptimePercentage || 0), 0) / monitors.length 
      : 0;

    res.json({
      statusPage: {
        id: statusPage.id,
        name: statusPage.name,
        description: statusPage.description,
        logoUrl: statusPage.logoUrl,
        primaryColor: statusPage.primaryColor,
        customDomain: statusPage.customDomain
      },
      monitors,
      incidents,
      stats: {
        avgUptime: Math.round(avgUptime * 100) / 100,
        totalMonitors: monitors.length,
        upMonitors: monitors.filter(m => m.status === 'up').length,
        downMonitors: monitors.filter(m => m.status === 'down').length
      }
    });
  } catch (error) {
    console.error('Get public status page error:', error);
    res.status(500).json({ error: 'Failed to fetch status page' });
  }
});

// Subscribe to status page updates
router.post('/public/:slug/subscribe', async (req, res) => {
  try {
    const { slug } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const statusPage = await prisma.statusPage.findUnique({
      where: { slug }
    });

    if (!statusPage || !statusPage.isPublic) {
      return res.status(404).json({ error: 'Status page not found' });
    }

    // In a real implementation, you'd store subscribers in a database
    // For now, we'll just return success
    res.json({ message: 'Successfully subscribed to status page updates' });
  } catch (error) {
    console.error('Subscribe to status page error:', error);
    res.status(500).json({ error: 'Failed to subscribe to status page' });
  }
});

export default router;
