import type { Estorno, CreateEstornoDTO } from '@/types/domain';

export interface IEstornoRepository {
  findById(id: string): Promise<Estorno | null>;
  findAll(): Promise<Estorno[]>;
  create(data: CreateEstornoDTO): Promise<Estorno>;
}
