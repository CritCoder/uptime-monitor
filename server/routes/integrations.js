import express from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendSlackWebhook, sendDiscordWebhook, sendCustomWebhook } from '../services/notifications.js';

const router = express.Router();

// Validation schemas
const createIntegrationSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['slack', 'discord', 'pagerduty', 'webhook', 'email', 'sms']),
  config: z.object({
    webhookUrl: z.string().url().optional(),
    channel: z.string().optional(),
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
    integrationKey: z.string().optional(),
    method: z.enum(['POST', 'GET', 'PUT']).optional()
  }),
  enabled: z.boolean().default(true)
});

// Get all integrations for workspace
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get user's workspace
    const userWorkspace = await prisma.workspaceMember.findFirst({
      where: { userId: req.user.id }
    });

    if (!userWorkspace) {
      return res.json({ integrations: [] });
    }

    const integrations = await prisma.integration.findMany({
      where: { workspaceId: userWorkspace.workspaceId },
      orderBy: { createdAt: 'desc' }
    });

    // Parse config JSON for each integration
    const integrationsWithConfig = integrations.map(integration => ({
      ...integration,
      config: JSON.parse(integration.config)
    }));

    res.json({ integrations: integrationsWithConfig });
  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// Create integration
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Get user's workspace
    const userWorkspace = await prisma.workspaceMember.findFirst({
      where: { userId: req.user.id }
    });

    if (!userWorkspace) {
      return res.status(403).json({ error: 'No workspace found for user' });
    }

    const validatedData = createIntegrationSchema.parse(req.body);

    const integration = await prisma.integration.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        config: JSON.stringify(validatedData.config),
        enabled: validatedData.enabled,
        workspaceId: userWorkspace.workspaceId
      }
    });

    res.status(201).json({
      integration: {
        ...integration,
        config: JSON.parse(integration.config)
      }
    });
  } catch (error) {
    console.error('Create integration error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid integration data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create integration' });
  }
});

// Test integration
router.post('/:id/test', authenticateToken, async (req, res) => {
  try {
    // Get user's workspace
    const userWorkspace = await prisma.workspaceMember.findFirst({
      where: { userId: req.user.id }
    });

    if (!userWorkspace) {
      return res.status(403).json({ error: 'No workspace found for user' });
    }

    const integration = await prisma.integration.findFirst({
      where: {
        id: req.params.id,
        workspaceId: userWorkspace.workspaceId
      }
    });

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    const config = JSON.parse(integration.config);

    // Send test notification based on integration type
    if (integration.type === 'slack') {
      await sendSlackWebhook(
        config.webhookUrl,
        '🧪 Test Notification',
        'This is a test notification from your uptime monitoring system.',
        '#36A64F',
        [
          {
            title: 'Status',
            value: 'Testing',
            short: true
          },
          {
            title: 'Time',
            value: new Date().toLocaleString(),
            short: true
          }
        ]
      );
    } else if (integration.type === 'discord') {
      await sendDiscordWebhook(
        config.webhookUrl,
        '🧪 Test Notification',
        'This is a test notification from your uptime monitoring system.',
        0x36A64F, // Green color
        [
          {
            title: 'Status',
            value: 'Testing',
            short: true
          },
          {
            title: 'Time',
            value: new Date().toLocaleString(),
            short: true
          }
        ]
      );
    } else if (integration.type === 'webhook') {
      const testData = {
        type: 'test',
        message: 'This is a test notification from your uptime monitoring system',
        status: 'testing',
        timestamp: new Date().toISOString(),
        monitor: {
          name: 'Test Monitor',
          url: 'https://example.com'
        }
      };

      await sendCustomWebhook(
        config.webhookUrl,
        config.method || 'POST',
        testData
      );
    } else {
      // For other integrations, we'll add support later
      return res.status(400).json({ error: `Test not implemented for ${integration.type} yet` });
    }

    res.json({ message: 'Test notification sent successfully' });
  } catch (error) {
    console.error('Test integration error:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// Delete integration
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Get user's workspace
    const userWorkspace = await prisma.workspaceMember.findFirst({
      where: { userId: req.user.id }
    });

    if (!userWorkspace) {
      return res.status(403).json({ error: 'No workspace found for user' });
    }

    const integration = await prisma.integration.findFirst({
      where: {
        id: req.params.id,
        workspaceId: userWorkspace.workspaceId
      }
    });

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    await prisma.integration.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Integration deleted successfully' });
  } catch (error) {
    console.error('Delete integration error:', error);
    res.status(500).json({ error: 'Failed to delete integration' });
  }
});

// Update integration
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    // Get user's workspace
    const userWorkspace = await prisma.workspaceMember.findFirst({
      where: { userId: req.user.id }
    });

    if (!userWorkspace) {
      return res.status(403).json({ error: 'No workspace found for user' });
    }

    const integration = await prisma.integration.findFirst({
      where: {
        id: req.params.id,
        workspaceId: userWorkspace.workspaceId
      }
    });

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.enabled !== undefined) updateData.enabled = req.body.enabled;
    if (req.body.config) updateData.config = JSON.stringify(req.body.config);

    const updatedIntegration = await prisma.integration.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({
      integration: {
        ...updatedIntegration,
        config: JSON.parse(updatedIntegration.config)
      }
    });
  } catch (error) {
    console.error('Update integration error:', error);
    res.status(500).json({ error: 'Failed to update integration' });
  }
});

export default router;

