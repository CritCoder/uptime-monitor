import express from 'express';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Individual monitor details
router.get('/monitors/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const monitor = await prisma.monitor.findUnique({
      where: { id },
      include: {
        checks: {
          orderBy: { createdAt: 'desc' },
          take: 50
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

// Individual incident details
router.get('/incidents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        monitor: {
          select: {
            id: true,
            name: true,
            type: true
          }
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

// Individual status page details
router.get('/status-pages/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const statusPage = await prisma.statusPage.findUnique({
      where: { id },
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

// Create monitor
router.post('/monitors', authenticateToken, async (req, res) => {
  try {
    const monitorData = req.body;
    
    const monitor = await prisma.monitor.create({
      data: {
        ...monitorData,
        workspaceId: '66469592-5b3f-4b34-96b5-f0e42baaecec' // Demo workspace ID
      }
    });

    res.json({ monitor });
  } catch (error) {
    console.error('Create monitor error:', error);
    res.status(500).json({ error: 'Failed to create monitor' });
  }
});

// Update user profile
router.put('/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, timezone } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, timezone }
    });

    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
