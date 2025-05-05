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
  properties = "property",
}

export enum AttributeFor {
  sale = "sale",       
  rent = "rent",       
  both = "both",     
}
@Entity("attribute")
export class Attribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @OneToMany(() => AttributeValue, (value) => value.attribute)
  values: AttributeValue[];

  @Column({nullable:true})
  icon: string;

  @Column({
    type: "enum",
    enum: ["text", "dropdown", "nested_dropdown"],
    default: "text",
  })
  input_type: string;

  @Column({ type: "json", nullable: true })
  options: any;

  @Column({ default: false }) 
  show_in_search: boolean; 

  @Column({
    type: "enum",
    enum: AttributeFor,
    default: AttributeFor.both, 
  })
  purpose: AttributeFor; 

  @Column({ nullable: true })
  parent_id: number;

  @Column({ nullable: true })
  parent_value: string;

  @Column({ default: false })
  has_child: Boolean;

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
