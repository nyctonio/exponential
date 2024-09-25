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
import m_menu from './m_menu';
import m_user from './m_user';

@Entity({ name: 'm_submenu' })
@Unique(['subMenuText', 'subMenuConstantText'])
export default class m_submenu extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({})
  @IsNotEmpty()
  subMenuText: string;

  @Column({})
  @IsNotEmpty()
  subMenuConstantText: string;

  @Column({ default: true })
  isSubMenuActive: boolean;

  @ManyToOne((type) => m_menu, { nullable: false })
  menu: m_menu;

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
