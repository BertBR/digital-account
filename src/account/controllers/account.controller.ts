import { Controller, Inject, Post } from '@nestjs/common';
import { IAccountInitializationService } from '../services/interfaces/IAccountInitializationService';

@Controller('account')
export class AccountController {
  constructor(
    @Inject('Account_Initialization')
    private readonly accountInitializationService: IAccountInitializationService,
  ) {}
  @Post()
  initializeAccount() {
    return this.accountInitializationService.perform();
  }
}
