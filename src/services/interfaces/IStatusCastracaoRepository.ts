import type { StatusCastracao, CreateStatusCastracaoDTO } from '@/types/domain';

export interface IStatusCastracaoRepository {
  findById(id: string): Promise<StatusCastracao | null>;
  findAll(): Promise<StatusCastracao[]>;
  create(data: CreateStatusCastracaoDTO): Promise<StatusCastracao>;
  update(id: string, data: Partial<StatusCastracao>): Promise<StatusCastracao>;
  delete(id: string): Promise<void>;
}
