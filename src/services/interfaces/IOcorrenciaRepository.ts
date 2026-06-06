import type { Ocorrencia, CreateOcorrenciaDTO } from '@/types/domain';

export interface IOcorrenciaRepository {
  findById(id: string): Promise<Ocorrencia | null>;
  findAll(): Promise<Ocorrencia[]>;
  create(data: CreateOcorrenciaDTO): Promise<Ocorrencia>;
  update(id: string, data: Partial<Ocorrencia>): Promise<Ocorrencia>;
  delete(id: string): Promise<void>;
}
