import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import Transaction from './Transaction';

@Entity('categories')
class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Transaction, transaction => transaction.category)
  transaction: Transaction;

  @CreateDateColumn()
  updated_at: Date;
}

export default Category;
