import { prisma } from '../index.js';
import { scheduleNotification } from './queue.js';
import { sendIntegrationNotification } from './notifications.js';

// Handle status changes and create/resolve incidents
export async function handleStatusChange(monitor, checkResult) {
  const { status: newStatus } = checkResult;
  const { status: currentStatus } = monitor;

  // If status hasn't changed, do nothing
  if (newStatus === currentStatus) {
    return;
  }

  try {
    // Update monitor status
    await prisma.monitor.update({
      where: { id: monitor.id },
      data: { status: newStatus }
    });

    if (newStatus === 'down' && currentStatus !== 'down') {
      // Monitor went down - create incident
      await createIncident(monitor, checkResult);
    } else if (newStatus === 'up' && currentStatus === 'down') {
      // Monitor recovered - resolve incident
      await resolveIncident(monitor);
    }
  } catch (error) {
    console.error('Failed to handle status change:', error);
  }
}

// Create a new incident
async function createIncident(monitor, checkResult) {
  try {
    // Check if there's already an open incident
    const existingIncident = await prisma.incident.findFirst({
      where: {
        monitorId: monitor.id,
        status: { in: ['investigating', 'identified', 'monitoring'] }
      }
    });

    if (existingIncident) {
      return; // Don't create duplicate incidents
    }

    // Create new incident
    const incident = await prisma.incident.create({
      data: {
        monitorId: monitor.id,
        title: `${monitor.name} is down`,
        status: 'investigating',
        severity: determineSeverity(monitor, checkResult),
        startedAt: new Date()
      }
    });

    // Create initial incident update
    await prisma.incidentUpdate.create({
      data: {
        incidentId: incident.id,
        status: 'investigating',
        message: `Monitor ${monitor.name} is experiencing issues. We are investigating the problem.`,
        createdAt: new Date()
      }
    });

    // Send notifications
    await sendIncidentNotifications(incident, monitor, 'incident_started');

    console.log(`🚨 Created incident for monitor ${monitor.name}`);
  } catch (error) {
    console.error('Failed to create incident:', error);
  }
}

// Resolve an incident
async function resolveIncident(monitor) {
  try {
    const incident = await prisma.incident.findFirst({
      where: {
        monitorId: monitor.id,
        status: { in: ['investigating', 'identified', 'monitoring'] }
      }
    });

    if (!incident) {
      return; // No open incident to resolve
    }

    // Calculate incident duration
    const duration = Math.round((Date.now() - incident.startedAt.getTime()) / 1000 / 60); // minutes

    // Update incident
    await prisma.incident.update({
      where: { id: incident.id },
      data: {
        status: 'resolved',
        resolvedAt: new Date()
      }
    });

    // Create resolution update
    await prisma.incidentUpdate.create({
      data: {
        incidentId: incident.id,
        status: 'resolved',
        message: `Monitor ${monitor.name} has recovered. The incident lasted ${duration} minutes.`,
        createdAt: new Date()
      }
    });

    // Send notifications
    await sendIncidentNotifications(incident, monitor, 'incident_resolved');

    console.log(`✅ Resolved incident for monitor ${monitor.name} (${duration} minutes)`);
  } catch (error) {
    console.error('Failed to resolve incident:', error);
  }
}

// Determine incident severity
function determineSeverity(monitor, checkResult) {
  // Critical: SSL expired, domain expired, or very high response time
  if (checkResult.error?.includes('SSL certificate') || 
      checkResult.error?.includes('domain') ||
      (checkResult.responseTime && checkResult.responseTime > 10000)) {
    return 'critical';
  }
  
  // Major: Monitor is down
  if (checkResult.status === 'down') {
    return 'major';
  }
  
  // Minor: Slow response time
  if (checkResult.responseTime && checkResult.responseTime > 5000) {
    return 'minor';
  }
  
  return 'major';
}

// Send incident notifications
async function sendIncidentNotifications(incident, monitor, type) {
  try {
    // Get alert contacts for this monitor
    const alertRules = await prisma.monitorAlertRule.findMany({
      where: { monitorId: monitor.id },
      include: { alertContact: true }
    });

    for (const rule of alertRules) {
      const { alertContact } = rule;
      
      // Check if we should send this type of notification
      if (type === 'incident_started' && !rule.alertOnDown) continue;
      if (type === 'incident_resolved' && !rule.alertOnUp) continue;

      // Schedule notification
      await scheduleNotification('incident', {
        type,
        incident,
        monitor,
        alertContact,
        rule
      });
    }

    // Also send notifications to all workspace members
    const monitorWithWorkspaceMembers = await prisma.monitor.findUnique({
      where: { id: monitor.id },
      include: {
        workspace: {
          include: {
            members: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (monitorWithWorkspaceMembers?.workspace?.members) {
      for (const member of monitorWithWorkspaceMembers.workspace.members) {
        if (member.user?.email) {
          // Create a virtual alert contact for the workspace member
          const alertContact = {
            type: 'email',
            value: member.user.email,
            name: member.user.name || 'Workspace Member'
          };

          // Schedule notification
          await scheduleNotification('incident', {
            type,
            incident,
            monitor,
            alertContact,
            rule: {
              alertOnDown: true,
              alertOnUp: true
            }
          });
        }
      }
    }

    // Also send notifications to enabled integrations
    const monitorWithWorkspace = await prisma.monitor.findUnique({
      where: { id: monitor.id },
      select: { workspaceId: true }
    });

    if (monitorWithWorkspace) {
      const integrations = await prisma.integration.findMany({
        where: {
          workspaceId: monitorWithWorkspace.workspaceId,
          enabled: true
        }
      });

      for (const integration of integrations) {
        try {
          await sendIntegrationNotification(integration, {
            type,
            incident,
            monitor
          });
        } catch (error) {
          console.error(`Failed to send notification to integration ${integration.name}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Failed to send incident notifications:', error);
  }
}

// Acknowledge incident
export async function acknowledgeIncident(incidentId, userId) {
  try {
    const incident = await prisma.incident.update({
      where: { id: incidentId },
      data: {
        acknowledgedAt: new Date(),
        acknowledgedBy: userId
      }
    });

    // Create acknowledgment update
    await prisma.incidentUpdate.create({
      data: {
        incidentId,
        status: 'identified',
        message: 'Incident has been acknowledged and is being investigated.',
        createdBy: userId,
        createdAt: new Date()
      }
    });

    return incident;
  } catch (error) {
    console.error('Failed to acknowledge incident:', error);
    throw error;
  }
}

// Update incident
export async function updateIncident(incidentId, status, message, userId) {
  try {
    const incident = await prisma.incident.update({
      where: { id: incidentId },
      data: { status }
    });

    // Create update
    await prisma.incidentUpdate.create({
      data: {
        incidentId,
        status,
        message,
        createdBy: userId,
        createdAt: new Date()
      }
    });

    return incident;
  } catch (error) {
    console.error('Failed to update incident:', error);
    throw error;
  }
}

// Get incident statistics
export async function getIncidentStats(workspaceId, timeRange = '30d') {
  try {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const incidents = await prisma.incident.findMany({
      where: {
        monitor: { workspaceId },
        startedAt: { gte: startDate }
      },
      include: {
        monitor: true,
        updates: true
      }
    });

    const stats = {
      total: incidents.length,
      resolved: incidents.filter(i => i.status === 'resolved').length,
      open: incidents.filter(i => i.status !== 'resolved').length,
      critical: incidents.filter(i => i.severity === 'critical').length,
      major: incidents.filter(i => i.severity === 'major').length,
      minor: incidents.filter(i => i.severity === 'minor').length,
      avgResolutionTime: 0
    };

    // Calculate average resolution time
    const resolvedIncidents = incidents.filter(i => i.resolvedAt);
    if (resolvedIncidents.length > 0) {
      const totalMinutes = resolvedIncidents.reduce((sum, incident) => {
        const duration = (incident.resolvedAt.getTime() - incident.startedAt.getTime()) / (1000 * 60);
        return sum + duration;
      }, 0);
      stats.avgResolutionTime = Math.round(totalMinutes / resolvedIncidents.length);
    }

    return stats;
  } catch (error) {
    console.error('Failed to get incident stats:', error);
    throw error;
  }
}
