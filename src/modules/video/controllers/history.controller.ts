import { Controller, Post, Get, Param, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { WatchHistoryService } from '../services/watch-history.service';
import { UserService } from 'src/modules/auth/services/user.service';

@Controller('history')
@UseGuards(JwtAuthGuard) // ✅ This ensures only logged-in users can access
export class WatchHistoryController {
  constructor(
    private readonly historyService: WatchHistoryService,
    private readonly userService: UserService,
  ) {}

  // ➕ Add video to history
  @Post(':videoId')
  async addHistory(@Param('videoId') videoId: number, @Req() req: any) {
    const user = await this.userService.extractUserFromRequest(req);
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.historyService.addToHistory(user.id, videoId);
  }

  // 📜 Get user's watch history
  @Get()
  async getHistory(@Req() req: any) {
    const user = await this.userService.extractUserFromRequest(req);
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.historyService.getUserHistory(user.id);
  }
}
