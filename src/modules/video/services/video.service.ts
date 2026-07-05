import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

    private readonly configService: ConfigService,
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
   * Normalize URLs to relative routes (remove absolute paths)
   */
  private normalizeUrl(url: string): string {
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

    // Normalize all URLs to relative routes
    videos.forEach(video => {
      video.videoUrl = this.normalizeUrl(video.videoUrl);
      video.thumbnailUrl = this.normalizeUrl(video.thumbnailUrl);
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
    
    // Normalize URLs to relative routes
    video.videoUrl = this.normalizeUrl(video.videoUrl);
    video.thumbnailUrl = this.normalizeUrl(video.thumbnailUrl);
    
    return video;
  }

  async incrementViews(id: string, user: User | null): Promise<Video> {
    const video = await this.findById(id);
    video.views += 1;
    const updated = await this.videoRepository.save(video);
    updated.videoUrl = this.normalizeUrl(updated.videoUrl);
    updated.thumbnailUrl = this.normalizeUrl(updated.thumbnailUrl);
    if (user) {
      await this.watchHistoryService.addToHistory(user.id, video.id);
    }

    return updated;
  }

  async likeVideo(id: string): Promise<Video> {
    const video = await this.findById(id);
    video.likes += 1;
    const updated = await this.videoRepository.save(video);
    updated.videoUrl = this.normalizeUrl(updated.videoUrl);
    updated.thumbnailUrl = this.normalizeUrl(updated.thumbnailUrl);
    return updated;
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
    const videoDir = path.join(process.cwd(), 'video');
    const videosHlsPath = this.configService.get<string>('VIDEOS_HLS_PATH', path.join(process.cwd(), 'videos_hls'));
    const thumbnailsPath = this.configService.get<string>('THUMBNAILS_PATH', path.join(process.cwd(), 'thumbnails'));
    const videosHlsRoute = this.configService.get<string>('VIDEOS_HLS_ROUTE', '/videos_hls');
    const thumbnailsRoute = this.configService.get<string>('THUMBNAILS_ROUTE', '/thumbnails');

    const files = fs.readdirSync(videoDir).filter(f => f.endsWith('.mp4'));
    
    // Find the actual file that matches the title
    const matchingFile = files.find(f => 
      path.parse(f).name.replace(/\s+/g, ' ').trim() === video.title
    );
    
    if (!matchingFile) {
      throw new Error(`Video file not found for title: ${video.title}`);
    }
    
    const inputPath = path.join(videoDir, matchingFile);
    const hlsOutputDir = path.join(videosHlsPath, video.title);
    const hlsOutputPath = path.join(hlsOutputDir, `${video.title}.m3u8`);
    const thumbnailPath = path.join(thumbnailsPath, `${video.title}.jpg`);

    if (!fs.existsSync(hlsOutputDir)) fs.mkdirSync(hlsOutputDir, { recursive: true });
    if (!fs.existsSync(path.dirname(thumbnailPath))) {
      fs.mkdirSync(path.dirname(thumbnailPath), { recursive: true });
    }

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

        let errorOutput = '';
        ffmpeg.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        ffmpeg.on('error', (err) => {
          reject(new Error(`Failed to spawn ffmpeg: ${err.message}`));
        });

        ffmpeg.on('close', code => {
          if (code === 0) {
            resolve(null);
          } else {
            reject(new Error(`ffmpeg exited ${code}\nError: ${errorOutput}`));
          }
        });
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

        let errorOutput = '';
        ffmpeg.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        ffmpeg.on('error', (err) => {
          reject(new Error(`Failed to spawn ffmpeg for thumbnail: ${err.message}`));
        });

        ffmpeg.on('close', code => {
          if (code === 0) {
            resolve(null);
          } else {
            reject(new Error(`thumbnail ffmpeg exited ${code}\nError: ${errorOutput}`));
          }
        });
      });
    }

      video.videoUrl = `${videosHlsRoute}/${video.title}/${video.title}.m3u8`;
      video.thumbnailUrl = `${thumbnailsRoute}/${video.title}.jpg`;
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
      // Extract title and normalize spaces
      let title = path.parse(file).name
        .replace(/\s+/g, ' ')
        .trim();
      
      let video = await this.videoRepository.findOne({ where: { title } });
      if (!video) {
        video = new Video();
        video.title = title;
      }
      await this.convertLocalVideoToHls(video);
    }
  }


}
