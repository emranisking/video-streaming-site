import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/auth/entities/user.entity';
import { Video } from './video.entity';

@Entity()
export class UserLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.likes, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Video, video => video.userLikes, { eager: true, onDelete: 'CASCADE' })
  video: Video;

  @CreateDateColumn()
  likedAt: Date;
}