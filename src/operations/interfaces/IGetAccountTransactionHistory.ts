import { Operation, TransactionHistory } from '../models/operation.model';

export interface IGetAccountTransactionHistory {
  perform(
    file: Operation<TransactionHistory>[],
  ): Promise<Operation<TransactionHistory>[]>;
}
