import type { Vacina, CreateVacinaDTO } from '@/types/domain';

export interface IVacinaRepository {
  findById(id: string): Promise<Vacina | null>;
  findAll(): Promise<Vacina[]>;
  create(data: CreateVacinaDTO): Promise<Vacina>;
  update(id: string, data: Partial<Vacina>): Promise<Vacina>;
  delete(id: string): Promise<void>;
}
