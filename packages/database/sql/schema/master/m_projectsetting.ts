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
import m_user from './m_user';

@Entity({ name: 'm_projectsetting' })
@Unique(['prjSettName', 'prjSettKey', 'prjSettDisplayName'])
@Unique(['prjSettKey', 'prjSettConstant'])
export default class m_projectsetting extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  @IsNotEmpty()
  prjSettName: string;

  @Column()
  @IsNotEmpty()
  prjSettKey: string;

  @Column()
  @IsNotEmpty()
  prjSettDisplayName: string;

  @Column()
  @IsNotEmpty()
  prjSettSortOrder: number;

  @Column({ default: true })
  @IsNotEmpty()
  prjSettActive: boolean;

  @Column({})
  @IsNotEmpty()
  prjSettConstant: string;

  @ManyToOne((type) => m_user, { nullable: true })
  createdBy: m_user;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt: Date;

  @ManyToOne((type) => m_user, { nullable: true })
  deletedBy: m_user;

  @ManyToOne((type) => m_user, { nullable: true })
  updatedBy: m_user;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
