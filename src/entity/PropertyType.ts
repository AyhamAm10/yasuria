import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Property } from './Property';
import { Specifications } from './Specifications';

@Entity('property_type')
export class PropertyType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Property, (property) => property.property_type)
  properties: Property[];


}