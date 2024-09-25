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
import { IsNotEmpty, IsEmail } from 'class-validator';
import m_projectsetting from './m_projectsetting';
import m_user from './m_user';
import m_exchange from './m_exchange';

@Entity({ name: 'm_userbrokeragesetting' })
@Unique(['user', 'exchange'])
export default class m_userbrokeragesetting extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne((type) => m_user)
  user: m_user;

  @ManyToOne((type) => m_exchange)
  exchange: m_exchange;

  @Column({ nullable: true })
  brokerageType: string;

  @Column({ nullable: true })
  @IsNotEmpty()
  brokeragePerCroreAmt: number;

  @Column({ nullable: true })
  @IsNotEmpty()
  brokeragePerLotAmt: number;

  @Column({ nullable: true })
  @IsNotEmpty()
  companyPerCroreAmt: number;

  @Column({ nullable: true })
  @IsNotEmpty()
  companyPerLotAmt: number;

  @Column({ nullable: true })
  @IsNotEmpty()
  masterPerCroreAmt: number;

  @Column({ nullable: true })
  @IsNotEmpty()
  masterPerLotAmt: number;

  @Column({ nullable: true })
  @IsNotEmpty()
  brokerPerCroreAmt: number;

  @Column({ nullable: true })
  @IsNotEmpty()
  brokerPerLotAmt: number;

  @Column({ nullable: true })
  @IsNotEmpty()
  subBrokerPerCroreAmt: number;

  @Column({ nullable: true })
  @IsNotEmpty()
  subBrokerPerLotAmt: number;

  @Column({ nullable: true })
  thirdpartyPerCroreAmt: number;

  @Column({ nullable: true })
  thirdpartyPerLotAmt: number;

  @Column({ nullable: true })
  thirdpartyPerCroreRemarks: string;

  @Column({ nullable: true })
  thirdpartyPerLotRemarks: string;

  @ManyToOne((type) => m_user)
  createdBy: m_user;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne((type) => m_user)
  updatedBy: m_user;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
