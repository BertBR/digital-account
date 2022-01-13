import { Operation, Transaction } from '../models/operation.model';

export interface IAccountTransactionService {
  perform(file: Operation<Transaction>[]): Promise<Operation<Transaction>[]>;
}
