import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { m_user, m_exchange } from '../index';
import { IsNotEmpty } from 'class-validator';

@Entity({ name: 'm_scriptbrokeragesetting' })
export default class m_scriptbrokeragesetting extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instrumentName: string;

  @ManyToOne((type) => m_user, { nullable: false })
  user: m_user;

  @ManyToOne((type) => m_exchange)
  exchange: m_exchange;

  @Column({ nullable: true })
  brokerageType: string;

  @Column({ nullable: true })
  brokeragePerCroreAmt: number;

  @Column({ nullable: true })
  brokeragePerLotAmt: number;

  @Column({ nullable: true })
  @IsNotEmpty()
  companyPerCroreAmt: number;

  @Column({ nullable: true })
  @IsNotEmpty()
  companyPerLotAmt: number;

  @Column({ nullable: true })
  @IsNotEmpty()
  masterPerCroreAmt: number;

  @Column({ nullable: true })
  @IsNotEmpty()
  masterPerLotAmt: number;

  @Column({ nullable: true })
  @IsNotEmpty()
  brokerPerCroreAmt: number;

  @Column({ nullable: true })
  @IsNotEmpty()
  brokerPerLotAmt: number;

  @Column({ nullable: true })
  @IsNotEmpty()
  subBrokerPerCroreAmt: number;

  @Column({ nullable: true })
  @IsNotEmpty()
  subBrokerPerLotAmt: number;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt: Date;

  @ManyToOne((type) => m_user, { nullable: true })
  deletedBy: m_user;

  @ManyToOne((type) => m_user, { nullable: true })
  updatedBy: m_user;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne((type) => m_user, { nullable: true })
  createdBy: m_user;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
