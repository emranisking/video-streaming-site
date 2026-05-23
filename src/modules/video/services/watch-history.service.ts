// src/modules/video/services/watch-history.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchHistory } from '../entities/watch-history.entity';
import { Video } from '../entities/video.entity';
import { User } from 'src/modules/auth/entities/user.entity';

@Injectable()
export class WatchHistoryService {
  constructor(
    @InjectRepository(WatchHistory)
    private readonly historyRepo: Repository<WatchHistory>,
    @InjectRepository(Video)
    private readonly videoRepo: Repository<Video>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Normalize video URLs to relative routes (remove absolute paths)
   */
  private normalizeVideoUrl(url: string): string {
    if (!url) return url;
    const videosHlsPath = this.configService.get<string>('VIDEOS_HLS_PATH', '/home/emran/project/videos_hls');
    const videoHlsPath = this.configService.get<string>('VIDEO_HLS_PATH', '/home/emran/project/video_hls');
    const thumbnailsPath = this.configService.get<string>('THUMBNAILS_PATH', '/home/emran/project/thumbnails');
    const videosHlsRoute = this.configService.get<string>('VIDEOS_HLS_ROUTE', '/videos_hls');
    const videoHlsRoute = this.configService.get<string>('VIDEO_HLS_ROUTE', '/video_hls');
    const thumbnailsRoute = this.configService.get<string>('THUMBNAILS_ROUTE', '/thumbnails');

    if (url.includes(videosHlsPath)) {
      return url.replace(videosHlsPath, videosHlsRoute);
    }
    if (url.includes(videoHlsPath)) {
      return url.replace(videoHlsPath, videoHlsRoute);
    }
    if (url.includes(thumbnailsPath)) {
      return url.replace(thumbnailsPath, thumbnailsRoute);
    }
    return url;
  }

  // ➕ Add video to history
  async addToHistory(userId: string, videoId: number) {
  const user = await this.userRepo.findOne({ where: { id: userId } });
  const video = await this.videoRepo.findOne({ where: { id: videoId } });

  if (!user || !video) throw new Error('User or Video not found');

  // Check if history already exists
  let history = await this.historyRepo.findOne({
    where: { user: { id: userId }, video: { id: videoId } },
  });

  if (history) {
    // Update timestamp instead of creating new row
    history.watchedAt = new Date();
  } else {
    history = this.historyRepo.create({ user, video });
  }

  return this.historyRepo.save(history);
}


  // 📜 Get user's watch history
  async getUserHistory(userId: string) {
    const history = await this.historyRepo.find({
      where: { user: { id: userId } },
      relations: ['video'],
      order: { watchedAt: 'DESC' }, // Latest watched video comes first
    });

    // Normalize video URLs in history
    history.forEach(entry => {
      if (entry.video) {
        entry.video.videoUrl = this.normalizeVideoUrl(entry.video.videoUrl);
        entry.video.thumbnailUrl = this.normalizeVideoUrl(entry.video.thumbnailUrl);
      }
    });

    return history;
  }
}
