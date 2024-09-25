import { IsNotEmpty } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import m_submenu from './m_submenu';
import m_user from './m_user';

@Entity({ name: 'm_usermanual' })
export default class m_usermanual {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  @IsNotEmpty()
  manualName: string;

  @Column({ unique: true })
  @IsNotEmpty()
  manualKey: string;

  @Column({ type: 'json' })
  manualContent: string;

  @ManyToOne((type) => m_submenu, { nullable: false })
  subMenu: m_submenu;

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
