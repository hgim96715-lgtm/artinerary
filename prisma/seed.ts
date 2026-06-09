import 'dotenv/config';

import { PrismaClient, Role } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { EnvKeys } from '../src/config/env.keys';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env[EnvKeys.DATABASE_URL],
  }),
});

async function main() {
  const email = process.env[EnvKeys.ADMIN_EMAIL];
  const password = process.env[EnvKeys.ADMIN_PASSWORD];
  if (!email || !password) {
    throw new Error(
      `${EnvKeys.ADMIN_EMAIL} / ${EnvKeys.ADMIN_PASSWORD} 가 .env 에 필요합니다.`,
    );
  }
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash, role: Role.ADMIN },
    update: { passwordHash, role: Role.ADMIN },
  });
  console.log(`Admin seed 완료 :${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
