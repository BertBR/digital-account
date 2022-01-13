import { Test, TestingModule } from '@nestjs/testing';
import {
  Initialize,
  Operation,
  OperationType,
  Transaction,
  TransactionHistory,
} from '../models/operation.model';
import { AccountInitializationService } from './AccountInitializationService';
import { GetAccountTransactionHistory } from './GetAccountTransactionHistory';

describe('GetAccountTransactionHistory', () => {
  let sut: GetAccountTransactionHistory;

  const getMockedInitializedAccounts = () =>
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

  const getMockedTransaction = () =>
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

  const getMockedOperation = () =>
    [
      {
        type: OperationType.transaction_history,
        payload: {
          document: 'any_sender',
        },
      },
    ] as Operation<TransactionHistory>[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAccountTransactionHistory,
        {
          provide: 'Account_Initialization',
          useClass: AccountInitializationService,
        },
      ],
    }).compile();

    sut = module.get<GetAccountTransactionHistory>(
      GetAccountTransactionHistory,
    );
  });

  it('should get an account transaction history by document', async () => {
    const mockedOperation = getMockedOperation();
    const mockedTransaction = getMockedTransaction();

    jest
      .spyOn(
        sut['accountInitializationService'] as any,
        'checkInitializedAccounts',
      )
      .mockImplementationOnce(() => ({
        sender: getMockedInitializedAccounts(),
        receiver: null,
      }));

    const expected = [
      {
        type: 'transaction_history',
        status: 'success',
        result: [
          {
            sender_document: mockedTransaction[0].payload.sender_document,
            receiver_document: mockedTransaction[0].payload.receiver_document,
            value: mockedTransaction[0].payload.value,
            datetime: mockedTransaction[0].payload.datetime,
            available_limit: 1000,
          },
        ],
      },
    ];

    jest
      .spyOn(
        GetAccountTransactionHistory.prototype as any,
        'getSenderTransactionHistory',
      )
      .mockImplementationOnce(() => expected[0].result);

    const res = await sut.perform(mockedOperation);
    expect(res).toEqual(expected);
  });
});
