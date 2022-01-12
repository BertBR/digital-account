import { Inject } from '@nestjs/common';
import {
  Initialize,
  Operation,
  OperationType,
  Transaction,
} from '../models/operation.model';
import { IAccountInitializationService } from './interfaces/IAccountInitializationService';
import { differenceInSeconds } from 'date-fns';

export class AccountTransactionService {
  private readonly transaction_history: Transaction[] = [];
  private tempDataIdx: Operation<Transaction>;
  private DUPLICATED_TRANSACTION_TOLERANCE_IN_SECONDS = 120;

  constructor(
    @Inject('Account_Initialization')
    private readonly accountInitializationService: IAccountInitializationService,
  ) {}
  async perform(data: Operation<Transaction>[]) {
    let output = {};
    const initialized_accounts =
      this.accountInitializationService.getInitializedAccounts();
    for (const line of data) {
      if (line.type === OperationType.transaction && line.payload) {
        const sender = initialized_accounts.find(
          (account) => account.document === line.payload.sender_document,
        );
        const receiver = initialized_accounts.find(
          (account) => account.document === line.payload.receiver_document,
        );

        if (!sender || !receiver) {
          output = {
            item: data.indexOf(line),
            type: 'transaction',
            status: 'failure',
            violation: 'account_not_initialized',
          };
          const idx = data.indexOf(line);
          data[idx] = output as Operation<Transaction>;
          continue;
        }
        const isDuplicated = this.checkDuplicatedTransaction(line.payload);
        if (isDuplicated) {
          output = {
            item: data.indexOf(line),
            type: 'transaction',
            status: 'failure',
            violation: 'double_transaction',
          };
          const idx = data.indexOf(line);
          data[idx] = output as Operation<Transaction>;
          continue;
        }
        receiver.available_limit =
          receiver.available_limit + line.payload.value;
        sender.available_limit = sender.available_limit - line.payload.value;
        if (sender.available_limit < 0) {
          output = {
            item: data.indexOf(line),
            type: 'transaction',
            status: 'failure',
            violation: 'insufficient_limit',
          };
          const idx = data.indexOf(line);
          data[idx] = output as Operation<Transaction>;
          continue;
        }
        output = {
          item: data.indexOf(line),
          type: 'transaction',
          status: 'success',
          result: {
            available_limit: sender.available_limit,
            receiver_document: line.payload.receiver_document,
            sender_document: line.payload.sender_document,
            datetime: line.payload.datetime,
          },
        };

        const idx = data.indexOf(line);
        try {
          this.tempDataIdx = data[idx];
          this.saveTransaction(line.payload);
          data[idx] = output as Operation<Transaction>;
        } catch (_) {
          this.rollbackTransaction(output as Transaction);
          data[idx] = this.tempDataIdx;
          continue;
        }

        this.updateAccount(sender);
        this.updateAccount(receiver);
        continue;
      }
    }
    return data;
  }

  private saveTransaction(transaction: Transaction) {
    this.transaction_history.push(transaction);
  }

  private rollbackTransaction(transaction: Transaction) {
    const idx = this.transaction_history.indexOf(transaction);
    if (idx !== -1) {
      this.transaction_history.splice(idx, 1);
    }
  }

  private updateAccount(account: Initialize): void {
    this.accountInitializationService.updateAvailableLimits(account);
  }

  private checkDuplicatedTransaction(transaction: Transaction): boolean {
    const trx = this.transaction_history.find(
      (trx) =>
        trx.sender_document === transaction.sender_document &&
        trx.receiver_document === transaction.receiver_document &&
        trx.value === transaction.value,
    );
    if (trx) {
      const minutesDiff = differenceInSeconds(
        new Date(transaction.datetime),
        new Date(trx.datetime),
      );
      return (
        Math.abs(minutesDiff) <=
        this.DUPLICATED_TRANSACTION_TOLERANCE_IN_SECONDS
      );
    }

    return false;
  }
}
