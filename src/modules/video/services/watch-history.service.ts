// src/modules/video/services/watch-history.service.ts
import { Injectable } from '@nestjs/common';
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
  ) {}

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
    return this.historyRepo.find({
      where: { user: { id: userId } },
      order: { watchedAt: 'DESC' }, // Latest watched video comes first
    });
  }
}
