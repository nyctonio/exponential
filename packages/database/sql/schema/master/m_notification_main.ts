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
import m_projectsetting from './m_projectsetting';

@Entity({ name: 'm_notification_main' })
export default class m_notification_main extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column('simple-array')
  users: string[];

  @Column()
  userType: string;

  // @ManyToOne((type) => m_projectsetting)
  // userType: m_projectsetting;

  @Column({ default: false })
  is_hierarchy: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
