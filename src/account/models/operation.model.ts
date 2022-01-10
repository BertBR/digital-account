export class Operation<T> {
  type: 'initialize_account' | 'transaction' | 'transaction_history';
  payload: T;
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
};

export type History = {
  document: string;
};
