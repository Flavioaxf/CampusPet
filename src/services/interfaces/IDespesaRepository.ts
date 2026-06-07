import type { Despesa, CreateDespesaDTO } from '@/types/domain';

export interface IDespesaRepository {
  findById(id: string): Promise<Despesa | null>;
  findAll(): Promise<Despesa[]>;
  create(data: CreateDespesaDTO): Promise<Despesa>;
  update(id: string, data: Partial<Despesa>): Promise<Despesa>;
  findByPeriodo(inicio: Date, fim: Date): Promise<Despesa[]>;
  findByAnimal(animalId: string): Promise<Despesa[]>;
}
