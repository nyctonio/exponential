import { IsNotEmpty } from 'class-validator';
import { Column, Entity, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'm_watchlistcolumn' })
export default class m_watchlistcolumn extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsNotEmpty()
  default: boolean;

  @Column()
  @IsNotEmpty()
  defaultIndex: number;

  @Column()
  @IsNotEmpty()
  width: string;
}
