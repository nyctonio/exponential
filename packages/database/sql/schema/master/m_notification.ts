import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import m_user from './m_user';

@Entity({ name: 'm_notification' })
export default class m_functionmaster extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => m_user, { nullable: true })
  user: m_user;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  type: string;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
