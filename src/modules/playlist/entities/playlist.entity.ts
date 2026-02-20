import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PlaylistItem } from './playlist-item.entity';
import { User } from 'src/modules/auth/entities/user.entity';

@Entity()
export class Playlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @OneToMany(() => PlaylistItem, (item) => item.playlist, { cascade: true })
  items: PlaylistItem[];

  @Column({ nullable: true })
  userId: string;

  // 👇 Use JoinColumn so TypeORM knows this is the foreign key
  @ManyToOne(() => User, (user) => user.playlists, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
