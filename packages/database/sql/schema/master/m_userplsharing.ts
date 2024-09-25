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
import { IsNotEmpty } from 'class-validator';
import m_user from './m_user';
import m_exchange from './m_exchange';

@Entity({ name: 'm_userplsharing' })
@Unique(['user', 'exchange'])
export default class m_userplsharing extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne((type) => m_user)
  user: m_user;

  @ManyToOne((type) => m_exchange)
  exchange: m_exchange;

  @Column({ nullable: true })
  companySharing: number;

  @Column({ nullable: true })
  masterSharing: number;

  @Column({ nullable: true })
  brokerSharing: number;

  @Column({ nullable: true })
  subbrokerSharing: number;

  @Column({ nullable: true })
  thirdpartySharing: number;

  @Column({ nullable: true })
  thirdpartyRemarks: string;

  @ManyToOne((type) => m_user)
  createdBy: m_user;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne((type) => m_user)
  updatedBy: m_user;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
