import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany, ManyToOne, Index } from 'typeorm';
import { User } from './User';
import { BrokerPortfolio } from './BrokerPortfolio';
import { BrokerFollower } from './BrokerFollower';
import { BrokerRating } from './BrokerRating';
import { Property } from './Property';
import { Car } from './Car';
import { Service } from './Services';

@Entity('broker_offices')
export class BrokerOffice {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  office_name: string;

  @Column({nullable:true})
  image: string;

  @Column()
  commercial_number: string;

  @Column()
  whatsapp_number: string;

  @Index()
  @Column()
  governorate: string;

  @Column()
  address: string;

  @Column('double precision')
  lat: number;

  @Column('double precision')
  long: number;

  @Column('time')
  working_hours_from: string;

  @Column('time')
  working_hours_to: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating_avg: number;

  @Column({ default: 0 })
  followers_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => BrokerPortfolio, (portfolio) => portfolio.broker_office)
  portfolios: BrokerPortfolio[];

  @OneToMany(() => BrokerFollower, (follower) => follower.broker_office)
  followers: BrokerFollower[];

  @OneToMany(() => BrokerRating, (rating) => rating.broker_office)
  ratings: BrokerRating[];

  @OneToMany(() => Property, (property) => property.broker_office)
  properties: Property[];

  @OneToMany(() => Car, (car) => car.broker_office)
  cars: Car[];

  @OneToMany(() => Service, (service) => service.broker_office)
  services: Service[];
}