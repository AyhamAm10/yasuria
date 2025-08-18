// src/entities/Chat.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User"; // تأكد أن عندك جدول المستخدمين

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

  @Column("text")
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
