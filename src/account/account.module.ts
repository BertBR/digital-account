import { Module } from '@nestjs/common';
import { AccountController } from './controllers/account.controller';
import { AccountInitializationService } from './services/AccountInitializationService';
import { AccountStorage } from './storage/AccountStorage';

@Module({
  controllers: [AccountController],
  providers: [
    {
      provide: 'Account_Initialization',
      useClass: AccountInitializationService,
    },
    {
      provide: 'Account_Storage',
      useClass: AccountStorage,
    },
  ],
})
export class AccountModule {}
