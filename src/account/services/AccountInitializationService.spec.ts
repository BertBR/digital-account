import { Test, TestingModule } from '@nestjs/testing';
import { Initialize, Operation } from '../models/operation.model';
import { AccountStorage } from '../storage/AccountStorage';
import { AccountInitializationService } from './AccountInitializationService';

describe('AccountService', () => {
  let sut: AccountInitializationService;

  const getMockedOperation = () =>
    ({
      type: 'initialize_account',
      payload: {
        name: 'Fulano de Tal',
        document: '000.000.000-00',
        available_limit: 1000,
      },
    } as Operation<Initialize>);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountInitializationService,
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
      type: mockedOperation.type,
      status: 'success',
      result: {
        name: mockedOperation.payload.name,
        document: mockedOperation.payload.document,
        available_limit: mockedOperation.payload.available_limit,
      },
    };

    const spy = jest.spyOn(sut['accountStorage'], 'write');
    await sut.perform();
    expect(spy).toHaveBeenCalledWith(expected);
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
      type: mockedOperation.type,
      status: 'failure',
      violation: 'account_already_initialized',
    };

    const spy = jest.spyOn(sut['accountStorage'], 'write');

    await sut.perform();
    expect(spy).toHaveBeenCalledWith(expected);
  });
});
