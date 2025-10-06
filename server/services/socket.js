import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

// Initialize Socket.io
export function initializeSocket(io) {
  console.log('🔌 Initializing Socket.io...');

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          workspaces: {
            include: {
              workspace: true
            }
          }
        }
      });

      if (!user) {
        return next(new Error('Authentication error'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    console.log(`👤 User ${socket.userId} connected`);

    // Join user to their workspaces
    socket.user.workspaces.forEach(membership => {
      socket.join(`workspace:${membership.workspace.id}`);
    });

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle workspace joins
    socket.on('join-workspace', (workspaceId) => {
      // Verify user has access to workspace
      const hasAccess = socket.user.workspaces.some(
        membership => membership.workspace.id === workspaceId
      );
      
      if (hasAccess) {
        socket.join(`workspace:${workspaceId}`);
        console.log(`👤 User ${socket.userId} joined workspace ${workspaceId}`);
      }
    });

    // Handle workspace leaves
    socket.on('leave-workspace', (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
      console.log(`👤 User ${socket.userId} left workspace ${workspaceId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`👤 User ${socket.userId} disconnected`);
    });
  });

  console.log('✅ Socket.io initialized');
}

// Emit monitor status update
export function emitMonitorUpdate(io, workspaceId, monitor) {
  io.to(`workspace:${workspaceId}`).emit('monitor-update', {
    id: monitor.id,
    name: monitor.name,
    status: monitor.status,
    uptimePercentage: monitor.uptimePercentage,
    avgResponseTime: monitor.avgResponseTime,
    lastCheckAt: monitor.lastCheckAt
  });
}

// Emit incident update
export function emitIncidentUpdate(io, workspaceId, incident) {
  io.to(`workspace:${workspaceId}`).emit('incident-update', {
    id: incident.id,
    monitorId: incident.monitorId,
    title: incident.title,
    status: incident.status,
    severity: incident.severity,
    startedAt: incident.startedAt,
    resolvedAt: incident.resolvedAt
  });
}

// Emit notification to user
export function emitNotification(io, userId, notification) {
  io.to(`user:${userId}`).emit('notification', {
    id: notification.id,
    type: notification.type,
    message: notification.message,
    isRead: notification.isRead,
    createdAt: notification.createdAt
  });
}

// Emit status page update
export function emitStatusPageUpdate(io, statusPageId, data) {
  io.to(`status-page:${statusPageId}`).emit('status-page-update', data);
}

// Broadcast to all users in workspace
export function broadcastToWorkspace(io, workspaceId, event, data) {
  io.to(`workspace:${workspaceId}`).emit(event, data);
}

// Send real-time check result
export function emitCheckResult(io, workspaceId, check) {
  io.to(`workspace:${workspaceId}`).emit('check-result', {
    monitorId: check.monitorId,
    status: check.status,
    statusCode: check.statusCode,
    responseTime: check.responseTime,
    errorMessage: check.errorMessage,
    checkedAt: check.checkedAt,
    region: check.region
  });
}
