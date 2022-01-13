import { Inject } from '@nestjs/common';
import {
  Initialize,
  Operation,
  OperationType,
  Transaction,
  TransactionHistory,
} from '../models/operation.model';
import { BaseTransactionService } from './BaseTransactionService';
import { IAccountInitializationService } from '../interfaces/IAccountInitializationService';
import { IGetAccountTransactionHistory } from '../interfaces/IGetAccountTransactionHistory';

export class GetAccountTransactionHistory
  implements IGetAccountTransactionHistory
{
  private baseTransactionService = BaseTransactionService.getInstance();

  constructor(
    @Inject('Account_Initialization')
    private readonly accountInitializationService: IAccountInitializationService,
  ) {}

  async perform(
    data: Operation<TransactionHistory>[],
  ): Promise<Operation<TransactionHistory>[]> {
    let output = {};
    for (const line of data) {
      if (line.type === OperationType.transaction_history && line.payload) {
        const account =
          this.accountInitializationService.checkInitializedAccounts({
            sender_document: line.payload.document,
          });

        if (!account || !account.sender) {
          output = {
            item: data.indexOf(line),
            type: 'transaction_history',
            status: 'failure',
            violation: 'account_not_initialized',
          };
          const idx = data.indexOf(line);
          data[idx] = output as Operation<TransactionHistory>;
          continue;
        }

        const sender_transaction_history = this.getSenderTransactionHistory(
          account.sender,
        );

        output = {
          type: 'transaction_history',
          status: 'success',
          result: sender_transaction_history,
        };
        const idx = data.indexOf(line);
        data[idx] = output as Operation<TransactionHistory>;
        continue;
      }
    }
    return data;
  }

  private getSenderTransactionHistory(sender: Initialize): Transaction[] {
    return this.baseTransactionService.transaction_history.filter(
      (history) => history.sender_document === sender.document,
    );
  }
}
