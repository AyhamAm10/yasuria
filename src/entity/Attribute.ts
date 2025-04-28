import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { AttributeValue } from "./AttributeValue";

export enum EntityAttribute {
  car = "car",
  properties = "properties",
}
@Entity("attribute")
export class Attribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @OneToMany(() => AttributeValue, (value) => value.attribute)
  values: AttributeValue[];

  @Column()
  icon: string;

  @Column({
    type: "enum",
    enum: ["text", "dropdown", "nested_dropdown"],
    default: "text",
  })
  input_type: string;

  @Column({ type: "json", nullable: true })
  options: any;

  @Column({ nullable: true })
  parent_id: number;

  @Column({ nullable: true })
  parent_value: string;

  @ManyToOne(() => Attribute, { nullable: true })
  parent: Attribute;

  @Column({
    type: "enum",
    enum: EntityAttribute,
  })
  entity: EntityAttribute;

  @CreateDateColumn()
  created_at: Date;
}
