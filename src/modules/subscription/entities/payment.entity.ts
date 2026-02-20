// subscription/entities/payment.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  paymentId: string;

  @Column()
  status: string;

  @Column()
  amount: number;

  @Column()
  currency: string;

  @CreateDateColumn()
  createdAt: Date;
}
