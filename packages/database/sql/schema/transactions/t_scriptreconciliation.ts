import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 't_scriptreconciliation' })
export class t_scriptreconciliation extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('timestamptz')
  actionDate: Date;

  @Column({ type: 'varchar' })
  instrumentName: string;

  @Column({ type: 'varchar' })
  actionType: 'dividend' | 'bonus' | 'split';

  @Column({ type: 'json' })
  actionData: {
    dividend: {
      amount: number;
    } | null;
    bonus: {
      r1: number;
      r2: number;
    } | null;
    split: {
      r1: number;
      r2: number;
    } | null;
  };

  @Column({ type: 'varchar' })
  actionStatus: 'pending' | 'processed';

  @Column({ type: 'json', default: [] })
  affectedOrders: number[];
}

export default t_scriptreconciliation;
