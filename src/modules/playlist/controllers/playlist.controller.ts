// playlist.controller.ts
import { Controller, Get, Post, Delete, Patch, Param, Headers, Body, BadRequestException } from '@nestjs/common';
import { PlaylistService } from '../services/playlist.service';

import { CreatePlaylistDto } from '../dto/create-playlist.dto';
import { JwtUtilService } from 'src/common/utils/jwt.service';
import { User } from 'src/modules/auth/entities/user.entity';

@Controller('playlist')
export class PlaylistController {
  playlistRepo: any;
  constructor(
    private readonly playlistService: PlaylistService,
    private readonly jwtUtil: JwtUtilService,
  ) {}

  /** Authenticate user from Authorization header */
  private authenticateUser(authHeader?: string) {
    if (!authHeader) throw new BadRequestException('Unauthorized');
    const token = authHeader.replace('Bearer ', '');
    const decoded = this.jwtUtil.decodeToken(token); // Use your JwtUtilService
    if (!decoded || !decoded['id']) throw new BadRequestException('Invalid token');
    return { id: decoded['id'] }; // Replace 'id' with whatever claim you store userId in
  }

  @Get()
  async getAllPlaylists(@Headers('authorization') authHeader?: string) {
    const user = this.authenticateUser(authHeader);
    return this.playlistService.getAllPlaylists(user.id);
  }

@Post()
async createPlaylist(
  @Body() dto: CreatePlaylistDto,
  @Headers('authorization') authHeader?: string
) {
  const user = this.authenticateUser(authHeader); // returns { id }
  return this.playlistService.createPlaylist(dto, user.id);
}


  @Post(':playlistId/add/:videoId')
  async addVideo(
    @Param('playlistId') playlistId: string,
    @Param('videoId') videoId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    const user = this.authenticateUser(authHeader);
    return this.playlistService.addVideoToPlaylist(playlistId, videoId, user.id);
  }

  @Delete(':playlistId/remove/:videoId')
  async removeVideo(
    @Param('playlistId') playlistId: string,
    @Param('videoId') videoId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    const user = this.authenticateUser(authHeader);
    return this.playlistService.removeVideoFromPlaylist(playlistId, videoId);
  }

  @Patch(':playlistId/move/:videoId/:newPosition')
  async moveVideo(
    @Param('playlistId') playlistId: string,
    @Param('videoId') videoId: string,
    @Param('newPosition') newPosition: number,
    @Headers('authorization') authHeader?: string,
  ) {
    const user = this.authenticateUser(authHeader);
    return this.playlistService.moveVideo(playlistId, videoId, newPosition);
  }

  @Delete(':playlistId')
  async deletePlaylist(@Param('playlistId') id: string, @Headers('authorization') authHeader?: string) {
    const user = this.authenticateUser(authHeader);
    return this.playlistService.deletePlaylist(id, user.id);
  }

}
