import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Property } from './Property';

@Entity('property_type')
export class PropertyType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name_ar: string;

  @Column()
  name_en: string;

  @Column()
  icon: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Property, (property) => property.property_type)
  properties: Property[];
}