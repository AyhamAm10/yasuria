import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Car } from "./Car";
import { Property } from "./Property";
import { Request } from "./Request";

@Entity("governorates")
export class Governorate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "name_ar", unique: true })
  name: string;

  @Column({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  // Relations
  @OneToMany(() => Car, (car) => car.governorateInfo)
  cars: Car[];

  @OneToMany(() => Property, (property) => property.governorateInfo)
  propertys: Property[];

  @OneToMany(() => Request, (req) => req.governorateInfo)
  requests: Request[];
}
