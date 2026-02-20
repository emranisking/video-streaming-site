import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { Category } from './entities/category.entity';
import { VideoController } from './controllers/video.controller';
import { VideoService } from './services/video.service';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from '../auth/auth.module';
import { PlaybackModule } from '../playback/playback.module'; // ← added
import { WatchHistoryController } from './controllers/history.controller';
import { WatchHistoryService } from './services/watch-history.service';
import { WatchHistory } from './entities/watch-history.entity';
import { UserLike } from './entities/user-like.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Video, Category,WatchHistory,UserLike]),

    // ✅ Import Common utilities (pagination, cache, etc.)
    CommonModule,

    // ✅ Bring in AuthModule to access JwtService, JwtAuthGuard, etc.
    forwardRef(() => AuthModule),

    // ✅ Import PlaybackModule to provide GuestTrackingService
    forwardRef(() => PlaybackModule),
  ],

  controllers: [VideoController, WatchHistoryController],
  providers: [
    VideoService,
    PaginationService,
    WatchHistoryService,
  ],

  // ✅ Export anything that might be used elsewhere
  exports: [
    VideoService,
    TypeOrmModule,
    WatchHistoryService,
  ],
})
export class VideoModule {}
