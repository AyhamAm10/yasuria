import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { BrokerOffice } from './BrokerOffice';

@Entity('broker_ratings')
export class BrokerRating {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BrokerOffice)
  broker_office: BrokerOffice;

  @ManyToOne(() => User)
  user: User;

  @Column('decimal', { precision: 2, scale: 1 })
  rating: number;

  @Column('text', { nullable: true })
  comment: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}