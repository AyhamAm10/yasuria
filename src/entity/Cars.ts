import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "./Users";

@Entity("cars")
export class Car {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title_ar: string;

  @Column()
  title_en: string;

  @Column()
  desc_ar: string

  @Column()
  desc_en: string

  @Column("jsonb", { default: [] }) 
  images: string[];

  @Column()
  model: string;

  @Column()
  brand: string;

  @Column()
  location: string;

  @Column({ type: 'double precision', nullable: true })
  lat: number;

  @Column({ type: 'double precision', nullable: true })
  long: number;
  
  @Column()
  status: string;

  @Column({default: false})
  isActive: boolean;

  @Column("decimal")
  price: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
  user: User;

  @CreateDateColumn()
  created_at: Date;
}