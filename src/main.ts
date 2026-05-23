import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { join, extname } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Helper: correct MIME mapping for HLS
  const mimeFor = (filePath: string) => {
    const ext = extname(filePath).toLowerCase();
    if (ext === '.m3u8') return 'application/vnd.apple.mpegurl';
    if (ext === '.mp4' || ext === '.m4s') return 'video/mp4';
    if (ext === '.ts') return 'video/mp2t';
    return 'application/octet-stream';
  };

  // Enable permissive CORS for testing
app.enableCors({
  origin: [
     'http://192.168.10.128:4000',
     'http://192.168.230.1:4000',
     'http://192.168.10.137:4000',
     'http://192.168.0.197:3000',
     'http://localhost:3000',
    // 'https://encephalic-marybeth-flagrantly.ngrok-free.dev/',
    
  ],
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Range','ngrok-skip-browser-warning'],
  exposedHeaders: ['Content-Length','Content-Range'],
  credentials: true,
});


  const expressApp = app.getHttpAdapter().getInstance();

  // Get configuration values
  const thumbnailsPath = configService.get<string>('THUMBNAILS_PATH', '/home/emran/project/thumbnails');
  const thumbnailsRoute = configService.get<string>('THUMBNAILS_ROUTE', '/thumbnails');
  const videosHlsPath = configService.get<string>('VIDEOS_HLS_PATH', join(__dirname, '..', 'videos_hls'));
  const videosHlsRoute = configService.get<string>('VIDEOS_HLS_ROUTE', '/videos_hls');
  const videoHlsPath = configService.get<string>('VIDEO_HLS_PATH', '/home/emran/project/video_hls');
  const videoHlsRoute = configService.get<string>('VIDEO_HLS_ROUTE', '/video_hls');

  // Thumbnails: serve both internal and external folders with correct CORS headers
  expressApp.use(
    thumbnailsRoute,
    (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, Range, Accept, Authorization'
      );
      res.setHeader(
        'Access-Control-Expose-Headers',
        'Content-Length, Content-Range'
      );
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Accept-Ranges', 'bytes');
      next();
    },
    (req, res, next) => {
      // First try to serve from external folder
      express.static(thumbnailsPath, {
        setHeaders: (res, filePath) => {
          res.setHeader('Content-Type', mimeFor(filePath));
          res.setHeader('Accept-Ranges', 'bytes');
        },
      })(req, res, () => {
        // If not found, try internal folder
        express.static(join(__dirname, '..', 'thumbnails'), {
          setHeaders: (res, filePath) => {
            res.setHeader('Content-Type', mimeFor(filePath));
            res.setHeader('Accept-Ranges', 'bytes');
          },
        })(req, res, next);
      });
    }
  );

  // HLS videos: static folder with correct headers
  expressApp.use(
    videosHlsRoute,
    (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Range, Content-Type, Authorization, ngrok-skip-browser-warning'
      );
      res.setHeader(
        'Access-Control-Expose-Headers',
        'Content-Length, Content-Range'
      );
      res.setHeader('Accept-Ranges', 'bytes');
      next();
    },
    express.static(videosHlsPath, {
      setHeaders: (res, filePath) => {
        res.setHeader('Content-Type', mimeFor(filePath));
        res.setHeader('Accept-Ranges', 'bytes');
      },
    })
  );

  // External HLS videos folder
  expressApp.use(
    videoHlsRoute,
    (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Range, Content-Type, Authorization, ngrok-skip-browser-warning'
      );
      res.setHeader(
        'Access-Control-Expose-Headers',
        'Content-Length, Content-Range'
      );
      res.setHeader('Accept-Ranges', 'bytes');
      next();
    },
    express.static(videoHlsPath, {
      setHeaders: (res, filePath) => {
        res.setHeader('Content-Type', mimeFor(filePath));
        res.setHeader('Accept-Ranges', 'bytes');
      },
    })
  );

  await app.listen(process.env.PORT || 7000,'0.0.0.0');
}
bootstrap();
