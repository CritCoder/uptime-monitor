import express from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticateToken, requireWorkspace } from '../middleware/auth.js';
import { acknowledgeIncident, updateIncident, getIncidentStats } from '../services/incidentManager.js';

const router = express.Router();

// Validation schemas
const createIncidentSchema = z.object({
  monitorId: z.string().uuid(),
  title: z.string().min(1).max(200),
  severity: z.enum(['minor', 'major', 'critical']).default('major'),
  notes: z.string().optional()
});

const updateIncidentSchema = z.object({
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']),
  message: z.string().min(1).max(1000)
});

// Get all incidents (simplified)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get user's workspace
    const userWorkspace = await prisma.workspaceMember.findFirst({
      where: { userId: req.user.id }
    });

    if (!userWorkspace) {
      return res.json({ incidents: [] });
    }

    const { limit = 20 } = req.query;

    const incidents = await prisma.incident.findMany({
      where: {
        monitor: { workspaceId: userWorkspace.workspaceId }
      },
      include: {
        monitor: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      take: parseInt(limit),
      orderBy: { startedAt: 'desc' }
    });

    res.json({ incidents });
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// Get incidents for workspace (simplified)
router.get('/workspace/:workspaceId', authenticateToken, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { limit = 20 } = req.query;

    const incidents = await prisma.incident.findMany({
      where: {
        monitor: { workspaceId }
      },
      take: parseInt(limit),
      orderBy: { startedAt: 'desc' }
    });

    res.json({ incidents });
  } catch (error) {
    console.error('Get workspace incidents error:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// Get incidents for workspace
router.get('/workspace/:workspaceId', authenticateToken, requireWorkspace('viewer'), async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { page = 1, limit = 20, status, severity, monitorId } = req.query;

    const where = {
      monitor: { workspaceId },
      ...(status && { status }),
      ...(severity && { severity }),
      ...(monitorId && { monitorId })
    };

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        include: {
          monitor: {
            select: {
              id: true,
              name: true,
              type: true,
              url: true,
              ip: true
            }
          },
          updates: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { startedAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      prisma.incident.count({ where })
    ]);

    res.json({
      incidents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// Get incident details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const incident = await prisma.incident.findFirst({
      where: {
        id,
        monitor: {
          workspace: {
            members: {
              some: { userId: req.user.id }
            }
          }
        }
      },
      include: {
        monitor: {
          select: {
            id: true,
            name: true,
            type: true,
            url: true,
            ip: true
          }
        },
        updates: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json({ incident });
  } catch (error) {
    console.error('Get incident error:', error);
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});

// Create manual incident
router.post('/', authenticateToken, requireWorkspace('member'), async (req, res) => {
  try {
    const { monitorId, title, severity, notes } = createIncidentSchema.parse(req.body);

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

    const incident = await prisma.incident.create({
      data: {
        monitorId,
        title,
        severity,
        notes,
        status: 'investigating',
        startedAt: new Date()
      },
      include: {
        monitor: {
          select: {
            id: true,
            name: true,
            type: true,
            url: true,
            ip: true
          }
        }
      }
    });

    // Create initial update
    await prisma.incidentUpdate.create({
      data: {
        incidentId: incident.id,
        status: 'investigating',
        message: notes || 'Manual incident created',
        createdBy: req.user.id,
        createdAt: new Date()
      }
    });

    res.status(201).json({ incident });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create incident error:', error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

// Acknowledge incident
router.post('/:id/acknowledge', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has access to this incident
    const incident = await prisma.incident.findFirst({
      where: {
        id,
        monitor: {
          workspace: {
            members: {
              some: { userId: req.user.id }
            }
          }
        }
      }
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const updatedIncident = await acknowledgeIncident(id, req.user.id);

    res.json({ incident: updatedIncident });
  } catch (error) {
    console.error('Acknowledge incident error:', error);
    res.status(500).json({ error: 'Failed to acknowledge incident' });
  }
});

// Update incident
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = updateIncidentSchema.parse(req.body);

    // Check if user has access to this incident
    const incident = await prisma.incident.findFirst({
      where: {
        id,
        monitor: {
          workspace: {
            members: {
              some: { userId: req.user.id }
            }
          }
        }
      }
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const updatedIncident = await updateIncident(id, status, message, req.user.id);

    res.json({ incident: updatedIncident });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update incident error:', error);
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

// Resolve incident
router.post('/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    // Check if user has access to this incident
    const incident = await prisma.incident.findFirst({
      where: {
        id,
        monitor: {
          workspace: {
            members: {
              some: { userId: req.user.id }
            }
          }
        }
      }
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const updatedIncident = await updateIncident(
      id, 
      'resolved', 
      message || 'Incident has been resolved',
      req.user.id
    );

    // Update resolved timestamp
    await prisma.incident.update({
      where: { id },
      data: { resolvedAt: new Date() }
    });

    res.json({ incident: updatedIncident });
  } catch (error) {
    console.error('Resolve incident error:', error);
    res.status(500).json({ error: 'Failed to resolve incident' });
  }
});

// Get incident statistics
router.get('/workspace/:workspaceId/stats', authenticateToken, requireWorkspace('viewer'), async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { timeRange = '30d' } = req.query;

    const stats = await getIncidentStats(workspaceId, timeRange);

    res.json({ stats });
  } catch (error) {
    console.error('Get incident stats error:', error);
    res.status(500).json({ error: 'Failed to fetch incident statistics' });
  }
});

// Get incident timeline
router.get('/:id/timeline', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has access to this incident
    const incident = await prisma.incident.findFirst({
      where: {
        id,
        monitor: {
          workspace: {
            members: {
              some: { userId: req.user.id }
            }
          }
        }
      }
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const timeline = await prisma.incidentUpdate.findMany({
      where: { incidentId: id },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ timeline });
  } catch (error) {
    console.error('Get incident timeline error:', error);
    res.status(500).json({ error: 'Failed to fetch incident timeline' });
  }
});

export default router;
