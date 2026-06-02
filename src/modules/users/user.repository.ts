import { asc, count, desc, eq, ilike, or } from 'drizzle-orm';
import { db } from '../../db';
import { users, type UserRow } from '../../db/schema';
import type { UserRole, UserStatus } from '../../types/app';

export type UserRepositoryListInput = {
  page: number;
  pageSize: number;
  search?: string;
  sortBy: 'name' | 'email' | 'createdAt';
  sortOrder: 'asc' | 'desc';
};

function sortColumn(sortBy: UserRepositoryListInput['sortBy']) {
  switch (sortBy) {
    case 'name':
      return users.name;
    case 'email':
      return users.email;
    default:
      return users.createdAt;
  }
}

export const userRepository = {
  async findById(id: number): Promise<UserRow | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user ?? null;
  },

  async findByEmail(email: string): Promise<UserRow | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user ?? null;
  },

  async list(query: UserRepositoryListInput): Promise<{ items: UserRow[]; total: number }> {
    const { page, pageSize, search, sortBy, sortOrder } = query;
    const offset = (page - 1) * pageSize;

    const filters = search
      ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
      : undefined;

    const orderExpr = sortOrder === 'asc' ? asc(sortColumn(sortBy)) : desc(sortColumn(sortBy));

    const [items, totalRow] = await Promise.all([
      db
        .select()
        .from(users)
        .where(filters)
        .orderBy(orderExpr)
        .limit(pageSize)
        .offset(offset),
      db.select({ total: count() }).from(users).where(filters)
    ]);

    return {
      items,
      total: totalRow[0]?.total ?? 0
    };
  },

  async insert(input: Omit<UserRow, 'id' | 'createdAt'>): Promise<UserRow> {
    const [created] = await db.insert(users).values(input).returning();
    return created;
  },

  async update(
    id: number,
    patch: Partial<{
      name: string;
      avatar: string | null;
      role: UserRole;
      status: UserStatus;
    }>
  ): Promise<UserRow | null> {
    const [updated] = await db.update(users).set(patch).where(eq(users.id, id)).returning();
    return updated ?? null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
    return result.length > 0;
  },

  async isActive(id: number): Promise<boolean> {
    const [user] = await db
      .select({ status: users.status })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user?.status === 'active';
  }
};
