import { Module } from '@nestjs/common';
import { OperationsController } from './controllers/OperationsController';
import { AccountInitializationService } from './services/AccountInitializationService';
import { AccountTransactionService } from './services/AccountTransactionService';
import { DigitalAccountServices } from './services/DigitalAccountServices';
import { FileValidationHelper } from './shared/FileValidationHelper';
import { AccountStorage } from './storage/AccountStorage';

@Module({
  controllers: [OperationsController],
  providers: [
    {
      provide: 'Account_Initialization',
      useClass: AccountInitializationService,
    },
    {
      provide: 'Account_Storage',
      useClass: AccountStorage,
    },
    {
      provide: 'Account_Transaction',
      useClass: AccountTransactionService,
    },
    FileValidationHelper,
    DigitalAccountServices,
  ],
})
export class OperationsModule {}
