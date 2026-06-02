import { db } from '../db';
import { users } from '../db/schema';
import { passwordService } from '../services/passwordService';

async function seed() {
  console.log('Seeding database...');
  
  const hashedPassword = await passwordService.hashPassword('admin');
  
  // Check if admin user already exists
  const existingUser = await db.select().from(users).where(eq(users.email, 'admin@gmail.com')).limit(1);
  
  if (existingUser.length === 0) {
    await db.insert(users).values({
      email: 'admin@gmail.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      status: 'active',
      // Add any other required fields from your schema
    });
    
    console.log('Admin user created successfully!');
  } else {
    console.log('Admin user already exists');
  }
  
  console.log('Seeding complete!');
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0));