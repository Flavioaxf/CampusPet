import type { Doacao, CreateDoacaoDTO } from '@/types/domain';
import { StatusDoacao } from '@/types/enums';

export interface IDoacaoRepository {
  findById(id: string): Promise<Doacao | null>;
  findAll(): Promise<Doacao[]>;
  create(data: CreateDoacaoDTO): Promise<Doacao>;
  update(id: string, data: Partial<Doacao>): Promise<Doacao>;
  findByStatus(status: StatusDoacao): Promise<Doacao[]>;
  findByPeriodo(inicio: Date, fim: Date): Promise<Doacao[]>;
}
