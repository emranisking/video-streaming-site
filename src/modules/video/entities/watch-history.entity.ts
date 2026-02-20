import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Video } from '../entities/video.entity';
import { User } from 'src/modules/auth/entities/user.entity';


@Entity()
export class WatchHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.watchHistory, {eager: true})
  user: User;

  @ManyToOne(() => Video, (video) => video.watchHistory,{ eager: true})
  video: Video;

  @CreateDateColumn()
  watchedAt: Date;
}
