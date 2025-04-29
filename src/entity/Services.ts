import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { ServiceCategory } from "./SeviceCategory";
import { BrokerOffice } from "./BrokerOffice";
import { brokerService } from "./BrokerService";

@Entity("services")
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column("text")
  description: string;

  @Column()
  location: string;

  @Column()
  icon: string;

  @Column({
    type: "enum",
    enum: ["cars", "properties"],
  })
  type: string;

  @ManyToOne(() => ServiceCategory , {nullable: true})
  category: ServiceCategory;

  @OneToMany(() => brokerService, (borkerService) => borkerService.service, {
    nullable: true,
  })
  broker_office: brokerService[];

  @CreateDateColumn()
  created_at: Date;
}
