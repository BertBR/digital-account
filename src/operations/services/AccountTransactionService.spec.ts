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

  const mockedDatetime = new Date().toISOString();

  const mockedInitializedAccounts: Initialize[] = [
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

  const getMockedOperation = () =>
    [
      {
        type: OperationType.transaction,
        payload: {
          sender_document: 'any_sender',
          receiver_document: 'any_receiver',
          value: 10,
          datetime: mockedDatetime,
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
  });

  it('should fails a transaction when one of accounts in transaction was not initialized', async () => {
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
        'getInitializedAccounts',
      )
      .mockImplementation(() => mockedInitializedAccounts);
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
        'getInitializedAccounts',
      )
      .mockImplementation(() => mockedInitializedAccounts);

    jest
      .spyOn(
        AccountTransactionService.prototype as any,
        'checkDuplicatedTransaction',
      )
      .mockImplementation(() => true);

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
});
