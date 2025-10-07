import express from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
});

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer']).default('member'),
});

// Get all workspaces for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const workspaces = await prisma.workspaceMember.findMany({
      where: { userId: req.user.id },
      include: {
        workspace: {
          include: {
            _count: {
              select: {
                members: true,
                monitors: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      workspaces: workspaces.map(wm => ({
        id: wm.workspace.id,
        name: wm.workspace.name,
        slug: wm.workspace.slug,
        role: wm.role,
        memberCount: wm.workspace._count.members,
        monitorCount: wm.workspace._count.monitors,
        createdAt: wm.workspace.createdAt,
      }))
    });
  } catch (error) {
    console.error('Get workspaces error:', error);
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

// Get workspace details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const workspace = await prisma.workspace.findFirst({
      where: {
        id,
        members: {
          some: { userId: req.user.id }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              }
            }
          }
        },
        _count: {
          select: {
            monitors: true,
            statusPages: true,
            alertContacts: true,
          }
        }
      }
    });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    res.json({ workspace });
  } catch (error) {
    console.error('Get workspace error:', error);
    res.status(500).json({ error: 'Failed to fetch workspace' });
  }
});

// Create workspace
router.post('/', authenticateToken, async (req, res) => {
  try {
    const data = createWorkspaceSchema.parse(req.body);

    // Generate unique slug
    const baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let slug = baseSlug;
    let counter = 1;
    
    while (await prisma.workspace.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: data.name,
        slug,
        members: {
          create: {
            userId: req.user.id,
            role: 'admin'
          }
        }
      }
    });

    res.status(201).json({ workspace });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create workspace error:', error);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

// Update workspace
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = updateWorkspaceSchema.parse(req.body);

    // Check if user is admin
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: id,
        userId: req.user.id,
        role: 'admin'
      }
    });

    if (!member) {
      return res.status(403).json({ error: 'Only admins can update workspace' });
    }

    const workspace = await prisma.workspace.update({
      where: { id },
      data
    });

    res.json({ workspace });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update workspace error:', error);
    res.status(500).json({ error: 'Failed to update workspace' });
  }
});

// Delete workspace
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: id,
        userId: req.user.id,
        role: 'admin'
      }
    });

    if (!member) {
      return res.status(403).json({ error: 'Only admins can delete workspace' });
    }

    // Check if it's the last workspace
    const userWorkspaceCount = await prisma.workspaceMember.count({
      where: { userId: req.user.id }
    });

    if (userWorkspaceCount <= 1) {
      return res.status(400).json({ error: 'Cannot delete your last workspace' });
    }

    await prisma.workspace.delete({
      where: { id }
    });

    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    console.error('Delete workspace error:', error);
    res.status(500).json({ error: 'Failed to delete workspace' });
  }
});

// Invite member to workspace
router.post('/:id/members', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = inviteMemberSchema.parse(req.body);

    // Check if user is admin or member
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: id,
        userId: req.user.id,
        role: { in: ['admin', 'member'] }
      }
    });

    if (!member) {
      return res.status(403).json({ error: 'Only admins and members can invite' });
    }

    // Find user by email
    const invitedUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!invitedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already a member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: invitedUser.id,
          workspaceId: id
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    const newMember = await prisma.workspaceMember.create({
      data: {
        userId: invitedUser.id,
        workspaceId: id,
        role: data.role
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          }
        }
      }
    });

    res.status(201).json({ member: newMember });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Invite member error:', error);
    res.status(500).json({ error: 'Failed to invite member' });
  }
});

// Remove member from workspace
router.delete('/:id/members/:userId', authenticateToken, async (req, res) => {
  try {
    const { id, userId } = req.params;

    // Check if user is admin
    const adminMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: id,
        userId: req.user.id,
        role: 'admin'
      }
    });

    if (!adminMember && userId !== req.user.id) {
      return res.status(403).json({ error: 'Only admins can remove members' });
    }

    // Check if removing last admin
    if (userId !== req.user.id) {
      const memberToRemove = await prisma.workspaceMember.findFirst({
        where: { workspaceId: id, userId }
      });

      if (memberToRemove?.role === 'admin') {
        const adminCount = await prisma.workspaceMember.count({
          where: { workspaceId: id, role: 'admin' }
        });

        if (adminCount <= 1) {
          return res.status(400).json({ error: 'Cannot remove the last admin' });
        }
      }
    }

    await prisma.workspaceMember.delete({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: id
        }
      }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Update member role
router.put('/:id/members/:userId', authenticateToken, async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user is admin
    const adminMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: id,
        userId: req.user.id,
        role: 'admin'
      }
    });

    if (!adminMember) {
      return res.status(403).json({ error: 'Only admins can update member roles' });
    }

    // Check if changing last admin
    if (role !== 'admin') {
      const memberToUpdate = await prisma.workspaceMember.findFirst({
        where: { workspaceId: id, userId }
      });

      if (memberToUpdate?.role === 'admin') {
        const adminCount = await prisma.workspaceMember.count({
          where: { workspaceId: id, role: 'admin' }
        });

        if (adminCount <= 1) {
          return res.status(400).json({ error: 'Cannot demote the last admin' });
        }
      }
    }

    const updatedMember = await prisma.workspaceMember.update({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: id
        }
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          }
        }
      }
    });

    res.json({ member: updatedMember });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
});

export default router;

