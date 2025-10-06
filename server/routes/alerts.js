import express from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticateToken, requireWorkspace } from '../middleware/auth.js';
import { testNotification } from '../services/notifications.js';

const router = express.Router();

// Validation schemas
const createAlertContactSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['email', 'sms', 'slack', 'discord', 'webhook', 'telegram', 'pagerduty']),
  value: z.string().min(1).max(500),
  workspaceId: z.string().uuid()
});

const createAlertRuleSchema = z.object({
  monitorId: z.string().uuid(),
  alertContactId: z.string().uuid(),
  alertOnDown: z.boolean().default(true),
  alertOnUp: z.boolean().default(true),
  alertOnSlow: z.boolean().default(false),
  slowThreshold: z.number().int().min(1000).max(60000).optional()
});

// Get all alert contacts (simplified)
router.get('/contacts', authenticateToken, async (req, res) => {
  try {
    // Get user's workspace
    const userWorkspace = await prisma.workspaceMember.findFirst({
      where: { userId: req.user.id }
    });

    if (!userWorkspace) {
      return res.json({ contacts: [] });
    }

    const contacts = await prisma.alertContact.findMany({
      where: { workspaceId: userWorkspace.workspaceId },
      take: 20,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ contacts });
  } catch (error) {
    console.error('Get alert contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch alert contacts' });
  }
});

// Get alert contacts for workspace (simplified)
router.get('/contacts/workspace/:workspaceId', authenticateToken, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { page = 1 } = req.query;

    const contacts = await prisma.alertContact.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({ contacts });
  } catch (error) {
    console.error('Get workspace alert contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch alert contacts' });
  }
});

// Get alert contacts for workspace
router.get('/contacts/workspace/:workspaceId', authenticateToken, requireWorkspace('viewer'), async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const contacts = await prisma.alertContact.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ contacts });
  } catch (error) {
    console.error('Get alert contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch alert contacts' });
  }
});

// Create alert contact
router.post('/contacts', authenticateToken, requireWorkspace('member'), async (req, res) => {
  try {
    const data = createAlertContactSchema.parse(req.body);

    const contact = await prisma.alertContact.create({
      data
    });

    res.status(201).json({ contact });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create alert contact error:', error);
    res.status(500).json({ error: 'Failed to create alert contact' });
  }
});

// Update alert contact
router.put('/contacts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, value, isActive } = req.body;

    // Check if user has access to this contact
    const contact = await prisma.alertContact.findFirst({
      where: {
        id,
        workspace: {
          members: {
            some: { userId: req.user.id }
          }
        }
      }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Alert contact not found' });
    }

    const updatedContact = await prisma.alertContact.update({
      where: { id },
      data: { name, value, isActive }
    });

    res.json({ contact: updatedContact });
  } catch (error) {
    console.error('Update alert contact error:', error);
    res.status(500).json({ error: 'Failed to update alert contact' });
  }
});

// Delete alert contact
router.delete('/contacts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has access to this contact
    const contact = await prisma.alertContact.findFirst({
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

    if (!contact) {
      return res.status(404).json({ error: 'Alert contact not found' });
    }

    await prisma.alertContact.delete({
      where: { id }
    });

    res.json({ message: 'Alert contact deleted successfully' });
  } catch (error) {
    console.error('Delete alert contact error:', error);
    res.status(500).json({ error: 'Failed to delete alert contact' });
  }
});

// Test alert contact
router.post('/contacts/:id/test', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has access to this contact
    const contact = await prisma.alertContact.findFirst({
      where: {
        id,
        workspace: {
          members: {
            some: { userId: req.user.id }
          }
        }
      }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Alert contact not found' });
    }

    const result = await testNotification(contact);

    res.json(result);
  } catch (error) {
    console.error('Test alert contact error:', error);
    res.status(500).json({ error: 'Failed to test alert contact' });
  }
});

// Get alert rules for monitor
router.get('/rules/monitor/:monitorId', authenticateToken, async (req, res) => {
  try {
    const { monitorId } = req.params;

    // Check if user has access to this monitor
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

    const rules = await prisma.monitorAlertRule.findMany({
      where: { monitorId },
      include: { alertContact: true }
    });

    res.json({ rules });
  } catch (error) {
    console.error('Get alert rules error:', error);
    res.status(500).json({ error: 'Failed to fetch alert rules' });
  }
});

// Create alert rule
router.post('/rules', authenticateToken, async (req, res) => {
  try {
    const data = createAlertRuleSchema.parse(req.body);

    // Check if user has access to monitor and contact
    const [monitor, contact] = await Promise.all([
      prisma.monitor.findFirst({
        where: {
          id: data.monitorId,
          workspace: {
            members: {
              some: { userId: req.user.id }
            }
          }
        }
      }),
      prisma.alertContact.findFirst({
        where: {
          id: data.alertContactId,
          workspace: {
            members: {
              some: { userId: req.user.id }
            }
          }
        }
      })
    ]);

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    if (!contact) {
      return res.status(404).json({ error: 'Alert contact not found' });
    }

    const rule = await prisma.monitorAlertRule.create({
      data,
      include: { alertContact: true }
    });

    res.status(201).json({ rule });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create alert rule error:', error);
    res.status(500).json({ error: 'Failed to create alert rule' });
  }
});

// Update alert rule
router.put('/rules/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { alertOnDown, alertOnUp, alertOnSlow, slowThreshold } = req.body;

    // Check if user has access to this rule
    const rule = await prisma.monitorAlertRule.findFirst({
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

    if (!rule) {
      return res.status(404).json({ error: 'Alert rule not found' });
    }

    const updatedRule = await prisma.monitorAlertRule.update({
      where: { id },
      data: { alertOnDown, alertOnUp, alertOnSlow, slowThreshold },
      include: { alertContact: true }
    });

    res.json({ rule: updatedRule });
  } catch (error) {
    console.error('Update alert rule error:', error);
    res.status(500).json({ error: 'Failed to update alert rule' });
  }
});

// Delete alert rule
router.delete('/rules/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has access to this rule
    const rule = await prisma.monitorAlertRule.findFirst({
      where: {
        id,
        monitor: {
          workspace: {
            members: {
              some: { 
                userId: req.user.id,
                role: { in: ['admin', 'member'] }
              }
            }
          }
        }
      }
    });

    if (!rule) {
      return res.status(404).json({ error: 'Alert rule not found' });
    }

    await prisma.monitorAlertRule.delete({
      where: { id }
    });

    res.json({ message: 'Alert rule deleted successfully' });
  } catch (error) {
    console.error('Delete alert rule error:', error);
    res.status(500).json({ error: 'Failed to delete alert rule' });
  }
});

export default router;
