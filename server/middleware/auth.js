import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
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
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if email is verified (disabled in development)
    if (!user.isEmailVerified && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ 
        error: 'Email verification required',
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email address to continue. Check your inbox for the verification link.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireWorkspace = (requiredRole = 'viewer') => {
  return async (req, res, next) => {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required' });
    }

    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId: req.user.id,
        workspaceId: workspaceId
      },
      include: {
        workspace: true
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Access denied to workspace' });
    }

    // Check role permissions
    const roleHierarchy = { viewer: 0, member: 1, admin: 2 };
    const userRoleLevel = roleHierarchy[membership.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    req.workspace = membership.workspace;
    req.membership = membership;
    next();
  };
};

export const validateApiToken = async (req, res, next) => {
  const token = req.headers['x-api-token'];

  if (!token) {
    return res.status(401).json({ error: 'API token required' });
  }

  try {
    const apiToken = await prisma.apiToken.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            workspaces: {
              include: {
                workspace: true
              }
            }
          }
        }
      }
    });

    if (!apiToken || (apiToken.expiresAt && apiToken.expiresAt < new Date())) {
      return res.status(401).json({ error: 'Invalid or expired API token' });
    }

    // Update last used timestamp
    await prisma.apiToken.update({
      where: { id: apiToken.id },
      data: { lastUsed: new Date() }
    });

    req.user = apiToken.user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid API token' });
  }
};

// Admin authentication middleware - only allows whitelisted superadmin
export const requireAdmin = async (req, res, next) => {
  const SUPERADMIN_EMAIL = 'suumit@mydukaan.io';
  
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.email !== SUPERADMIN_EMAIL) {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }

  next();
};
