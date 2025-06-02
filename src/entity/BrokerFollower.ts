import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { BrokerOffice } from './BrokerOffice';

@Entity('broker_followers')
export class BrokerFollower {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BrokerOffice ,{ onDelete: 'CASCADE' })
  broker_office: BrokerOffice;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  created_at: Date;
}