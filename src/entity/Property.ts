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

  @Column({nullable:true})
  title_en: string;

  @Column('text')
  desc_ar: string;

  @Column('text' , {nullable:true})
  desc_en: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  location: string;

  @Column('jsonb', { default: [] })
  images: string[];

  @Column('double precision', { nullable: true })
  lat: number;

  @Column('double precision', { nullable: true })
  long: number;

  @Column("decimal")
  price_usd: number;

  @Column("decimal" , {nullable: true})
  price_sy: number;

  @Column()
  area: number;

  @Column()
  floors: number;

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