import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CommonModule } from 'src/common/common.module';
import { VideoModule } from '../video/video.module';
import { AuthModule } from '../auth/auth.module'; // ✅ Import AuthModule
import { PlaybackController } from './controllers/playback.controller';
import { PlaybackService } from './services/playback.service';
import { CacheService } from './services/cache.service';
import { GuestTrackingService } from './services/guest-tracking.service';
import { ManifestService } from './services/manifest.service';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [
    HttpModule,                  
    CommonModule,                
    forwardRef(() => VideoModule),
    forwardRef(() => AuthModule), // ✅ Needed for UserService injection
    forwardRef(() => SubscriptionModule),
  ],
  controllers: [PlaybackController],
  providers: [
    PlaybackService,
    GuestTrackingService,
    CacheService,
    ManifestService,
  ],
  exports: [
    PlaybackService,
    GuestTrackingService,
  ],
})
export class PlaybackModule {}
