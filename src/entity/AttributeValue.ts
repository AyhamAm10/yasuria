import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { Attribute } from "./Attribute";

export enum EntityAttribute {
  car = "car",
  properties = "property",
}

@Entity("attribute_value")
export class AttributeValue {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Attribute, (attribute) => attribute.values)
  attribute: Attribute;

  @Column({
    type: "enum",
    enum: EntityAttribute,
  })
  entity: EntityAttribute;

  @Column()
  entity_id: number;

  @Column()
  value: string;

  @CreateDateColumn()
  created_at: Date;
}
