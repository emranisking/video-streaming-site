// src/modules/subscription/controllers/subscription.controller.ts
import { Controller, Post, Req, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import type express from 'express';
import { SubscriptionService } from '../services/subscription.service';

import { UserService } from 'src/modules/auth/services/user.service';
import { JwtUtilService } from 'src/common/utils/jwt.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly userService: UserService,
    private readonly jwtUtilService: JwtUtilService,
  ) {}

  /**
   * Subscribe the logged-in user for unlimited access (30 days).
   * JWT must be provided in Authorization header.
   */
  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  async subscribe(@Req() req: express.Request) {
    const authHeader = req.headers['authorization'] as string | undefined;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization token missing');
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    // Verify JWT
    const payload = this.jwtUtilService.verifyToken(token);

    // Fetch user from DB
    const user = await this.userService.findById(payload.id);

    // Create subscription (30 days default)
    const subscription = await this.subscriptionService.createSubscription(user.id);

    return {
      message: 'Subscription activated successfully!',
      subscription,
    };
  }
}
