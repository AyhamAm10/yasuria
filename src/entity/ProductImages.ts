// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
// import { Car } from './Car';
// import { Property } from './Property';

// @Entity('images_data')
// export class ImagesData {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column()
//   url: string;

//   @Column({ nullable: true })
//   description: string;

//   @Column({ nullable: true })
//   label: string;

//   @ManyToOne(() => Car, (car) => car.imagesData, { nullable: true })
//   car: Car;

//   @ManyToOne(() => Property, (property) => property.imagesData, { nullable: true })
//   property: Property;
// }