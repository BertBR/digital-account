import { Test, TestingModule } from '@nestjs/testing';
import {
  Initialize,
  Operation,
  OperationType,
  Transaction,
} from '../models/operation.model';
import { AccountInitializationService } from './AccountInitializationService';
import { AccountTransactionService } from './AccountTransactionService';

describe('AccountTransactionService', () => {
  let sut: AccountTransactionService;

  const getMockedDatetime = () => new Date().toISOString();

  const getMockedInitializedAccounts = (): Initialize[] => [
    {
      name: 'sender',
      available_limit: 100,
      document: 'any_sender',
    },
    {
      name: 'receiver',
      available_limit: 100,
      document: 'any_receiver',
    },
  ];

  const getMockedSender = () =>
    getMockedInitializedAccounts().filter((acc) => acc.name === 'sender');
  const getMockedReceiver = () =>
    getMockedInitializedAccounts().filter((acc) => acc.name === 'receiver');

  const getMockedOperation = () =>
    [
      {
        type: OperationType.transaction,
        payload: {
          sender_document: 'any_sender',
          receiver_document: 'any_receiver',
          value: 10,
          datetime: getMockedDatetime(),
        },
      },
    ] as Operation<Transaction>[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountTransactionService,
        {
          provide: 'Account_Initialization',
          useClass: AccountInitializationService,
        },
      ],
    }).compile();

    sut = module.get<AccountTransactionService>(AccountTransactionService);

    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should fails a transaction when one of accounts in transaction was not initialized', async () => {
    jest
      .spyOn(
        AccountInitializationService.prototype as any,
        'checkInitializedAccounts',
      )
      .mockImplementationOnce(() => ({
        sender: null,
        receiver: null,
      }));
    const mockedOperation = getMockedOperation();
    const expected = [
      {
        item: 0,
        type: 'transaction',
        status: 'failure',
        violation: 'account_not_initialized',
      },
    ];

    const spy = await sut.perform(mockedOperation);
    expect(spy).toEqual(expected);
  });

  it('should fails a transaction when one of accounts has no insufficient limit', async () => {
    const mockedOperation = getMockedOperation();

    jest
      .spyOn(
        AccountInitializationService.prototype as any,
        'checkInitializedAccounts',
      )
      .mockImplementationOnce(() => ({
        sender: getMockedSender()[0],
        receiver: getMockedReceiver()[0],
      }));
    const expected = [
      {
        item: 0,
        type: 'transaction',
        status: 'failure',
        violation: 'insufficient_limit',
      },
    ];

    mockedOperation[0].payload.value = 10000000000;

    const spy = await sut.perform(mockedOperation);
    expect(spy).toEqual(expected);
  });

  it('should fails when a repeated transaction(value, sender and receiver) is executed at least 2min ago', async () => {
    jest
      .spyOn(
        AccountInitializationService.prototype as any,
        'checkInitializedAccounts',
      )
      .mockImplementationOnce(() => ({
        sender: getMockedSender()[0],
        receiver: getMockedReceiver()[0],
      }));

    jest
      .spyOn(
        AccountTransactionService.prototype as any,
        'checkDuplicatedTransaction',
      )
      .mockImplementationOnce(() => true);

    const mockedOperation = getMockedOperation();

    const expected = [
      {
        item: 0,
        type: 'transaction',
        status: 'failure',
        violation: 'double_transaction',
      },
    ];

    const spy = await sut.perform(mockedOperation);
    expect(spy).toEqual(expected);
  });

  it('should process an atomic transaction', async () => {
    jest
      .spyOn(
        AccountInitializationService.prototype as any,
        'checkInitializedAccounts',
      )
      .mockImplementationOnce(() => ({
        sender: getMockedSender()[0],
        receiver: getMockedReceiver()[0],
      }));

    const mockedOperation = getMockedOperation();
    const mockedAccounts = getMockedInitializedAccounts();

    const mockedSender = mockedAccounts.find(
      (acc) => acc.document === mockedOperation[0].payload.sender_document,
    );

    const expected = [
      {
        item: 0,
        type: 'transaction',
        status: 'success',
        result: {
          available_limit:
            mockedSender.available_limit - mockedOperation[0].payload.value,
          receiver_document: mockedOperation[0].payload.receiver_document,
          sender_document: mockedOperation[0].payload.sender_document,
          datetime: mockedOperation[0].payload.datetime,
        },
      },
    ];

    const updateAccountSpy = jest.spyOn(
      AccountTransactionService.prototype as any,
      'updateAccount',
    );

    const saveTransactionSpy = jest.spyOn(
      AccountTransactionService.prototype as any,
      'saveTransaction',
    );

    const res = await sut.perform(mockedOperation);
    expect(res).toEqual(expected);
    expect(updateAccountSpy).toHaveBeenCalledTimes(2);
    expect(saveTransactionSpy).toHaveBeenCalledTimes(1);
  });

  it('should rollback transaction if error occurred while processing', async () => {
    jest
      .spyOn(
        AccountInitializationService.prototype as any,
        'checkInitializedAccounts',
      )
      .mockImplementationOnce(() => ({
        sender: getMockedSender()[0],
        receiver: getMockedReceiver()[0],
      }));
    jest
      .spyOn(AccountTransactionService.prototype as any, 'saveTransaction')
      .mockImplementationOnce(() => {
        throw Error();
      });

    const mockedOperation = getMockedOperation();
    const updateAccountSpy = jest.spyOn(
      AccountTransactionService.prototype as any,
      'updateAccount',
    );

    const rollbackTransactionSpy = jest.spyOn(
      AccountTransactionService.prototype as any,
      'rollbackTransaction',
    );
    await sut.perform(mockedOperation);
    expect(rollbackTransactionSpy).toHaveBeenCalledTimes(1);
    expect(updateAccountSpy).toHaveBeenCalledTimes(0);
  });
});
