import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import m_functionmaster from './m_functionmaster';
import m_projectsetting from './m_projectsetting';
import m_user from './m_user';

@Entity({ name: 'm_defaultfunctionmapping' })
export default class m_defaultfunctionmapping extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => m_projectsetting, { nullable: false })
  userType: m_projectsetting;

  @ManyToOne((type) => m_functionmaster)
  func: m_functionmaster;

  @Column()
  isAccess: boolean;

  @ManyToOne((type) => m_user, { nullable: true })
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
