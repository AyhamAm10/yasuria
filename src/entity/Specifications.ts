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

  @CreateDateColumn()
  created_at: Date;
}
