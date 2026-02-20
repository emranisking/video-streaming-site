import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Playlist } from './playlist.entity';
import { Video } from 'src/modules/video/entities/video.entity';

@Entity()
export class PlaylistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Video, { eager: true })
  video: Video;

  @ManyToOne(() => Playlist, (playlist) => playlist.items, { onDelete: 'CASCADE' })
  playlist: Playlist;

  @Column()
  position: number;
}
