// src/modules/common/common.module.ts
import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtUtilService } from './utils/jwt.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { PaginationService } from './pagination/pagination.service';



@Global() // Make this module globally available so we don’t need to import in every module
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecretkey',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [
    JwtUtilService,
    LoggingInterceptor,
    
    PaginationService, // added pagination service
  ],
  exports: [
    JwtUtilService,
    LoggingInterceptor,
    
    PaginationService,
    JwtModule,
  ],
})
export class CommonModule {}
