import { Transaction } from '../models/operation.model';

export class BaseTransactionService {
  private _transaction_history: Transaction[] = [];
  private static _instance: BaseTransactionService;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static getInstance() {
    if (!this._instance) {
      this._instance = new BaseTransactionService();
    }
    return this._instance;
  }

  set addToTransactionHistory(transaction: Transaction) {
    this._transaction_history.push(transaction);
  }

  set updateTransactionHistory(transaction_history: Transaction[]) {
    this._transaction_history = transaction_history;
  }

  get transaction_history(): Transaction[] {
    return this._transaction_history;
  }
}
