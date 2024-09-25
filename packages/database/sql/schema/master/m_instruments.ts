import { IsNotEmpty } from 'class-validator';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  Unique,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'm_instruments' })
@Unique('tradingsymbol-exchange', ['tradingsymbol', 'exchange'])
export default class m_instruments extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  @IsNotEmpty()
  instrument_token: string;

  @Column()
  @IsNotEmpty()
  exchange_token: string;

  @Column()
  @IsNotEmpty()
  tradingsymbol: string;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsNotEmpty()
  instrument_type: string;

  @Column()
  @IsNotEmpty()
  segment: string;

  @Column()
  @IsNotEmpty()
  exchange: string;

  @Column({ nullable: true })
  @IsNotEmpty()
  last_price: string;

  @Column({ nullable: true, type: 'timestamptz' })
  expiry: Date;

  @Column()
  @IsNotEmpty()
  strike: string;

  @Column()
  @IsNotEmpty()
  tick_size: string;

  @Column()
  @IsNotEmpty()
  lot_size: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
