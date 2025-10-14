import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  const SUPERADMIN_USERS = [
    {
      email: 'suumit@mydukaan.io',
      password: 'suumit@mydukaan.io',
      name: 'Suumit Admin'
    },
    {
      email: 'floydbalismart@gmail.com',
      password: 'floydbalismart@gmail.com',
      name: 'Floyd Admin'
    }
  ];

  try {
    for (const adminData of SUPERADMIN_USERS) {
      const { email, password, name } = adminData;
      
      // Check if admin user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        console.log(`✅ Admin user already exists: ${email}`);
        console.log(`   ID: ${existingUser.id}`);
        console.log(`   Name: ${existingUser.name}`);
        
        // Reset password to ensure login works
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { 
            password: hashedPassword,
            isEmailVerified: true
          }
        });
        console.log(`✅ Password reset to: ${password}`);
        continue;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create admin user
      const adminUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          isEmailVerified: true
        }
      });

      console.log(`✅ Admin user created successfully!`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Password: ${password}`);
      console.log(`   ID: ${adminUser.id}`);
      console.log(`\n⚠️  Please change the password after first login!`);
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();

