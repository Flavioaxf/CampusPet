import type { AlteracaoPendente, CreateAlteracaoPendenteDTO } from '@/types/domain';

export interface IAlteracaoPendenteRepository {
  findById(id: string): Promise<AlteracaoPendente | null>;
  findAll(): Promise<AlteracaoPendente[]>;
  create(data: CreateAlteracaoPendenteDTO): Promise<AlteracaoPendente>;
  update(id: string, data: Partial<AlteracaoPendente>): Promise<AlteracaoPendente>;
  delete(id: string): Promise<void>;
}
