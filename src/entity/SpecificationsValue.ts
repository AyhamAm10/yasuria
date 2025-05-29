import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne } from "typeorm";
import { Specifications } from "./Specifications";

export enum EntitySpecification {
  car = "car",
  properties = "property"
}

@Entity("specifications_value")
export class SpecificationsValue {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Specifications, (spec) => spec.values)
  specification: Specifications;

  @Column({
    type:"enum",
    enum:EntitySpecification,
  })
  entity: EntitySpecification;

  @Column()
  entity_id: number;

  @Column({default:true})
  IsActive: boolean;

  @CreateDateColumn()
  created_at: Date;
}