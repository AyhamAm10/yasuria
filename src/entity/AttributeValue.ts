import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { Attribute } from "./Attribute";

@Entity("attribute_value")
export class AttributeValue {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Attribute, (attribute) => attribute.values)
  attribute: Attribute;

  @Column()
  entity: string; 

  @Column()
  entity_id: number;

  @Column()
  value: string;

  // @Column({ type: "json", nullable: true })
  // selected_options: any;

  @CreateDateColumn()
  created_at: Date;
}