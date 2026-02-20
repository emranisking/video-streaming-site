// src/modules/playback/services/playback.service.ts
import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { GuestTrackingService } from './guest-tracking.service';
import { ManifestService } from './manifest.service';
import { UserService } from 'src/modules/auth/services/user.service';
import { JwtUtilService } from 'src/common/utils/jwt.service';
import { PlaybackRequestDto } from '../dtos/playback-request.dto';
import { PlaybackResponseDto } from '../dtos/playback-response.dto';

@Injectable()
export class PlaybackService {
  private readonly logger = new Logger(PlaybackService.name);

  constructor(
    private readonly guestTracking: GuestTrackingService,
    private readonly manifestService: ManifestService,
    private readonly jwtUtilService: JwtUtilService,
    private readonly userService: UserService,
  ) {}

  /**
   * Returns manifest URL if allowed, or locked response
   */
  async getPlaybackFor(videoId: string, ctx: PlaybackRequestDto): Promise<PlaybackResponseDto> {
    const token = ctx.authorization?.split(' ')[1];
    let userId: string | undefined;

    if (token) {
      try {
        const payload = this.jwtUtilService.verifyToken(token);
        userId = payload.id;
      } catch (err) {
        // Invalid token → treat as guest
        userId = undefined;
      }
    }

    // If user exists, fetch subscription status
    let isSubscribed = false;
    if (userId) {
      const user = await this.userService.findById(userId);
      isSubscribed = !!user.isSubscribed;
    }

    // Subscribed users → unlimited access
    if (isSubscribed) {
      const manifestUrl = await this.manifestService.getManifest(videoId);
      return { manifestUrl, locked: false };
    }

    // Guest / non-subscriber flow → limit 10 videos
    const sessionId = ctx.sessionId || (ctx.ip ? String(ctx.ip) : 'unknown');
    const count = userId
      ? await this.guestTracking.incrementForUser(userId)
      : await this.guestTracking.incrementForSession(sessionId);

    const remaining = Math.max(0, 10 - count);
    const manifestUrl = await this.manifestService.getManifest(videoId);

    if (count > 10) {
      return {
        locked: true,
        reason: userId
          ? 'Payment required — subscribe to continue watching'
          : 'Account required — create an account to continue watching',
        freeRemaining: 0,
      };
    }

    return { manifestUrl, locked: false, freeRemaining: remaining };
  }
}
