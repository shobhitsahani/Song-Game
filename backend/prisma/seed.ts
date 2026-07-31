import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const testUser = await prisma.user.upsert({
    where: { username: 'testplayer' },
    update: {},
    create: {
      username: 'testplayer',
      deezerId: 'test-deezer-id',
      email: 'test@songgame.com',
      xp: 1000,
    },
  });

  const demoAchievements = [
    { type: 'FIRST_WIN', title: 'First Victory', description: 'Win your first game' },
    { type: 'PLAY_100_GAMES', title: 'Dedicated', description: 'Play 100 games' },
  ];

  for (const achievement of demoAchievements) {
    await prisma.achievement.upsert({
      where: { userId_type: { userId: testUser.id, type: achievement.type } },
      update: {},
      create: {
        userId: testUser.id,
        type: achievement.type,
        title: achievement.title,
        description: achievement.description,
        icon: '🏆',
        rarity: 'common',
        xpReward: 100,
      },
    });
  }

  console.log('Seed complete!');
  console.log({ testUser: testUser.id });
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
