import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Subscription } from '../subscription/entities/subscription.entity';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([User, Role, Subscription]), // repositories available in this module
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_dev_secret',
      signOptions: { expiresIn: '9999 years' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService],
  exports: [
    AuthService,
    UserService,
    TypeOrmModule, // ✅ export TypeOrmModule so other modules can inject UserRepository
  ],
})
export class AuthModule {}
