import {
  Initialize,
  Operation,
  OperationType,
} from '../models/operation.model';
import { IAccountInitializationService } from './interfaces/IAccountInitializationService';

export class AccountInitializationService
  implements IAccountInitializationService
{
  private readonly initialized_accounts: Initialize[] = [];

  async perform(data: Operation<Initialize>[]): Promise<unknown[]> {
    let output = {};
    for (const line of data) {
      if (line.type === OperationType.initialize_account && line.payload) {
        if (this.checkIfDocumentAlreadyUsed(line.payload.document)) {
          output = {
            item: data.indexOf(line),
            type: line.type,
            status: 'failure',
            violation: 'account_already_initialized',
          };
          const idx = data.indexOf(line);
          data[idx] = output as Operation<Initialize>;
        } else {
          this.initialized_accounts.push(line.payload);
          output = {
            item: data.indexOf(line),
            type: line.type,
            status: 'success',
            result: {
              name: line.payload.name,
              document: line.payload.document,
              available_limit: line.payload.available_limit,
            },
          };
          const idx = data.indexOf(line);
          data[idx] = output as Operation<Initialize>;
        }
      }
    }
    return data;
  }

  private checkIfDocumentAlreadyUsed(document: string): unknown {
    6;
    return this.initialized_accounts.find((el) => el.document === document);
  }

  public getInitializedAccounts(): Initialize[] {
    return this.initialized_accounts;
  }

  public updateAvailableLimits(account: Initialize): void {
    const accountToUpdate = this.initialized_accounts.find(
      (acc) => acc.document === account.document,
    );

    if (accountToUpdate) {
      const accountIdx = this.initialized_accounts.indexOf(accountToUpdate);
      this.initialized_accounts[accountIdx] = account;
    }
  }
}
