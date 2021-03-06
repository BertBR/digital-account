import { Test, TestingModule } from '@nestjs/testing';
import {
  Initialize,
  Operation,
  OperationType,
} from '../models/operation.model';
import { AccountStorage } from '../storage/AccountStorage';
import { AccountInitializationService } from './AccountInitializationService';
import { FileValidationHelper } from '../shared/FileValidationHelper';

describe('AccountInitializationService', () => {
  let sut: AccountInitializationService;

  const getMockedOperation = () =>
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountInitializationService,
        FileValidationHelper,
        {
          provide: 'Account_Storage',
          useClass: AccountStorage,
        },
        {
          provide: 'Account_Initialization',
          useClass: AccountInitializationService,
        },
      ],
    }).compile();

    sut = module.get<AccountInitializationService>(
      AccountInitializationService,
    );

    jest
      .spyOn(AccountStorage.prototype as any, 'read')
      .mockImplementation(async () =>
        Promise.resolve(Buffer.from(JSON.stringify([getMockedOperation()]))),
      );
  });

  it('should initialize an account with correct values', async () => {
    const mockedOperation = getMockedOperation();

    jest
      .spyOn(
        AccountInitializationService.prototype as any,
        'checkIfDocumentAlreadyUsed',
      )
      .mockImplementation(() => false);

    const expected = {
      item: 0,
      type: mockedOperation[0].type,
      status: 'success',
      result: {
        name: mockedOperation[0].payload.name,
        document: mockedOperation[0].payload.document,
        available_limit: mockedOperation[0].payload.available_limit,
      },
    };

    const spy = await sut.perform(mockedOperation);
    expect(spy).toEqual([expected]);
  });

  it('should failure when initialize account with document already used', async () => {
    const mockedOperation = getMockedOperation();

    jest
      .spyOn(
        AccountInitializationService.prototype as any,
        'checkIfDocumentAlreadyUsed',
      )
      .mockImplementation(() => true);

    const expected = {
      item: 0,
      type: mockedOperation[0].type,
      status: 'failure',
      violation: 'account_already_initialized',
    };

    const spy = await sut.perform(mockedOperation);
    expect(spy).toEqual([expected]);
  });
});
