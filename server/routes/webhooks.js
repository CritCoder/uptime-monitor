import express from 'express';
import crypto from 'crypto';
import { prisma } from '../index.js';

const router = express.Router();

// Heartbeat endpoint for heartbeat monitors
router.get('/heartbeat/:monitorId/:token', async (req, res) => {
  try {
    const { monitorId, token } = req.params;

    // Find monitor and verify token
    const monitor = await prisma.monitor.findFirst({
      where: {
        id: monitorId,
        type: 'heartbeat'
      }
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    // In a real implementation, you'd verify the token
    // For now, we'll just accept any token

    // Record heartbeat
    await prisma.check.create({
      data: {
        monitorId,
        status: 'up',
        checkedAt: new Date(),
        region: 'heartbeat'
      }
    });

    // Update monitor last check time
    await prisma.monitor.update({
      where: { id: monitorId },
      data: {
        lastCheckAt: new Date(),
        status: 'up'
      }
    });

    res.json({ 
      message: 'Heartbeat received',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Heartbeat error:', error);
    res.status(500).json({ error: 'Failed to process heartbeat' });
  }
});

// Webhook endpoint for incoming webhooks
router.post('/:monitorId', async (req, res) => {
  try {
    const { monitorId } = req.params;
    const payload = req.body;
    const signature = req.headers['x-signature'];

    // Find monitor
    const monitor = await prisma.monitor.findFirst({
      where: { id: monitorId }
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    // Verify webhook signature if provided
    if (signature && process.env.WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (signature !== `sha256=${expectedSignature}`) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // Process webhook data
    const status = payload.status || (payload.statusCode && payload.statusCode < 400 ? 'up' : 'down');
    const responseTime = payload.responseTime || 0;
    const errorMessage = payload.error || null;

    // Record check
    await prisma.check.create({
      data: {
        monitorId,
        status,
        statusCode: payload.statusCode,
        responseTime,
        errorMessage,
        checkedAt: new Date(),
        region: payload.region || 'webhook'
      }
    });

    // Update monitor if status changed
    if (status !== monitor.status) {
      await prisma.monitor.update({
        where: { id: monitorId },
        data: { status }
      });
    }

    res.json({ 
      message: 'Webhook processed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Outgoing webhook for status changes
export async function sendOutgoingWebhook(webhookUrl, data) {
  try {
    const payload = {
      type: data.type,
      monitor: {
        id: data.monitor.id,
        name: data.monitor.name,
        url: data.monitor.url,
        type: data.monitor.type,
        status: data.monitor.status
      },
      incident: data.incident ? {
        id: data.incident.id,
        title: data.incident.title,
        status: data.incident.status,
        severity: data.incident.severity,
        startedAt: data.incident.startedAt,
        resolvedAt: data.incident.resolvedAt
      } : null,
      timestamp: new Date().toISOString()
    };

    // Add signature if secret is configured
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Uptime-Monitor/1.0'
    };

    if (process.env.WEBHOOK_SECRET) {
      const signature = crypto
        .createHmac('sha256', process.env.WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');
      headers['X-Signature'] = `sha256=${signature}`;
    }

    await axios.post(webhookUrl, payload, { headers });

    console.log(`🔗 Outgoing webhook sent to ${webhookUrl}`);
  } catch (error) {
    console.error('Outgoing webhook failed:', error);
    throw error;
  }
}

export default router;
