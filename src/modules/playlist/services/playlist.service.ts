import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from '../entities/playlist.entity';
import { PlaylistItem } from '../entities/playlist-item.entity';
import { Video } from 'src/modules/video/entities/video.entity';
import { CreatePlaylistDto } from '../dto/create-playlist.dto';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private readonly playlistRepo: Repository<Playlist>,

    @InjectRepository(PlaylistItem)
    private readonly itemRepo: Repository<PlaylistItem>,

    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
  ) {}

  /**
   * Normalize video URLs to relative routes (remove absolute paths)
   */
  private normalizeVideoUrl(url: string): string {
    if (!url) return url;
    if (url.includes('/home/emran/project/videos_hls/')) {
      return url.replace('/home/emran/project/videos_hls/', '/videos_hls/');
    }
    if (url.includes('/home/emran/project/video_hls/')) {
      return url.replace('/home/emran/project/video_hls/', '/video_hls/');
    }
    if (url.includes('/home/emran/project/thumbnails/')) {
      return url.replace('/home/emran/project/thumbnails/', '/thumbnails/');
    }
    return url;
  }

  /**
   * Recursively normalize all video URLs in a playlist
   */
  private normalizePlaylist(playlist: Playlist): Playlist {
    if (playlist.items && Array.isArray(playlist.items)) {
      playlist.items.forEach(item => {
        if (item.video) {
          item.video.videoUrl = this.normalizeVideoUrl(item.video.videoUrl);
          item.video.thumbnailUrl = this.normalizeVideoUrl(item.video.thumbnailUrl);
        }
      });
    }
    return playlist;
  }

  // Get all playlists for a user
  async getAllPlaylists(userId: string): Promise<Playlist[]> {
    const playlists = await this.playlistRepo.find({ where: { userId }, relations: ['items', 'items.video'] });
    return playlists.map(p => this.normalizePlaylist(p));
  }

  // Create a new playlist
async createPlaylist(dto: CreatePlaylistDto, userId: string): Promise<Playlist> {
  const playlist = this.playlistRepo.create({ ...dto, userId }); // userId from JWT
  return this.playlistRepo.save(playlist);
}


  // Get playlist by ID
  async getPlaylistById(id: string): Promise<Playlist> {
    const playlist = await this.playlistRepo.findOne({
      where: { id },
      relations: ['items', 'items.video'],
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    return this.normalizePlaylist(playlist);
  }

  // Add video to playlist
  async addVideoToPlaylist(playlistId: string, videoId: string, userId: string): Promise<Playlist>{
    const playlist = await this.getPlaylistById(playlistId);
    const video = await this.videoRepository.findOne({ where: { id: Number(videoId) } });
    if (!video) throw new BadRequestException(`Video ID ${videoId} does not exist`);

    if (playlist.items.some(item => item.video.id === Number(videoId)))
      throw new BadRequestException('Video already in playlist');

    const position = playlist.items.length ? Math.max(...playlist.items.map(i => i.position)) + 1 : 1;
    const newItem = this.itemRepo.create({ video, playlist, position });
    await this.itemRepo.save(newItem);

    playlist.items.push(newItem);
    playlist.items.sort((a, b) => a.position - b.position);
    return this.normalizePlaylist(playlist);
  }

  // Remove video
  async removeVideoFromPlaylist(playlistId: string, videoId: string): Promise<Playlist> {
    const playlist = await this.getPlaylistById(playlistId);
    const item = playlist.items.find(i => i.video.id === Number(videoId));
    if (!item) throw new NotFoundException('Video not found in playlist');

    await this.itemRepo.delete(item.id);

    playlist.items = playlist.items
      .filter(i => i.id !== item.id)
      .sort((a, b) => a.position - b.position)
      .map((i, index) => ({ ...i, position: index + 1 }));

    for (const i of playlist.items) {
      await this.itemRepo.update(i.id, { position: i.position });
    }

    return this.normalizePlaylist(playlist);
  }

  // Move video to new position
  async moveVideo(playlistId: string, videoId: string, newPosition: number): Promise<Playlist> {
    const playlist = await this.getPlaylistById(playlistId);
    const item = playlist.items.find(i => i.video.id === Number(videoId));
    if (!item) throw new NotFoundException('Video not found in playlist');

    playlist.items = playlist.items.filter(i => i.video.id !== Number(videoId));
    playlist.items.splice(newPosition - 1, 0, item);

    playlist.items.forEach((i, index) => (i.position = index + 1));
    await Promise.all(playlist.items.map(i => this.itemRepo.update(i.id, { position: i.position })));

    return this.normalizePlaylist(playlist);
  }
}
