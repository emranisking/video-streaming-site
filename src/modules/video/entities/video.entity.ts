import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Category } from './category.entity';
import { WatchHistory } from './watch-history.entity';
import { UserLike } from './user-like.entity';


@Entity()
export class Video {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  duration: number; // seconds

  @ManyToOne(() => Category, (category) => category.videos, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  likes: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => WatchHistory, (history) => history.video)
  history: WatchHistory[];
    watchHistory: any;

  @OneToMany(() => UserLike, (like) => like.video)
  userLikes: UserLike[];
}
