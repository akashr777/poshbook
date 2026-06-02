import { userRepository } from './user.repository';
import type { PublicUser, UserCreateInput, UserUpdateInput, UsersQueryInput } from './user.types';
import { toPublicUser } from './user.types';
import { authService } from '../auth';
import { emailService } from '../../services/emailService';
import { passwordService } from '../../services/passwordService.js';  // ← FIXED

export const userService = {
  async findById(id: number): Promise<PublicUser | null> {
    const user = await userRepository.findById(id);
    return user ? toPublicUser(user) : null;
  },

  async findByEmail(email: string) {
    return userRepository.findByEmail(email);
  },

  async list(query: UsersQueryInput) {
    const { items, total } = await userRepository.list(query);
    return {
      items: items.map(toPublicUser),
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize))
    };
  },

  async create(input: UserCreateInput): Promise<PublicUser> {
    const existing = await this.findByEmail(input.email);
    if (existing) {
      throw Object.assign(new Error('Email already in use'), { code: 'EMAIL_EXISTS' });
    }

    const plainPassword = await passwordService.generateSecureRandomPassword();
    const hashedPassword = await passwordService.hashPassword(plainPassword);

    const created = await userRepository.insert({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
      status: input.status,
      avatar: input.avatar ?? null
    });

    try {
      await emailService.sendPasswordEmail(created.email, plainPassword);
    } catch (err) {
      console.error('Failed to send welcome email:', err);
      console.log('=== USER CREATED BUT EMAIL NOT SENT ===');
      console.log('Email:', created.email);
      console.log('Temporary password:', plainPassword);
      console.log('=======================================');
    }

    return toPublicUser(created);
  },

  async update(id: number, input: UserUpdateInput): Promise<PublicUser | null> {
    const patch: Partial<{
      name: string;
      avatar: string | null;
      role: any;
      status: any;
    }> = {};

    if (input.name !== undefined) patch.name = input.name;
    if (input.avatar !== undefined) patch.avatar = input.avatar;
    if (input.role !== undefined) patch.role = input.role;
    if (input.status !== undefined) patch.status = input.status;

    if (Object.keys(patch).length === 0) {
      return this.findById(id);
    }

    const updated = await userRepository.update(id, patch);
    return updated ? toPublicUser(updated) : null;
  },

  async remove(id: number): Promise<boolean> {
    return userRepository.delete(id);
  },

  async isActiveUser(id: number): Promise<boolean> {
    return userRepository.isActive(id);
  }
};