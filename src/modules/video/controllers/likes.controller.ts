import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { LikeService } from '../services/likeService.service';


@Controller('likes')
@UseGuards(JwtAuthGuard)
export class LikesController {
  constructor(private readonly likeService: LikeService) {}

  // GET /likes → list all liked videos for current user
  @Get()
  async getUserLikes(@Req() req) {
    const userId = req.user.id;
    return this.likeService.getUserLikes(userId);
  }

  // POST /likes/:videoId → add like
  @Post(':videoId')
  async addLike(@Req() req, @Param('videoId') videoId: number) {
    const userId = req.user.id;
    return this.likeService.addLike(userId, videoId);
  }

  // DELETE /likes/:videoId → remove like
  @Delete(':videoId')
  async removeLike(@Req() req, @Param('videoId') videoId: number) {
    const userId = req.user.id;
    return this.likeService.removeLike(userId, videoId);
  }
}