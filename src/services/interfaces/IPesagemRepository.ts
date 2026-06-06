import type { Pesagem, CreatePesagemDTO } from '@/types/domain';

export interface IPesagemRepository {
  findById(id: string): Promise<Pesagem | null>;
  findAll(): Promise<Pesagem[]>;
  create(data: CreatePesagemDTO): Promise<Pesagem>;
  update(id: string, data: Partial<Pesagem>): Promise<Pesagem>;
  delete(id: string): Promise<void>;
}
