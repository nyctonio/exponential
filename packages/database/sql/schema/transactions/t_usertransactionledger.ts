import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import m_projectsetting from '../master/m_projectsetting';
import m_user from '../master/m_user';
import m_transaction from '../master/trade/m_transaction';

@Entity({ name: 't_usertransactionledger' })
export default class t_usertransactionledger extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne((type) => m_user)
  user: m_user;

  @Column({ type: 'decimal' })
  transactionAmount: number;

  @ManyToOne((type) => m_projectsetting)
  transactionParticular: m_projectsetting;

  @ManyToOne((type) => m_projectsetting)
  transactionType: m_projectsetting;

  @Column()
  transactionRemarks: string;

  @ManyToOne((type) => m_transaction, { nullable: true })
  order: m_transaction;

  @Column({ type: 'timestamptz' })
  transactionDate: Date;

  @Column({ type: 'boolean', default: false })
  isSettled: boolean;

  @ManyToOne((type) => m_user, { nullable: true })
  createdBy: m_user;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne((type) => m_user, { nullable: true })
  updatedBy: m_user;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne((type) => m_user, { nullable: true })
  deletedBy: m_user;

  @DeleteDateColumn({
    type: 'timestamptz',
    nullable: true,
    name: 'deletedAt',
    default: null,
  })
  deletedAt: Date;
}
