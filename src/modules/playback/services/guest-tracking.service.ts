import { Injectable } from '@nestjs/common';
import { CacheService } from './cache.service';
import { SubscriptionService } from 'src/modules/subscription/services/subscription.service';

@Injectable()
export class GuestTrackingService {
  private readonly FREE_LIMIT = 2;
  private readonly TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

  constructor(
    private readonly cache: CacheService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  private sessionKey(sessionId: string) {
    return `guest:session:${sessionId}`;
  }

  private ipKey(ip: string) {
    return `guest:ip:${ip}`;
  }

  private userKey(userId: string) {
    return `user:watchcount:${userId}`;
  }

  /** Increment guest or user watch count */
  async incrementForUser(userId: string): Promise<number> {
    // Subscribed users can watch unlimited
    const subscribed = await this.subscriptionService.isUserSubscribed(userId);
    if (subscribed) return 0;

    const key = this.userKey(userId);
    const exists = await this.cache.get<number>(key);
    if (exists === null) {
      await this.cache.set(key, 1, this.TTL_SECONDS);
      return 1;
    }
    const newVal = await this.cache.incr(key);
    await this.cache.expire(key, this.TTL_SECONDS);
    return newVal;
  }

  async incrementForSession(sessionId: string): Promise<number> {
    const key = this.sessionKey(sessionId);
    const exists = await this.cache.get<number>(key);
    if (exists === null) {
      await this.cache.set(key, 1, this.TTL_SECONDS);
      return 1;
    }
    const newVal = await this.cache.incr(key);
    await this.cache.expire(key, this.TTL_SECONDS);
    return newVal;
  }

  async incrementForIp(ip: string): Promise<number> {
    const key = this.ipKey(ip);
    const exists = await this.cache.get<number>(key);
    if (exists === null) {
      await this.cache.set(key, 1, this.TTL_SECONDS);
      return 1;
    }
    const newVal = await this.cache.incr(key);
    await this.cache.expire(key, this.TTL_SECONDS);
    return newVal;
  }

  /** Check free remaining for guests/users */
  async freeRemainingForUser(userId: string) {
    const subscribed = await this.subscriptionService.isUserSubscribed(userId);
    if (subscribed) return Infinity; // unlimited
    const count = await this.cache.get<number>(this.userKey(userId)) ?? 0;
    return Math.max(0, this.FREE_LIMIT - count);
  }

  async freeRemainingForSession(sessionId: string) {
    const count = await this.cache.get<number>(this.sessionKey(sessionId)) ?? 0;
    return Math.max(0, this.FREE_LIMIT - count);
  }

  /** Determine if count has reached limit */
  isLockedCount(count: number): boolean {
    return count >= this.FREE_LIMIT;
  }
}
