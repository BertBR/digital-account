export class Operation<T> {
  type: OperationType;
  payload: T;
}

export enum OperationType {
  'initialize_account' = 'initialize_account',
  'transaction' = 'transaction',
  'transaction_history' = 'transaction_history',
}

export type Initialize = {
  name: string;
  document: string;
  available_limit: number;
};

export type Transaction = {
  sender_document: string;
  receiver_document: string;
  value: number;
  datetime: string;
  sender_available_limit?: number;
};

export type TransactionHistory = {
  document: string;
};
