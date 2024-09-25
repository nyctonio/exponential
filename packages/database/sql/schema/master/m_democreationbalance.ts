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

@Entity({ name: 'm_democreationbalance' })
export default class m_democreationbalance extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string;

  @Column()
  name: string;

  @Column()
  balance: number;

  @ManyToOne((type) => m_user)
  createdBy: m_user;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne((type) => m_user)
  updatedBy: m_user;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
