
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity("ads")
export class Ads {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column("text")
  content: string;

  @Column()
  image_url: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  admin: User;

  @CreateDateColumn()
  created_at: Date;
}