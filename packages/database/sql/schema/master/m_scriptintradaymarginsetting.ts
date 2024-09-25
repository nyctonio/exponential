import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BaseEntity,
  Unique,
} from 'typeorm';
import { m_user, m_exchange } from '../index';
import { IsNotEmpty } from 'class-validator';

export enum MarginTypeEnum {
  CRORE = 'crore',
  LOT = 'lot',
}

@Entity({ name: 'm_scriptintradaymarginsetting' })
@Unique('pk', ['user', 'instrumentName'])
export default class m_scriptintradaymarginsetting extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instrumentName: string;

  @ManyToOne((type) => m_user, { nullable: false })
  user: m_user;

  @ManyToOne((type) => m_exchange)
  exchange: m_exchange;

  @Column({ nullable: false })
  marginPerCrore: number;

  @Column({ nullable: false })
  marginPerLot: number;

  @Column({ nullable: true })
  marginType: string;

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
