import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Attribute } from "./Attribute";

@Entity("attribute_value")
export class AttributeValue {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Attribute, (attribute) => attribute.id)
  attribute: Attribute;

  @Column()
  entity: string;

  @Column()
  entity_id: number;

  @Column()
  value: string;

  @CreateDateColumn()
  created_at: Date;
}