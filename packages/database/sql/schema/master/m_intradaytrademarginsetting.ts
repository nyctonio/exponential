import { IsNotEmpty } from 'class-validator';
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
import m_user from './m_user';

@Entity({ name: 'm_intradaytrademarginsetting' })
@Unique(['exchange', 'user'])
export default class m_intradaytrademarginsetting extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne((type) => m_user)
  user: m_user;

  @ManyToOne((type) => m_exchange)
  exchange: m_exchange;

  @Column({ nullable: true })
  @IsNotEmpty()
  marginPerCrore: number;

  @Column({ nullable: true })
  @IsNotEmpty()
  marginPerLot: number;

  @Column({ nullable: true })
  marginType: string;

  @ManyToOne((type) => m_user, { nullable: true })
  createdBy: m_user;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne((type) => m_user, { nullable: true })
  updatedBy: m_user;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
