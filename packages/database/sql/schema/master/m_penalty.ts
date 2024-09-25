import { IsNotEmpty } from 'class-validator';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import m_user from './m_user';
import m_projectsetting from './m_projectsetting';

@Entity({ name: 'm_penalty' })
export default class m_penalty extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  hours: number;

  @Column()
  @IsNotEmpty()
  penalty: number;

  @Column({ default: false })
  @IsNotEmpty()
  cutBrokerage: boolean;

  @OneToOne((type) => m_user)
  @JoinColumn()
  user: m_user;

  @ManyToOne((type) => m_projectsetting)
  penaltyType: m_projectsetting;

  @ManyToOne((type) => m_user)
  createdBy: m_user;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

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
}
