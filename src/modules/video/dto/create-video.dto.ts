// src/modules/video/dtos/create-video.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CreateVideoDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  videoUrl: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
}
