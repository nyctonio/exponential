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
import m_user from './m_user';

@Entity({ name: 'm_userfunctionmapping' })
export default class m_userfunctionmapping extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => m_user, { nullable: false })
  user: m_user;

  @ManyToOne((type) => m_functionmaster, { nullable: false })
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
