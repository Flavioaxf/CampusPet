import type { AnexoFollowUp, CreateAnexoFollowUpDTO } from '@/types/domain';

export interface IAnexoFollowUpRepository {
  findById(id: string): Promise<AnexoFollowUp | null>;
  findAll(): Promise<AnexoFollowUp[]>;
  create(data: CreateAnexoFollowUpDTO): Promise<AnexoFollowUp>;
  delete(id: string): Promise<void>;
}
