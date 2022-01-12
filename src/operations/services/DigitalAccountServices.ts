import { Inject } from '@nestjs/common';
import { Initialize, Operation, Transaction } from '../models/operation.model';
import { FileValidationHelper } from '../shared/FileValidationHelper';
import { IAccountStorage } from '../storage/IAccountStorage';
import { IAccountInitializationService } from './interfaces/IAccountInitializationService';
import { IAccountTransactionService } from './interfaces/IAccountTransactionService';

export class DigitalAccountServices {
  constructor(
    @Inject('Account_Initialization')
    private readonly accountInitializationService: IAccountInitializationService,
    @Inject('Account_Transaction')
    private readonly accountTransactionService: IAccountTransactionService,
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
    await this.accountTransactionService.perform(
      data as unknown as Operation<Transaction>[],
    );

    await this.accountStorage.write(data);
  }
}
