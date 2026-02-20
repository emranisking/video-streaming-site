import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, W } from 'typeorm';
import { Video } from '../entities/video.entity';
import { Category } from '../entities/category.entity';
import { PaginationService } from 'src/common/pagination/pagination.service';
import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';
import { request } from 'express';
import { User } from 'src/modules/auth/entities/user.entity';
import { WatchHistoryService } from './watch-history.service';
import { spawn } from 'child_process';

@Injectable()
export class VideoService implements OnModuleInit {
  
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    private readonly paginationService: PaginationService,

    private readonly watchHistoryService: WatchHistoryService,
  ) {}

  /**
   * Automatically called when the module initializes.
   * Scans the "video" folder, converts MP4 files to HLS, and updates the database.
   */
  async onModuleInit() {
    console.log('📺 Scanning local videos on startup...');
    await this.scanAndConvertAllLocalVideos();
    console.log('✅ Local videos processed and saved to database');
  }

  /**
   * Get paginated list of videos
   */
  async getVideos(page: number = 1, limit: number = 20): Promise<Video[]> {
    const skip = (page - 1) * limit;

    const [videos] = await this.videoRepository.findAndCount({
      take: limit,
      skip,
      select: ['id', 'title', 'thumbnailUrl', 'videoUrl', 'views', 'likes', 'createdAt'],
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });

    return videos;
  }

  async findById(id: string): Promise<Video> {
    const videoId = Number(id);
    if (isNaN(videoId)) throw new BadRequestException(`Invalid video ID: ${id}`);

    const video = await this.videoRepository.findOne({
      where: { id: videoId },
      relations: ['category'],
    });

    if (!video) throw new NotFoundException(`Video with ID ${id} not found`);
    return video;
  }

  async incrementViews(id: string, user: User | null): Promise<Video> {
    const video = await this.findById(id);
    video.views += 1;
    await this.videoRepository.save(video);
    if (user) {
      await this.watchHistoryService.addToHistory(user.id, video.id);
    }

    return video;
  }

  async likeVideo(id: string): Promise<Video> {
    const video = await this.findById(id);
    video.likes += 1;
    return await this.videoRepository.save(video);
  }

  getSignedManifestUrl(video: Video, ttlSeconds: number): string {
    const baseUrl = video.videoUrl;
    const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
    const token = 'secure-token-placeholder'; // Replace with real signing logic
    return `${baseUrl}?expires=${expires}&token=${token}`;
  }

  /**
   * Convert a local MP4 video to HLS segments and generate thumbnail
   */
  async convertLocalVideoToHls(video: Video): Promise<Video> {
    const inputPath = path.join(process.cwd(), 'video', `${video.title}.mp4`);
    const hlsOutputDir = path.join(process.cwd(), 'videos_hls', video.title);
    const hlsOutputPath = path.join(hlsOutputDir, `${video.title}.m3u8`);
    const thumbnailPath = path.join(process.cwd(), 'thumbnails', `${video.title}.jpg`);

    if (!fs.existsSync(hlsOutputDir)) fs.mkdirSync(hlsOutputDir, { recursive: true });

    // Convert asynchronously
    if (!fs.existsSync(hlsOutputPath)) {
      await new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
          '-i', inputPath,
          '-profile:v', 'baseline',
          '-level', '3.0',
          '-start_number', '0',
          '-hls_time', '6', // shorter segments for smoother playback
          '-hls_list_size', '0',
          '-f', 'hls',
          hlsOutputPath,
        ]);

        ffmpeg.on('close', code => code === 0 ? resolve(null) : reject(new Error(`ffmpeg exited ${code}`)));
      });
    }

  // Thumbnail
    if (!fs.existsSync(thumbnailPath)) {
      await new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
          '-i', inputPath,
          '-ss', '00:00:01',
          '-vframes', '1',
          thumbnailPath,
        ]);
        ffmpeg.on('close', code => code === 0 ? resolve(null) : reject(new Error(`thumbnail ffmpeg exited ${code}`)));
      });
    }

      video.videoUrl = `/videos_hls/${video.title}/${video.title}.m3u8`;
      video.thumbnailUrl = `/thumbnails/${video.title}.jpg`;
    return await this.videoRepository.save(video);
  }
  /**
   * Scan project root "video" folder, convert videos to HLS, generate thumbnails
   */
  async scanAndConvertAllLocalVideos(): Promise<void> {
    const localVideosDir = path.join(process.cwd(), 'video');

    if (!fs.existsSync(localVideosDir)) {
      console.error(`❌ Videos folder not found: ${localVideosDir}`);
      return;
    }

    const files = fs.readdirSync(localVideosDir).filter(f => f.endsWith('.mp4'));

    if (!files.length) {
      console.log('ℹ️ No MP4 videos found in video folder.');
      return;
    }

    for (const file of files) {
      const title = path.parse(file).name;
      let video = await this.videoRepository.findOne({ where: { title } });
      if (!video) {
        video = new Video();
        video.title = title;
      }
      await this.convertLocalVideoToHls(video);
    }
  }
}
