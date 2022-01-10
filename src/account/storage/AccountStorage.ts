import * as path from 'path';
import { IAccountStorage } from './IAccountStorage';
import { readFile, writeFile } from 'fs/promises';

export class AccountStorage implements IAccountStorage {
  async read(): Promise<Buffer> {
    return readFile(path.resolve('src', 'input.json'));
  }

  async write(data: unknown): Promise<void> {
    await writeFile(
      path.resolve('src', 'output.json'),
      `${JSON.stringify(data)}\n`,
      {
        flag: 'a',
      },
    );
  }
}
