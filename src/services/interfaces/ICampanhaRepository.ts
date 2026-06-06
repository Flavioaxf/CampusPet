import type { Campanha, CreateCampanhaDTO } from '@/types/domain';

export interface ICampanhaRepository {
  findById(id: string): Promise<Campanha | null>;
  findAll(): Promise<Campanha[]>;
  create(data: CreateCampanhaDTO): Promise<Campanha>;
  update(id: string, data: Partial<Campanha>): Promise<Campanha>;
  delete(id: string): Promise<void>;
}
