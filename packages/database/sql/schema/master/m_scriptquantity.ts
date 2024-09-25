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
import m_exchange from './m_exchange';
import m_instruments from './m_instruments';
import m_user from './m_user';

@Entity({ name: 'm_scriptquantity' })
@Unique('script', ['user', 'instrumentName'])
export default class m_scriptquantity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instrumentName: string;

  @ManyToOne((type) => m_user)
  user: m_user;

  @ManyToOne((type) => m_exchange)
  exchange: m_exchange;

  @Column()
  scriptMaxLotSize: number;

  @Column()
  tradeMaxLotSize: number;

  @Column({ default: 0, type: 'float' })
  tradeMinLotSize: number;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @ManyToOne((type) => m_user, { nullable: true })
  createdBy: m_user;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne((type) => m_user, { nullable: true })
  updatedBy: m_user;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt: Date;

  @ManyToOne((type) => m_user, { nullable: true })
  deletedBy: m_user;
}
