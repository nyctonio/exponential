import { IsNotEmpty } from 'class-validator';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Decimal128,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import m_user from '../m_user';

@Entity({ name: 'm_transaction' })
export default class m_transaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exchange: string;

  @Column()
  scriptName: string;

  @Column({
    default: false,
  })
  isIntraday: boolean;

  // market or limit
  @Column()
  orderType: string;

  // B or S
  @Column()
  tradeType: string;

  @Column({
    type: 'decimal',
    nullable: true,
  })
  buyPrice: number;

  @Column({
    type: 'decimal',
    nullable: true,
  })
  sellPrice: number;

  @Column()
  lotSize: number;

  @Column()
  quantity: number;

  @Column()
  quantityLeft: number;

  // open closed cancelled pending failed deleted
  @Column()
  transactionStatus: string;

  @Column({ type: 'decimal', nullable: true })
  margin: number;

  @Column()
  marginChargedType: string;

  @Column()
  marginChargedRate: number;

  @Column({ type: 'decimal' })
  brokerage: number;

  @Column()
  brokerageChargedType: string;

  @Column()
  brokerageChargedRate: number;

  @Column({ default: false })
  isReconciliation: boolean;

  // reason of updation on failure
  @Column({ nullable: true })
  transactionRemarks: string;

  // trade or squareoff
  @Column({ nullable: true })
  tradeRemarks: string;

  @ManyToOne((type) => m_transaction, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parent: m_transaction;

  @ManyToOne((type) => m_transaction, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  order: m_transaction;

  @ManyToOne((type) => m_user)
  user: m_user;

  @Column({ type: 'timestamptz' })
  orderCreationDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  orderExecutionDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastPenaltyDate: Date;

  @Column({ nullable: true })
  ipAddr: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  deviceId: string;

  @Column({ nullable: true })
  deviceType: string;

  @Column({ default: 'NA' })
  flag: string;

  @ManyToOne((type) => m_user, { nullable: true })
  createdBy: m_user;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne((type) => m_user, { nullable: true })
  updatedBy: m_user;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt: Date;

  @ManyToOne((type) => m_user, { nullable: true })
  deletedBy: m_user;
}
