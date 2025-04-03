import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "./Users";

@Entity("services")
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column("text")
  description: string;

  @Column()
  location: string;

  @Column("decimal")
  price: number;

  @Column("jsonb")
  details: object;

  @Column({default: false})
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
  user: User;

  @CreateDateColumn()
  created_at: Date;
}
