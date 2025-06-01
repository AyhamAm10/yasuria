import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";


@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;

  @Column({nullable: true})
  title_en: string;

  @Column({nullable: true})
  title_ar: string;

  @Column()
  description_en: string;

  @Column()
  description_ar: string;

  @Column()
  type: string;

  @Column({ type: "jsonb", nullable: true })
  metaData: any; 

  @CreateDateColumn()
  created_at: Date;
}