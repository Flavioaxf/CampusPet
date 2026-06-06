import type { FollowUpPosAdocao, CreateFollowUpPosAdocaoDTO } from '@/types/domain';

export interface IFollowUpPosAdocaoRepository {
  findById(id: string): Promise<FollowUpPosAdocao | null>;
  findAll(): Promise<FollowUpPosAdocao[]>;
  create(data: CreateFollowUpPosAdocaoDTO): Promise<FollowUpPosAdocao>;
  update(id: string, data: Partial<FollowUpPosAdocao>): Promise<FollowUpPosAdocao>;
  delete(id: string): Promise<void>;
}
