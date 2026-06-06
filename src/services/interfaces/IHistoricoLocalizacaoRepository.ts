import type { HistoricoLocalizacao, CreateHistoricoLocalizacaoDTO } from '@/types/domain';

export interface IHistoricoLocalizacaoRepository {
  findById(id: string): Promise<HistoricoLocalizacao | null>;
  findAll(): Promise<HistoricoLocalizacao[]>;
  create(data: CreateHistoricoLocalizacaoDTO): Promise<HistoricoLocalizacao>;
  update(id: string, data: Partial<HistoricoLocalizacao>): Promise<HistoricoLocalizacao>;
  delete(id: string): Promise<void>;
}
