import { IsNotEmpty } from 'class-validator';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import m_user from './m_user';

@Entity({ name: 'm_rent' })
export default class m_rent extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @OneToOne((type) => m_user)
  @JoinColumn()
  user: m_user;

  @Column({ nullable: true })
  companySharing: number;

  @Column({ nullable: true })
  masterSharing: number;

  @Column({ nullable: true })
  brokerSharing: number;

  @Column({ nullable: true })
  subbrokerSharing: number;

  @Column({ nullable: false })
  totalRent: number;

  @Column({ default: '' })
  rentRemarks: string;

  @ManyToOne((type) => m_user)
  createdBy: m_user;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne((type) => m_user)
  updatedBy: m_user;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
