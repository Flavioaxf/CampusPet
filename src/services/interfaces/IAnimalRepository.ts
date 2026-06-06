import type { Animal, CreateAnimalDTO } from '@/types/domain';

export interface IAnimalRepository {
  findById(id: string): Promise<Animal | null>;
  findAll(): Promise<Animal[]>;
  create(data: CreateAnimalDTO): Promise<Animal>;
  update(id: string, data: Partial<Animal>): Promise<Animal>;
  delete(id: string): Promise<void>;
}
