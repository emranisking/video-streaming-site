import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Subscription } from 'src/modules/subscription/entities/subscription.entity';
import { Playlist } from 'src/modules/playlist/entities/playlist.entity';
import { WatchHistory } from 'src/modules/video/entities/watch-history.entity';
import { UserLike } from 'src/modules/video/entities/user-like.entity';



@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  // 🟢 Indicates if user currently has an active paid subscription
  @Column({ default: false })
  isSubscribed: boolean;

  // 🟡 Optional: store which plan the user is on
  @Column({ nullable: true })
  subscriptionTier?: string; // e.g., 'BASIC', 'PREMIUM'

  // 🕒 Optional: store subscription expiry date
  @Column({ type: 'timestamp', nullable: true })
  subscriptionExpiry?: Date;

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];

  @OneToMany(() => Subscription, (sub) => sub.user)
  subscriptions: Subscription[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Playlist, (playlist) => playlist.user)
  playlists: Playlist[];

  @OneToMany(() => WatchHistory, (history) => history.user)
  watchHistory: WatchHistory[];

  @OneToMany(() => UserLike, (like) => like.user)
  likes: UserLike[];
}
