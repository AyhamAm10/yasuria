import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from './User';
import { PropertyType } from './PropertyType';
import { BrokerOffice } from './BrokerOffice';

export enum ListingType {
  SALE = 'sale',
  RENT = 'rent'
}

export enum SellerType {
  OWNER = 'owner',
  BROKER = 'broker'
}

@Entity('properties')
export class Property {
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

  @Column({ default: false })
  isActive: boolean;

  @Column()
  location: string;

  @Column('jsonb', { default: [] })
  images: string[];

  @Column('double precision', { nullable: true })
  lat: number;

  @Column('double precision', { nullable: true })
  long: number;

  @Column()
  status: string;

  @Column('decimal')
  price: number;

  @Column()
  area: string;

  @Column({
    type: 'enum',
    enum: ListingType,
  })
  listing_type: ListingType;

  @Column({
    type: 'enum',
    enum: SellerType,
  })
  seller_type: SellerType;

  @ManyToOne(() => BrokerOffice, { nullable: true })
  broker_office: BrokerOffice;

  @ManyToOne(() => PropertyType)
  property_type: PropertyType;

  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn()
  created_at: Date;
}