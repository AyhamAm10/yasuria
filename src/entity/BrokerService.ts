import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Service } from './Services';
import { BrokerOffice } from './BrokerOffice';

@Entity('broker_service')
export class brokerService {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Service , (service)=>service.broker_office )
  service: Service;

  @ManyToOne(() => BrokerOffice, (office)=>office.broker_service , {onDelete: 'CASCADE'})
  broker_office: BrokerOffice;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}