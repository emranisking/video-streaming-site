import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist } from './entities/playlist.entity';
import { PlaylistItem } from './entities/playlist-item.entity';
import { PlaylistService } from './services/playlist.service';
import { PlaylistController } from './controllers/playlist.controller';
import { AuthModule } from '../auth/auth.module';
import { VideoModule } from '../video/video.module';
import { Video } from '../video/entities/video.entity';

@Module({
  imports: [
    // Register playlist entities with TypeORM
    TypeOrmModule.forFeature([Playlist, PlaylistItem,Video]),

    // Resolve circular dependency with AuthModule (User entity)
    forwardRef(() => AuthModule),
    forwardRef(() => VideoModule),
  ],
  controllers: [PlaylistController],
  providers: [PlaylistService],
  exports: [PlaylistService],
})
export class PlaylistModule {}
