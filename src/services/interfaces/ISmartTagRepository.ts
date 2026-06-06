import type { SmartTag, CreateSmartTagDTO } from '@/types/domain';

export interface ISmartTagRepository {
  findById(id: string): Promise<SmartTag | null>;
  findAll(): Promise<SmartTag[]>;
  create(data: CreateSmartTagDTO): Promise<SmartTag>;
  update(id: string, data: Partial<SmartTag>): Promise<SmartTag>;
  delete(id: string): Promise<void>;
}
