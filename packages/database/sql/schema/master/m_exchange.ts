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

@Entity({ name: 'm_exchange' })
@Unique('unique-exchange-name', ['exchangeName'])
export default class m_exchange extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  @IsNotEmpty()
  exchangeName: string;

  @Column()
  @IsNotEmpty()
  isActive: boolean;

  @Column({
    default: false,
  })
  isDeleted: boolean;

  @ManyToOne((type) => m_user)
  createdBy: m_user;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne((type) => m_user)
  updatedBy: m_user;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne((type) => m_user)
  deletedBy: m_user;

  @Column({
    nullable: true,
    type: 'timestamptz',
  })
  deletedAt: Date;
}
