import type { Doacao, CreateDoacaoDTO } from '@/types/domain';

export interface IDoacaoRepository {
  findById(id: string): Promise<Doacao | null>;
  findAll(): Promise<Doacao[]>;
  create(data: CreateDoacaoDTO): Promise<Doacao>;
  update(id: string, data: Partial<Doacao>): Promise<Doacao>;
}
