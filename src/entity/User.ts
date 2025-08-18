import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from "typeorm";
import { Chat } from "./chat";

export enum UserRole {
  superAdmin = "super admin",
  admin = "admin",
  user = "user",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ default: true })
  isActive: boolean;

  @Index("idx_phone", { unique: true })
  @Column()
  phone: string;

  @Column({ nullable: true })
  city: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.user,
  })
  role: UserRole;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Chat, (chat) => chat.sender)
  sentMessages: Chat[];

  @OneToMany(() => Chat, (chat) => chat.receiver)
  receivedMessages: Chat[];
}
