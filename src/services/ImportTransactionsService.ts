import fs from 'fs';
import path from 'path';
import csv from 'csv-parse';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface CSVTransactions {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_title: string;
}

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();

    const parsers = csv({ ltrim: true, from_line: 2 });

    const csvFilePath = path.join(uploadConfig.directory, filename);
    const csvReadStream = fs.createReadStream(csvFilePath);

    const parseCSV = csvReadStream.pipe(parsers);

    const importedTransactions: CSVTransactions[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category_title] = line;

      importedTransactions.push({ title, type, value, category_title });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const storedTransaction: Transaction[] = [];

    for (const transaction of importedTransactions) {
      const newTransaciton = await createTransaction.execute({
        ...transaction,
      });

      storedTransaction.push(newTransaciton);
    }

    await fs.promises.unlink(csvFilePath);

    return storedTransaction;
  }
}

export default ImportTransactionsService;
