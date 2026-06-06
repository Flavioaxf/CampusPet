import type { Notificacao, CreateNotificacaoDTO } from '@/types/domain';

export interface INotificacaoRepository {
  findById(id: string): Promise<Notificacao | null>;
  findAll(): Promise<Notificacao[]>;
  create(data: CreateNotificacaoDTO): Promise<Notificacao>;
  update(id: string, data: Partial<Notificacao>): Promise<Notificacao>;
  delete(id: string): Promise<void>;
}
