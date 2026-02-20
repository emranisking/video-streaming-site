import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  Patch, 
  UseGuards, 
  Post, 
  Req, 
  Request
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { VideoService } from '../services/video.service';
import { GuestTrackingService } from 'src/modules/playback/services/guest-tracking.service';
import { UserService } from 'src/modules/auth/services/user.service';
import { User } from 'src/modules/auth/entities/user.entity';

@Controller('videos')
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    private readonly guestTrackingService: GuestTrackingService,
    private readonly userService: UserService,
  ) {}

  // Get paginated videos
  @Get()
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 20) {
    return this.videoService.getVideos(page, limit);
  }

  // Get single video details
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videoService.findById(id);
  }

  // Increment video views
  @UseGuards(JwtAuthGuard)
  @Patch(':id/views')
    async incrementViews(@Param('id') id: string, @Req() req: Request) {
    const user = await this.userService.extractUserFromRequest(req);
    return this.videoService.incrementViews(id, user);
  }


  // Like a video (authenticated)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/like')
  async likeVideo(@Param('id') id: string) {
    const updatedVideo = await this.videoService.likeVideo(id);
    return { likes: updatedVideo.likes };
  }

  // ---------------------------
  // Guest + User Watch Limit Logic
  // ---------------------------

  // Check free remaining videos
  @Get(':id/check-limit')
  async checkLimit(
    @Param('id') id: string,
    @Query('sessionId') sessionId: string,
    @Req() req: Request,
  ) {
    const authHeader = req.headers['authorization'] as string | undefined;

    // Case 1: Logged-in user
    if (authHeader) {
      const user = await this.userService.extractUserFromRequest(req);
      if (user && user.isSubscribed) return { locked: false, remaining: 'unlimited' };

      const userKey = user ? `user-${user.id}` : sessionId;
      const remaining = await this.guestTrackingService.freeRemainingForSession(userKey);
      return { locked: remaining === 0, remaining };
    }

    // Case 2: Guest user
    const remaining = await this.guestTrackingService.freeRemainingForSession(sessionId);
    return { locked: remaining === 0, remaining };
  }

  // Increment guest/user watch count
  @Post(':id/increment')
  async increment(
    @Param('id') id: string,
    @Query('sessionId') sessionId: string,
    @Req() req: Request,
  ) {
    const authHeader = req.headers['authorization'] as string | undefined;

    if (authHeader) {
      const user = await this.userService.extractUserFromRequest(req);
      if (user && user.isSubscribed) {
        return { count: 'unlimited' };
      }

      const userKey = user ? `user-${user.id}` : sessionId;
      const count = await this.guestTrackingService.incrementForSession(userKey);
      return { count };
    }

    // Guest user
    const count = await this.guestTrackingService.incrementForSession(sessionId);
    return { count };
  }
}
