// src/modules/subscription/services/subscription.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { UserService } from 'src/modules/auth/services/user.service';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly userService: UserService,
  ) {}

  /**
   * Create a subscription for a user (called by controller)
   */
  async createSubscription(id: string): Promise<Subscription> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const subscription = this.subscriptionRepository.create({
      user,
      startDate: now,
      endDate,
      isActive: true,
    });

    await this.subscriptionRepository.save(subscription);

    // Update user's subscription status
    await this.userService.updateSubscription(id, true);

    this.logger.log(`User ${id} subscribed until ${endDate.toISOString()}`);
    return subscription;
  }

  /** Create a subscription for a user (legacy method, used internally) */
  async subscribeUser(userId: string): Promise<Subscription> {
    const user = await this.userService.findById(userId);

    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const subscription = this.subscriptionRepository.create({
      user,
      startDate: now,
      endDate,
      isActive: true,
    });

    await this.subscriptionRepository.save(subscription);

    // Update user's subscription status using existing UserService method
    await this.userService.updateSubscription(userId, true);

    this.logger.log(`User ${userId} subscribed until ${endDate.toISOString()}`);
    return subscription;
  }

  /** Cancel subscription */
  async cancelSubscription(userId: string): Promise<void> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    await this.userService.updateSubscription(userId, false);
    this.logger.warn(`Subscription cancelled for user ${userId}`);
  }

  /** Check if user is subscribed */
  async isUserSubscribed(userId: string): Promise<boolean> {
    const user = await this.userService.findById(userId);
    return !!user?.isSubscribed;
  }
}
