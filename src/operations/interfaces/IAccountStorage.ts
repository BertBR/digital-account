export interface IAccountStorage {
  read(): Promise<Buffer>;
  write(data: unknown): Promise<void>;
}
