import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLike } from '../entities/user-like.entity';
import { User } from 'src/modules/auth/entities/user.entity';
import { Video } from '../entities/video.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(UserLike)
    private readonly likeRepo: Repository<UserLike>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Video)
    private readonly videoRepo: Repository<Video>,
  ) {}

  async addLike(userId: string, videoId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const video = await this.videoRepo.findOne({ where: { id: videoId } });
    if (!user || !video) throw new Error('User or Video not found');

    let like = await this.likeRepo.findOne({ where: { user: { id: userId }, video: { id: videoId } } });
    if (!like) {
      like = this.likeRepo.create({ user, video });
      await this.likeRepo.save(like);

      // increment global counter
      video.likes += 1;
      await this.videoRepo.save(video);
    }
    return like;
  }

  async removeLike(userId: string, videoId: number) {
    const like = await this.likeRepo.findOne({ where: { user: { id: userId }, video: { id: videoId } } });
    if (like) {
      await this.likeRepo.remove(like);

      const video = await this.videoRepo.findOne({ where: { id: videoId } });
      if (video && video.likes > 0) {
        video.likes -= 1;
        await this.videoRepo.save(video);
      }
    }
  }

  async getUserLikes(userId: string) {
    return this.likeRepo.find({
      where: { user: { id: userId } },
      relations: ['video'],
      order: { likedAt: 'DESC' },
    });
  }
}