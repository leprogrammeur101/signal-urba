import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // --- Catégories ---
  const categories = [
    { name: 'Voirie',        slug: 'voirie',        icon: 'road'        },
    { name: 'Éclairage',     slug: 'eclairage',     icon: 'lightbulb'   },
    { name: 'Déchets',       slug: 'dechets',       icon: 'trash'       },
    { name: 'Eau',           slug: 'eau',            icon: 'droplet'     },
    { name: 'Signalisation', slug: 'signalisation',  icon: 'sign'        },
    { name: 'Autre',         slug: 'autre',          icon: 'circle-help' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where:  { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Catégories insérées');

  // --- Admin ---
  const passwordHash = await bcrypt.hash('Admin1234!', 10);
  await prisma.user.upsert({
    where:  { email: 'admin@signalurba.fr' },
    update: {},
    create: {
      email:        'admin@signalurba.fr',
      passwordHash,
      firstName:    'Admin',
      lastName:     'Signal',
      role:         'ADMIN',
    },
  });
  console.log('✅ Admin créé : admin@signalurba.fr / Admin1234!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => prisma.$disconnect());
