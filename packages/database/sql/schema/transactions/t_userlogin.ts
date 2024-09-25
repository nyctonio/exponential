import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import m_user from '../master/m_user';

@Entity({ name: 't_userlogin' })
export default class t_userlogin extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne((type) => m_user)
  user: m_user;

  @Column()
  ipAddress: string;

  @Column({ type: 'json' })
  locationMetadata: any;

  @Column({ type: 'json' })
  deviceMetadata: any;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
