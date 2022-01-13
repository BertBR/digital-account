import { Test, TestingModule } from '@nestjs/testing';
import {
  Initialize,
  Operation,
  OperationType,
  Transaction,
  TransactionHistory,
} from '../models/operation.model';
import { FileValidationHelper } from './FileValidationHelper';

describe('FileValidationHelper', () => {
  let sut: FileValidationHelper;

  const getMockedAccountInitialization = () =>
    [
      {
        type: OperationType.initialize_account,
        payload: {
          name: 'Fulano de Tal',
          document: '000.000.000-00',
          available_limit: 1000,
        },
      },
    ] as Operation<Initialize>[];

  const getMockedAccountTransaction = () =>
    [
      {
        type: OperationType.transaction,
        payload: {
          sender_document: 'any_sender',
          receiver_document: 'any_receiver',
          value: 10,
          datetime: new Date().toISOString(),
        },
      },
    ] as Operation<Transaction>[];

  const getMockedTransactionHistory = () =>
    [
      {
        type: OperationType.transaction_history,
        payload: {
          document: 'any_sender',
        },
      },
    ] as Operation<TransactionHistory>[];

  const getMockedData = () => [
    ...getMockedAccountInitialization(),
    ...getMockedAccountTransaction(),
    ...getMockedTransactionHistory(),
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileValidationHelper],
    }).compile();

    sut = module.get<FileValidationHelper>(FileValidationHelper);
  });

  it('should fails when try to initialize an account with incorrect values', async () => {
    jest
      .spyOn(
        FileValidationHelper.prototype as any,
        'validateAccountInitialization',
      )
      .mockImplementationOnce(() => false);

    const expected = {
      item: 0,
      type: OperationType.initialize_account,
      status: 'failure',
      violation: 'invalid data',
    };

    const mockedData = getMockedData();
    const data = await sut.perform(Buffer.from(JSON.stringify(mockedData)));
    expect(data[0]).toEqual(expected);
  });

  it('should fails when try to process a transaction with incorrect values', async () => {
    jest
      .spyOn(FileValidationHelper.prototype as any, 'isValidTransaction')
      .mockImplementationOnce(() => {
        throw new Error('invalid input file');
      });

    const mockedData = getMockedData();
    const spy = sut.perform(Buffer.from(JSON.stringify(mockedData)));

    await expect(spy).rejects.toThrow(Error);
  });
  it('should fails when try to get a transaction history with incorrect values', async () => {
    jest
      .spyOn(FileValidationHelper.prototype as any, 'isValidTransactionHistory')
      .mockImplementationOnce(() => {
        throw new Error('invalid input file');
      });

    const mockedData = getMockedData();
    const spy = sut.perform(Buffer.from(JSON.stringify(mockedData)));

    await expect(spy).rejects.toThrow(Error);
  });
});
