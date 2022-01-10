import { Inject } from '@nestjs/common';
import { Initialize, Operation } from '../models/operation.model';
import { IAccountStorage } from '../storage/IAccountStorage';
import { IAccountInitializationService } from './interfaces/IAccountInitializationService';

export class AccountInitializationService
  implements IAccountInitializationService
{
  private accounts: Initialize[] = [];

  constructor(
    @Inject('Account_Storage') private readonly accountStorage: IAccountStorage,
  ) {}

  async perform(): Promise<void> {
    const file = await this.accountStorage.read();
    const operation = JSON.parse(file.toString()) as Operation<Initialize>[];
    let output = {};
    for (const data of operation) {
      if (this.checkIfDocumentAlreadyUsed(data.payload.document)) {
        output = {
          type: data.type,
          status: 'failure',
          violation: 'account_already_initialized',
        };

        await this.accountStorage.write(output);
      } else {
        this.accounts.push(data.payload);
        output = {
          type: data.type,
          status: 'success',
          result: {
            name: data.payload.name,
            document: data.payload.document,
            available_limit: data.payload.available_limit,
          },
        };
        await this.accountStorage.write(output);
      }
    }
  }

  private checkIfDocumentAlreadyUsed(document: string): unknown {
    return this.accounts.find((el) => el.document === document);
  }
}
