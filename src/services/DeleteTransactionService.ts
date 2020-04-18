import { getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getRepository(Transaction);

    const findTransaction = await transactionRepository.findOne(id);

    if (!findTransaction) {
      throw new AppError('Transaction ID is invalid.', 400);
    }

    await transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
