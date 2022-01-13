import { Inject } from '@nestjs/common';
import {
  Initialize,
  Operation,
  OperationType,
  Transaction,
} from '../models/operation.model';
import { IAccountInitializationService } from '../interfaces/IAccountInitializationService';
import { differenceInSeconds } from 'date-fns';
import { BaseTransactionService } from './BaseTransactionService';
import { IAccountTransactionService } from '../interfaces/IAccountTransactionService';

export class AccountTransactionService implements IAccountTransactionService {
  private tempDataIdx: Operation<Transaction>;
  private DUPLICATED_TRANSACTION_TOLERANCE_IN_SECONDS = 120;
  private baseTransactionService = BaseTransactionService.getInstance();

  constructor(
    @Inject('Account_Initialization')
    private readonly accountInitializationService: IAccountInitializationService,
  ) {}

  async perform(
    data: Operation<Transaction>[],
  ): Promise<Operation<Transaction>[]> {
    let output = {};
    for (const line of data) {
      if (line.type === OperationType.transaction && line.payload) {
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
        const { receiver, sender } =
          this.accountInitializationService.checkInitializedAccounts({
            receiver_document: line.payload.receiver_document,
            sender_document: line.payload.sender_document,
          });

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
        line.payload.sender_available_limit = sender.available_limit;
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
    this.baseTransactionService.addToTransactionHistory = transaction;
  }

  private rollbackTransaction(transaction: Transaction) {
    const idx =
      this.baseTransactionService.transaction_history.indexOf(transaction);
    if (idx !== -1) {
      this.baseTransactionService.transaction_history.splice(idx, 1);
      this.baseTransactionService.updateTransactionHistory =
        this.baseTransactionService.transaction_history;
    }
  }

  private updateAccount(account: Initialize): void {
    this.accountInitializationService.updateAvailableLimits(account);
  }

  private checkDuplicatedTransaction(transaction: Transaction): boolean {
    const trx = this.baseTransactionService.transaction_history.find(
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
