import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "./Users";
import { EntitySpecification } from "./SpecificationsValue";

@Entity("specifications")
export class Specifications {
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
      enum:EntitySpecification,
    })
    entity: EntitySpecification;
  

  @CreateDateColumn()
  created_at: Date;
}