import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./Users";

export enum Entity_Type {
  car = "car",
  properties = "property",
}

@Entity("favorites")
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;

  @Column()
  item_id: number;

  @Column({
    type: "enum",
    enum: Entity_Type,
  })
  item_type: Entity_Type;

  @CreateDateColumn()
  created_at: Date;
}
