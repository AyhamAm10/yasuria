import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Service } from './Services';

@Entity('service_categories')
export class ServiceCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({nullable:true})
  icon: string;

  @Column({
    type: 'enum',
    enum: ['cars', 'properties'],
  })
  type: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Service, (service) => service.category)
  services: Service[];
}