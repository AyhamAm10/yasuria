import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { BrokerOffice } from './BrokerOffice';

@Entity('broker_portfolios')
export class BrokerPortfolio {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BrokerOffice, (office) => office.portfolios)
  broker_office: BrokerOffice;

  @Column()
  description: string;

  @Column('jsonb', { default: [] })
  images: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}