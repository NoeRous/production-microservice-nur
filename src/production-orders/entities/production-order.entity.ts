import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column } from 'typeorm';

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}

@Entity()
export class ProductionOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  productionDate: Date;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;
}