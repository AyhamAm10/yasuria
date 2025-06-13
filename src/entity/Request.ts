import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Governorate } from "./governorate";

export enum RequestStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}


export enum RequestPurpose {
  SELL = "sell",
  RENT = "rent",
}

@Entity("requests")
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;

  @Column("text")
  description: string;

  @Column("decimal")
  budget: number;

  @Column({ name: "governorate_id" })
  governorateId: number;

  @Column({
    type: "enum",
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Column({
    type: "enum",
    enum: RequestPurpose,
    default: RequestPurpose.RENT,
  })
  purpose: RequestPurpose;

  @ManyToOne(() => Governorate)
  @JoinColumn({ name: "governorate_id" })
  governorateInfo: Governorate;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
