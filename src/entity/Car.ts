import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { BrokerOffice } from './BrokerOffice';

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title_ar: string;

  @Column()
  title_en: string;

  @Column('text')
  desc_ar: string;

  @Column('text')
  desc_en: string;

  @Column('jsonb', { default: [] })
  images: string[];

  @Column()
  model: string;

  @Column()
  brand: string;

  @Column()
  location: string;

  @Column('double precision', { nullable: true })
  lat: number;

  @Column('double precision', { nullable: true })
  long: number;

  @Column()
  status: string;

  @Column({ default: false })
  isActive: boolean;

  @Column('decimal')
  price: number;

  @Column({
    type: 'enum',
    enum: ['sale', 'rent'],
  })
  listing_type: string;

  @Column({
    type: 'enum',
    enum: ['owner', 'broker'],
  })
  seller_type: string;

  @ManyToOne(() => BrokerOffice, { nullable: true })
  broker_office: BrokerOffice;

  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn()
  created_at: Date;
}