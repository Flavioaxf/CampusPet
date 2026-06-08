import type { VistoriaPontoAlimentacao, CreateVistoriaPontoAlimentacaoDTO } from '@/types/domain';

export interface IVistoriaPontoAlimentacaoRepository {
  findById(id: string): Promise<VistoriaPontoAlimentacao | null>;
  findAll(): Promise<VistoriaPontoAlimentacao[]>;
  create(data: CreateVistoriaPontoAlimentacaoDTO): Promise<VistoriaPontoAlimentacao>;
  update(id: string, data: Partial<VistoriaPontoAlimentacao>): Promise<VistoriaPontoAlimentacao>;
  delete(id: string): Promise<void>;
  findUltimaVistoria(pontoId: string): Promise<VistoriaPontoAlimentacao | null>;
  findByPonto(pontoId: string): Promise<VistoriaPontoAlimentacao[]>;
}
