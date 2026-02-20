// playback/services/manifest.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { VideoService } from '../../video/services/video.service';

@Injectable()
export class ManifestService {
  constructor(private readonly videoService: VideoService) {}

  async getManifest(videoId: string) {
    // Get video entity from database
    const video = await this.videoService.findById(videoId);

    if (!video) throw new NotFoundException(`Video with ID ${videoId} not found`);

    // Return the actual HLS .m3u8 URL for streaming
    return video.videoUrl; // -> e.g., /videos_hls/<video-title>/<video-title>.m3u8
  }
}
