import type { PontoAlimentacao, CreatePontoAlimentacaoDTO } from '@/types/domain';

export interface IPontoAlimentacaoRepository {
  findById(id: string): Promise<PontoAlimentacao | null>;
  findAll(): Promise<PontoAlimentacao[]>;
  create(data: CreatePontoAlimentacaoDTO): Promise<PontoAlimentacao>;
  update(id: string, data: Partial<PontoAlimentacao>): Promise<PontoAlimentacao>;
  delete(id: string): Promise<void>;
}
