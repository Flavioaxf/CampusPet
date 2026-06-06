import type { Prontuario, CreateProntuarioDTO } from '@/types/domain';

export interface IProntuarioRepository {
  findById(id: string): Promise<Prontuario | null>;
  findAll(): Promise<Prontuario[]>;
  create(data: CreateProntuarioDTO): Promise<Prontuario>;
  update(id: string, data: Partial<Prontuario>): Promise<Prontuario>;
  delete(id: string): Promise<void>;
}
