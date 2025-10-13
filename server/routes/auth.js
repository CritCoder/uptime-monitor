import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendEmail } from '../services/email.js';
import passport from '../config/passport.js';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  timezone: z.string().optional().default('UTC')
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8).max(100)
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, timezone } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists',
        message: 'An account with this email address already exists. Please try logging in instead or use a different email address.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate email verification token
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        timezone,
        emailVerifyToken
      }
    });

    // Create default workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: `${name}'s Workspace`,
        slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
      }
    });

    // Add user as admin to workspace
    await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: 'admin'
      }
    });

    // Send verification email (optional - won't fail registration if email service is not configured)
    try {
      await sendEmail({
        to: email,
        subject: 'Verify your email address',
        template: 'email-verification',
        data: {
          name,
          verificationUrl: `${process.env.CLIENT_URL}/verify-email?token=${emailVerifyToken}`
        }
      });
    } catch (emailError) {
      console.warn('Email sending failed (non-critical):', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully. Please check your email to verify your account.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        timezone: user.timezone
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        workspaces: {
          include: {
            workspace: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'No account found with this email address. Please check your email or create a new account.'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Incorrect password. Please check your password and try again.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        timezone: user.timezone,
        plan: user.plan,
        isEmailVerified: user.isEmailVerified,
        workspaces: user.workspaces.map(m => ({
          id: m.workspace.id,
          name: m.workspace.name,
          slug: m.workspace.slug,
          role: m.role
        }))
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify email (GET route for email links)
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }

    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null
      }
    });

    // Redirect to login page with success message
    res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (error) {
    console.error('Email verification error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=verification_failed`);
  }
});

// Verify email (POST route for API calls)
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }

    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null
      }
    });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If an account exists with that email, a verification link has been sent.'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new verification token
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken }
    });

    // Send verification email
    try {
      await sendEmail({
        to: email,
        subject: 'Verify your email address',
        template: 'email-verification',
        data: {
          name: user.name,
          verificationUrl: `${process.env.CLIENT_URL}/verify-email?token=${emailVerifyToken}`
        }
      });
      console.log(`✅ Verification email resent to ${email}`);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.response?.data || emailError.message);
      // Don't fail the request - token is still valid
    }

    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate reset token
    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpires
      }
    });

    // Send reset email (optional - won't fail if email service is not configured)
    try {
      await sendEmail({
        to: email,
        subject: 'Reset your password',
        template: 'password-reset',
        data: {
          name: user.name,
          resetUrl: `${process.env.CLIENT_URL}/reset-password?token=${passwordResetToken}`
        }
      });
      console.log(`✅ Password reset email sent to ${email}`);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.response?.data || emailError.message);
      // Don't fail the request - the reset token is still valid in the database
      // The user can still reset their password if they have the link
    }

    // Always return success for security (don't reveal if email exists or was sent)
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Password reset request failed' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        workspaces: {
          include: {
            workspace: true
          }
        },
        apiTokens: {
          select: {
            id: true,
            name: true,
            lastUsed: true,
            expiresAt: true,
            createdAt: true
          }
        }
      }
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        timezone: user.timezone,
        plan: user.plan,
        isEmailVerified: user.isEmailVerified,
        workspaces: user.workspaces.map(m => ({
          id: m.workspace.id,
          name: m.workspace.name,
          slug: m.workspace.slug,
          role: m.role
        })),
        apiTokens: user.apiTokens
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, timezone, avatarUrl } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(timezone && { timezone }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        timezone: user.timezone
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// Google OAuth routes
// Initiate Google OAuth
router.get('/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(400).json({ 
      error: 'Google OAuth not configured',
      message: 'Google Sign-In is not available in development mode'
    });
  }
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })(req, res);
});

// Google OAuth callback
router.get('/google/callback', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(400).json({ 
      error: 'Google OAuth not configured',
      message: 'Google Sign-In is not available in development mode'
    });
  }
  
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`
  })(req, res, async (err) => {
    if (err) {
      console.error('Google OAuth callback error:', err);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
    
    try {
      // Generate JWT token for the authenticated user
      const token = jwt.sign(
        { userId: req.user.id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
  });
});

export default router;
