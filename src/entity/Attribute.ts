import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";

export enum EntityAttribute {
  car = "car",
  properties = "properties"
}

@Entity("attribute")
export class Attribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  type: string;

  @Column()
  icon: string;

  @Column({
    type:"enum",
    enum:EntityAttribute,
  })
  entity: EntityAttribute;


  @CreateDateColumn()
  created_at: Date;
}