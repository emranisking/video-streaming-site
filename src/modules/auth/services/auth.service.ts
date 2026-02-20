// src/modules/auth/services/auth.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register({ email, password }: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email already exists');

    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({ email, password: hashed });
    await this.userRepo.save(user);

    const token = this.jwtService.sign({ id: user.id, email: user.email });
    return { user, token };
  }

  async login({ email, password }: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new BadRequestException('Invalid credentials');

    const token = this.jwtService.sign({ id: user.id, email: user.email });
    return { user, token };
  }
    verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }

}