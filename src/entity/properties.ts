import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "./Users";

@Entity("properties")
export class Property {
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

  @Column({default: false})
  isActive: boolean;

  @Column()
  location: string;

  @Column("jsonb", { default: [] }) 
  images: string[];

  @Column({ type: 'double precision', nullable: true })
  lat: number;

  @Column({ type: 'double precision', nullable: true })
  long: number;
  
  @Column()
  status: string;

  @Column("decimal")
  price: number;

  @Column()
  area: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
  user: User;

  @CreateDateColumn()
  created_at: Date;
}
