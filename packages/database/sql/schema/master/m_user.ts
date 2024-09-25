import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { IsNotEmpty, IsEmail } from 'class-validator';
import m_projectsetting from './m_projectsetting';
import m_penalty from './m_penalty';

@Entity({ name: 'm_user' })
export default class m_user extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  @IsNotEmpty()
  username: string;

  @Column()
  @IsNotEmpty()
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column()
  @IsEmail()
  email: string;

  @ManyToOne((type) => m_projectsetting)
  city: m_projectsetting;

  @Column()
  @IsNotEmpty()
  password: string;

  @Column({
    default: null,
    nullable: true,
  })
  mobileNumber: string;

  @Column({ nullable: true })
  remarks: string;

  @ManyToOne((type) => m_projectsetting)
  userType: m_projectsetting;

  @ManyToOne((type) => m_projectsetting)
  userStatus: m_projectsetting;

  @Column({ default: true })
  resetRequired: boolean;

  @Column({ default: false })
  isDemoId: boolean;

  @Column({ nullable: true, type: 'timestamptz' })
  @IsNotEmpty()
  validTillDate: Date;

  @Column({ default: false })
  m2mSquareOff: boolean;

  @Column({ nullable: true })
  m2mSquareOffLimit: number;

  @Column({ default: false })
  shortMarginSquareOff: boolean;

  @ManyToOne((type) => m_projectsetting)
  tradeSquareOffLimit: m_projectsetting;

  // Relationship to Penalty
  @OneToMany(() => m_penalty, (penalty) => penalty.user)
  penalty: m_penalty[];

  @Column({ default: false })
  isIntradayAllowed: boolean;

  @Column({ default: false })
  tradeAllowedinQty: boolean;

  @Column({ default: true })
  onlySquareOff: boolean;

  @Column({ default: 10000 })
  maxMarginCap: number;

  @Column({ default: 10000 })
  maxLossCap: number;

  @ManyToOne((type) => m_user, { nullable: true })
  createdByUser: m_user;

  @Column({ default: 0 })
  noOfLoginAttempts: number;

  @ManyToOne((type) => m_user, { nullable: true })
  broker: m_user;

  @ManyToOne((type) => m_user, { nullable: true })
  subBroker: m_user;

  @ManyToOne((type) => m_user, { nullable: true })
  master: m_user;

  @ManyToOne((type) => m_user, { nullable: true })
  company: m_user;

  @Column({ type: 'float', default: 0 })
  openingBalance: number;

  @Column({ default: '' })
  openingRemarks: string;

  @Column({ default: false })
  isWhiteLabel: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne((type) => m_user, { nullable: true })
  updatedBy: m_user;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true })
  deviceToken: string;

  @Column({ default: true })
  notificationSetting: boolean;
}
