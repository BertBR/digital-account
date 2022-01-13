import {
  Initialize,
  Operation,
  OperationType,
  Transaction,
  TransactionHistory,
} from '../models/operation.model';

export class FileValidationHelper {
  async perform(file: Buffer): Promise<Operation<unknown>[]> {
    try {
      const data = JSON.parse(file.toString()) as Operation<unknown>[];
      let output: unknown;
      for (const line of data) {
        if (!(line.type in OperationType)) {
          output = {
            item: data.indexOf(line),
            type: line.type,
            status: 'failure',
            violation: 'invalid operation',
          };
          const idx = data.indexOf(line);
          data[idx] = output as Operation<unknown>;
          continue;
        }

        if (line.type === OperationType.initialize_account) {
          this.isValidAccountInitialization(line.payload as Initialize);
          if (!this.validateAccountInitialization(line.payload as Initialize)) {
            output = {
              item: data.indexOf(line),
              type: line.type,
              status: 'failure',
              violation: 'invalid data',
            };
            const idx = data.indexOf(line);
            data[idx] = output as Operation<unknown>;
          }
          continue;
        }

        if (line.type === OperationType.transaction) {
          this.isValidTransaction(line.payload as Transaction);
          continue;
        }
        if (line.type === OperationType.transaction_history) {
          this.isValidTransactionHistory(line.payload as TransactionHistory);
          continue;
        }
      }
      return data;
    } catch (error) {
      throw new Error('invalid input file');
    }
  }

  private isValidAccountInitialization(payload: Initialize): void {
    if (!payload.available_limit || !payload.document || !payload.name) {
      throw new Error();
    }
  }

  private isValidTransaction(payload: Transaction): void {
    if (
      !payload.datetime ||
      !payload.receiver_document ||
      !payload.sender_document ||
      !payload.value
    ) {
      throw new Error();
    }
  }

  private isValidTransactionHistory(payload: TransactionHistory): void {
    if (!payload.document) {
      throw new Error();
    }
  }

  private validateAccountInitialization(payload: Initialize) {
    const isStringOk = this.checkPropStringConstraints(payload);
    const isNumberOk = this.checkPropNumberConstraints(payload);

    if (!isStringOk || !isNumberOk) {
      return false;
    }

    return true;
  }

  private checkPropStringConstraints(props: any): boolean {
    if (props.name && typeof props.name !== 'string') {
      return false;
    }

    if (props.document && typeof props.document !== 'string') {
      return false;
    }

    return true;
  }

  private checkPropNumberConstraints(props: any): boolean {
    if (props.available_limit && typeof props.available_limit !== 'number') {
      return false;
    }

    return true;
  }
}
