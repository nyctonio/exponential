import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import m_user from './m_user';
import m_projectsetting from './m_projectsetting';

@Entity({ name: 'm_broadcastmessages' })
export default class m_broadcastmessages extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // @ManyToOne((type) => m_user, { nullable: true })
  // user: m_user[];

  @Column('simple-array')
  users: string[];

  @Column()
  title: string;

  @Column()
  type: string;

  @Column()
  severity: string;

  @Column()
  message: string;

  @Column({ default: false })
  is_multiple: boolean;

  @Column({ default: 0 })
  frequency: number;

  @Column({ type: 'timestamptz', nullable: true })
  from_date: Date;

  @Column({ type: 'timestamptz', nullable: true })
  to_date: Date;

  // @Column('simple-json', { default: { time: 'time', executed: false } })
  // scheduled_data: { time: string; executed: boolean };

  @Column('json')
  scheduled_data: any;

  @Column()
  valid_for: string;

  // @ManyToOne((type) => m_projectsetting)
  // valid_for: m_projectsetting;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
