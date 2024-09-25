import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 't_tradestatus' })
export default class t_tradestatus extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column('timestamptz', { unique: true })
  date: Date;

  @Column('timestamptz')
  startTimeNSE: Date;

  @Column('timestamptz')
  endTimeNSE: Date;

  @Column('timestamptz')
  startTimeMCX: Date;

  @Column('timestamptz')
  endTimeMCX: Date;

  @Column({ type: 'json', default: null })
  tradeCrons: {
    startNSE: string;
    endNSE: string;
    startMCX: string;
    endMCX: string;
    settlementNSE: string;
    settlementMCX: string;
  } | null;

  @Column('boolean', { default: true })
  tradeActiveNSE: boolean;

  @Column('boolean', { default: true })
  tradeActiveMCX: boolean;

  @Column('text', { array: true, default: [] })
  disabledInstruments: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
