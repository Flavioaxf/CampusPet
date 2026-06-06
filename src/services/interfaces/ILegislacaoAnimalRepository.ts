import type { LegislacaoAnimal, CreateLegislacaoAnimalDTO } from '@/types/domain';

export interface ILegislacaoAnimalRepository {
  findById(id: string): Promise<LegislacaoAnimal | null>;
  findAll(): Promise<LegislacaoAnimal[]>;
  create(data: CreateLegislacaoAnimalDTO): Promise<LegislacaoAnimal>;
  update(id: string, data: Partial<LegislacaoAnimal>): Promise<LegislacaoAnimal>;
  delete(id: string): Promise<void>;
}
