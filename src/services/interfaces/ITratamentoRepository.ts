import type { Tratamento, CreateTratamentoDTO } from '@/types/domain';

export interface ITratamentoRepository {
  findById(id: string): Promise<Tratamento | null>;
  findAll(): Promise<Tratamento[]>;
  create(data: CreateTratamentoDTO): Promise<Tratamento>;
  update(id: string, data: Partial<Tratamento>): Promise<Tratamento>;
  delete(id: string): Promise<void>;
}
