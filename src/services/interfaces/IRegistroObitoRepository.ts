import type { RegistroObito, CreateRegistroObitoDTO } from '@/types/domain';

export interface IRegistroObitoRepository {
  findById(id: string): Promise<RegistroObito | null>;
  findAll(): Promise<RegistroObito[]>;
  create(data: CreateRegistroObitoDTO): Promise<RegistroObito>;
}
