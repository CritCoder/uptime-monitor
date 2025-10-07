import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  const ADMIN_EMAIL = 'suumit@mydukaan.io';
  const ADMIN_PASSWORD = 'suumit@mydukaan.io'; // Same as email for easy login
  const ADMIN_NAME = 'Suumit Admin';

  try {
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL }
    });

    if (existingUser) {
      console.log(`✅ Admin user already exists: ${ADMIN_EMAIL}`);
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Name: ${existingUser.name}`);
      
      // Reset password to ensure login works
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { 
          password: hashedPassword,
          isEmailVerified: true
        }
      });
      console.log(`✅ Password reset to: ${ADMIN_PASSWORD}`);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        password: hashedPassword,
        name: ADMIN_NAME,
        isEmailVerified: true
      }
    });

    console.log(`✅ Admin user created successfully!`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   ID: ${adminUser.id}`);
    console.log(`\n⚠️  Please change the password after first login!`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();

