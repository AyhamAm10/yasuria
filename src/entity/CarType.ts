import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Car } from './Car';

@Entity('car_type')
export class CarType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Car, (car) => car.car_type)
  properties: Car[];


}