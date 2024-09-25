import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import m_user from '../master/m_user';
import m_projectsetting from '../master/m_projectsetting';

@Entity({ name: 't_settlementlogs' })
@Unique(['user.id', 'startDate', 'endDate', 'transactionParticular.id'])
export default class t_settlementlogs extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz' })
  endDate: Date;

  @ManyToOne((type) => m_user, { nullable: false })
  user: m_user;

  @ManyToOne((type) => m_projectsetting, { nullable: false })
  transactionParticular: m_projectsetting;

  @Column({ type: 'float' })
  companyAmount: number;

  @Column({ type: 'float' })
  masterAmount: number;

  @Column({ type: 'float' })
  brokerAmount: number;

  @Column({ type: 'float' })
  subBrokerAmount: number;

  @Column({ type: 'float' })
  totalAmount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
