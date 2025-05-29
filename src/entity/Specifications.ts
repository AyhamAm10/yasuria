import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import {
  EntitySpecification,
  SpecificationsValue,
} from "./SpecificationsValue";
import { CarType } from "./CarType";
import { PropertyType } from "./PropertyType";

@Entity("specifications")
export class Specifications {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => SpecificationsValue, (value) => value.specification)
  values: SpecificationsValue[];

  @Column()
  title: string;

  @Column()
  type: string;

  @Column()
  icon: string;

  @Column({
    type: "enum",
    enum: EntitySpecification,
  })
  entity: EntitySpecification;

  @ManyToOne(() => CarType, { nullable: true, onDelete: "SET NULL" })
  carType: CarType | null;

  @ManyToOne(() => PropertyType, { nullable: true, onDelete: "SET NULL" })
  propertyType: PropertyType | null;

  @CreateDateColumn()
  created_at: Date;
}
