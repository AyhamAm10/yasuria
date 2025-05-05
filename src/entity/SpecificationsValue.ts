import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Specifications } from "./Specifications";

export enum EntitySpecification {
  car = "car",
  properties = "property"
}

@Entity("specifications_value")
export class SpecificationsValue {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Specifications, (specifications) => specifications.id)
  specifications: Specifications;

  @Column({
    type:"enum",
    enum:EntitySpecification,
  })
  entity: EntitySpecification;

  @Column()
  entity_id: number;

  @Column({nullable:true})
  value: string;

  @Column({default:true})
  IsActive: true;

  @CreateDateColumn()
  created_at: Date;
}