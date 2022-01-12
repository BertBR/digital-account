import {
  Initialize,
  Operation,
  OperationType,
} from '../models/operation.model';

type FileValidationReturnType = {
  data: Operation<unknown>[];
  output: Output[];
};

type Output = {
  type: OperationType;
  status: string;
  violation: string;
};

export class FileValidationHelper {
  async perform(file: Buffer): Promise<unknown> {
    try {
      const data = JSON.parse(file.toString()) as Operation<unknown>[];
      let output: unknown;
      for (const line of data) {
        if (!(line.type in OperationType)) {
          output = {
            item: data.indexOf(line),
            type: line.type,
            status: 'failure',
            violation: 'invalid data',
          };
          const idx = data.indexOf(line);
          data[idx] = output as Operation<unknown>;
        }

        if (line.type === OperationType.initialize_account) {
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
        }
      }
      return data;
    } catch (error) {
      throw new Error('invalid input file');
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
