import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "senderId" })
  sender: User;

  @Column()
  senderId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "receiverId" })
  receiver: User;

  @Column()
  receiverId: number;

  @Column("text", { nullable: true })
  message: string;

  @Column("simple-array", { nullable: true })
  images: string[];

  @CreateDateColumn()
  createdAt: Date;
}
