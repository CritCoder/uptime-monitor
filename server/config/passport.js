import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../index.js';

// Configure Google OAuth Strategy only if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.SERVER_URL 
          ? `${process.env.SERVER_URL}/api/auth/google/callback`
          : `http://localhost:${process.env.PORT || 3000}/api/auth/google/callback`,
        passReqToCallback: true
      },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const avatarUrl = profile.photos[0]?.value;

        // Check if user already exists
        let user = await prisma.user.findUnique({
          where: { email },
          include: {
            workspaces: {
              include: {
                workspace: true
              }
            }
          }
        });

        if (user) {
          // User exists, update their info if needed
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              name: name || user.name,
              avatarUrl: avatarUrl || user.avatarUrl,
              isEmailVerified: true // Google emails are already verified
            },
            include: {
              workspaces: {
                include: {
                  workspace: true
                }
              }
            }
          });
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              name,
              email,
              avatarUrl,
              isEmailVerified: true,
              password: '' // No password for OAuth users
            },
            include: {
              workspaces: {
                include: {
                  workspace: true
                }
              }
            }
          });

          // Create default workspace for new user
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

          // Reload user with workspace info
          user = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
              workspaces: {
                include: {
                  workspace: true
                }
              }
            }
          });
        }

        return done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
    )
  );
} else {
  console.warn('Google OAuth credentials not provided. Google Sign-In will be disabled.');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        workspaces: {
          include: {
            workspace: true
          }
        }
      }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
