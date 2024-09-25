import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import m_user from './m_user';

@Entity({ name: 'm_usermcxbidstopsettings' })
export default class m_usermcxbidstopsettings extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => m_user)
  @JoinColumn()
  user: m_user;

  @Column({ default: '' })
  instrumentName: string;

  @Column()
  bidValue: number;

  @Column()
  stopLossValue: number;

  @ManyToOne((type) => m_user, { nullable: true })
  createdBy: m_user;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne((type) => m_user, { nullable: true })
  updatedBy: m_user;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
