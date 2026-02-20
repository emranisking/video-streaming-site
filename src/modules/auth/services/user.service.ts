// src/modules/auth/services/user.service.ts
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { AuthService } from './auth.service';

@Injectable()
export class UserService {
  jwtUtilService: any;
  constructor(
   @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authService: AuthService, // 👈 inject AuthService
  ) {}

  /** 🟢 Find user by ID */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User not found with ID: ${id}`);
    return user;
  }

  /** 🟡 Update user subscription status */
  async updateSubscription(userId: string, isSubscribed: boolean): Promise<User> {
    const user = await this.findById(userId);
    user.isSubscribed = isSubscribed;
    return this.userRepository.save(user);
  }

  /** 🟣 Optionally update subscription tier or expiry date later */
  async updateSubscriptionDetails(
    userId: string,
    details: { tier?: string; expiryDate?: Date },
  ): Promise<User> {
    const user = await this.findById(userId);
    Object.assign(user, details);
    return this.userRepository.save(user);
  }

  async extractUserFromRequest(req: any) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return null;
      const token = authHeader.split(' ')[1];
      const decoded = this.authService.verifyToken(token); // 👈 FIXED HERE
      if (!decoded?.id) return null;

      return await this.userRepository.findOne({
        where: { id: decoded.id },
        relations: ['subscriptions'],
      });
    } catch (err) {
      console.error('extractUserFromRequest error:', err);
      return null;
    }
  }}


