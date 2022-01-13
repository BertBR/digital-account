import { Inject } from '@nestjs/common';
import {
  Initialize,
  Operation,
  Transaction,
  TransactionHistory,
} from '../models/operation.model';
import { FileValidationHelper } from '../shared/FileValidationHelper';
import { IAccountStorage } from '../interfaces/IAccountStorage';
import { IAccountInitializationService } from '../interfaces/IAccountInitializationService';
import { IAccountTransactionService } from '../interfaces/IAccountTransactionService';
import { IGetAccountTransactionHistory } from '../interfaces/IGetAccountTransactionHistory';

export class DigitalAccountServices {
  constructor(
    @Inject('Account_Initialization')
    private readonly accountInitializationService: IAccountInitializationService,
    @Inject('Account_Transaction')
    private readonly accountTransactionService: IAccountTransactionService,
    @Inject('Account_Transaction_History')
    private readonly getAccountTransactionHistory: IGetAccountTransactionHistory,
    @Inject('Account_Storage')
    private readonly accountStorage: IAccountStorage,
    private readonly fileValidationHelper: FileValidationHelper,
  ) {}
  async execute() {
    const file = await this.accountStorage.read();
    let data = await this.fileValidationHelper.perform(file);

    data = await this.accountInitializationService.perform(
      data as unknown as Operation<Initialize>[],
    );

    data = await this.accountTransactionService.perform(
      data as unknown as Operation<Transaction>[],
    );

    data = await this.getAccountTransactionHistory.perform(
      data as unknown as Operation<TransactionHistory>[],
    );

    await this.accountStorage.write(data);
  }
}
