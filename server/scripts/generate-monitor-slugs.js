import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// Helper function to ensure unique slug
async function generateUniqueSlug(name, existingSlugs = []) {
  let slug = generateSlug(name);
  let counter = 1;
  
  while (existingSlugs.includes(counter > 1 ? `${slug}-${counter}` : slug)) {
    counter++;
  }
  
  return counter > 1 ? `${slug}-${counter}` : slug;
}

async function main() {
  try {
    console.log('Fetching monitors without slugs...');
    
    const monitors = await prisma.monitor.findMany({
      where: {
        OR: [
          { slug: null },
          { slug: '' }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    if (monitors.length === 0) {
      console.log('No monitors need slug generation!');
      return;
    }

    console.log(`Found ${monitors.length} monitors without slugs.`);
    
    const usedSlugs = [];

    for (const monitor of monitors) {
      const slug = await generateUniqueSlug(monitor.name, usedSlugs);
      usedSlugs.push(slug);

      await prisma.monitor.update({
        where: { id: monitor.id },
        data: { slug }
      });

      console.log(`✓ Generated slug "${slug}" for monitor "${monitor.name}"`);
    }

    console.log(`\n✅ Successfully generated slugs for ${monitors.length} monitors!`);
  } catch (error) {
    console.error('Error generating slugs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

