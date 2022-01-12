import { Controller, Post } from '@nestjs/common';
import { DigitalAccountServices } from '../services/DigitalAccountServices';

@Controller('operations')
export class OperationsController {
  constructor(private readonly service: DigitalAccountServices) {}

  @Post('run')
  async run() {
    await this.service.execute();
  }
}
