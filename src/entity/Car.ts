import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { BrokerOffice } from "./BrokerOffice";
import { CarType } from "./CarType";
import { Governorate } from "./governorate";

@Entity("cars")
export class Car {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title_ar: string;

  @Column({ nullable: true })
  title_en: string;

  @Column("text")
  desc_ar: string;

  @Column({ nullable: true })
  desc_en: string;

  @Column("jsonb", { default: [] })
  images: string[];

  @Column()
  location: string;

  @Column("double precision", { nullable: true })
  lat: number;

  @Column("double precision", { nullable: true })
  long: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ name: "governorate_id" })
  governorateId: number;
  
  @Column("decimal")
  price_usd: number;

  @Column("decimal" , {nullable: true})
  price_sy: number;

  @Column({
    type: "enum",
    enum: ["sale", "rent"],
  })
  listing_type: string;

  @Column({
    type: "enum",
    enum: ["owner", "broker"],
  })
  seller_type: string;

  @ManyToOne(() => BrokerOffice, { nullable: true })
  broker_office: BrokerOffice;

  @ManyToOne(() => User , {onDelete: "CASCADE"})
  user: User;

  @ManyToOne(() => CarType)
  car_type: CarType;


  @ManyToOne(() => Governorate)
  @JoinColumn({ name: "governorate_id" })
  governorateInfo: Governorate;

  @CreateDateColumn()
  created_at: Date;


}
