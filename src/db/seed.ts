import { eq } from 'drizzle-orm';
import { db } from './index';
import { users } from './schema';
import { env } from '../config/env';
import { passwordService } from '../services/passwordService';
import { passwordSchema } from '../validators/password';

async function seed() {
  const passwordCheck = passwordSchema.safeParse(env.SEED_ADMIN_PASSWORD);
  if (!passwordCheck.success) {
    console.error('SEED_ADMIN_PASSWORD does not meet password policy:', passwordCheck.error.flatten());
    process.exit(1);
  }

  const [existingAdmin] = await db.select({ id: users.id }).from(users).where(eq(users.role, 'admin')).limit(1);

  if (existingAdmin) {
    console.log('Admin user already exists — skipping seed.');
    process.exit(0);
  }

  const [existingEmail] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, env.SEED_ADMIN_EMAIL))
    .limit(1);

  if (existingEmail) {
    console.log(`User with email ${env.SEED_ADMIN_EMAIL} already exists — skipping seed.`);
    process.exit(0);
  }

  const hashedPassword = await passwordService.hashPassword(env.SEED_ADMIN_PASSWORD);

  const [admin] = await db
    .insert(users)
    .values({
      name: env.SEED_ADMIN_NAME,
      email: env.SEED_ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      status: 'active'
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role
    });

  console.log('Admin user created:', admin);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
