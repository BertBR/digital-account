import { Initialize, Operation } from '../../models/operation.model';

export interface IAccountInitializationService {
  perform(file: Operation<Initialize>[]): Promise<unknown[]>;
  getInitializedAccounts(): Initialize[];
  updateAvailableLimits(account: Initialize): void;
}
