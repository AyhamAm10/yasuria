import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";


@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;

  @Column("text")
  message: string;

  @Column()
  status: string;

  @CreateDateColumn()
  created_at: Date;
}