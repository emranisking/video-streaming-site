import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { VideoModule } from './modules/video/video.module';
import { PlaybackModule } from './modules/playback/playback.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { PlaylistModule } from './modules/playlist/playlist.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({ isGlobal: true }),

    // TypeORM configuration using env variables
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'password',
      database: process.env.DB_NAME || 'tv',
      autoLoadEntities: true,
      synchronize: true, // ⚠️ Only enable in dev
      logging: true,
    }),

    // Feature modules
    CommonModule,
    AuthModule,
    VideoModule,
    PlaybackModule,
    PlaylistModule,
    SubscriptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
