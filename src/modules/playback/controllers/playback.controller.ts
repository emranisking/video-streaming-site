// playback.controller.ts
import {
  Controller,
  Get,
  Param,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { PlaybackService } from '../services/playback.service';
import { PlaybackResponseDto } from '../dtos/playback-response.dto';


@Controller('playback')
export class PlaybackController {
  constructor(private readonly playbackService: PlaybackService) {}

  @Get(':videoId')
  @HttpCode(HttpStatus.OK)
  async play(
    @Param('videoId') videoId: string,
    @Req() req: Request,
    @Headers('x-session-id') sessionId?: string,
  ): Promise<PlaybackResponseDto> {
    const ip =
      (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const authHeader = (req.headers['authorization'] as string) || null;
    const userAgent = req.headers['user-agent'] || '';

    return this.playbackService.getPlaybackFor(videoId, {
      authorization: authHeader,
      sessionId,
      ip,
      userAgent: String(userAgent),
    });
  }
}
