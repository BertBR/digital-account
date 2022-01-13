import { Initialize, Operation } from '../../models/operation.model';

export interface IAccountInitializationService {
  perform(file: Operation<Initialize>[]): Promise<Operation<Initialize>[]>;
  checkInitializedAccounts({
    sender_document,
    receiver_document,
  }: {
    sender_document?: string;
    receiver_document?: string;
  }): {
    sender: Initialize;
    receiver: Initialize;
  };
  updateAvailableLimits(account: Initialize): void;
}
