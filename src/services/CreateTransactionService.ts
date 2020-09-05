import { getRepository, getCustomRepository } from 'typeorm';
import TransactionRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);

    if (!['outcome', 'income'].includes(type)) {
      throw new AppError('Type transiction not valid.');
    }

    if (
      type.includes('outcome') &&
      (await transactionRepository.getBalance()).total < value
    ) {
      throw new AppError('Value incorrect.');
    }
    const validExistCategory = await categoryRepository.findOne({
      where: { category },
    });

    if (!validExistCategory) {
      const newCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(newCategory);
    }
    const categorySelecionada = await categoryRepository.findOne({
      where: { category },
    });

    const transactioNew = transactionRepository.create({
      title,
      type,
      value,
      category_id: categorySelecionada?.id,
    });

    await transactionRepository.save(transactioNew);
    return transactioNew;
  }
}

export default CreateTransactionService;
