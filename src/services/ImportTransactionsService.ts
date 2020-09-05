import csvParse from 'csv-parse';
import fs from 'fs';
import { In, getRepository, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const categoriesRepository = getRepository(Category);
    const transactionrreraRepository = getCustomRepository(TransactRepository);
    const contactsReadStream = fs.createReadStream(filePath);
    const parses = csvParse({
      from_line: 2,
    });
    const parseCSV = contactsReadStream.pipe(parses);
    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) => {
        return cell.trim();
      });

      if (!title || !type || !value || !['outcome', 'income'].includes(type))
        return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });
    await new Promise(resolve => parseCSV.on('end', resolve));
    const existenCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existenCategoriesTitle = existenCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitle = categories
      .filter(category => !existenCategoriesTitle.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCatogories = categoriesRepository.create(
      addCategoryTitle.map(title => ({ title })),
    );
    await categoriesRepository.save(newCatogories);

    const finalCategories = [...newCatogories, ...existenCategories];
    const newTransactions = transactionrreraRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category_id: finalCategories.find(
          category => category.title === transaction.category,
        )?.id,
      })),
    );

    await transactionrreraRepository.save(newTransactions);

    return newTransactions;
  }
}

export default ImportTransactionsService;
