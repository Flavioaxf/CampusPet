import type { Usuario, CreateUsuarioDTO } from '@/types/domain';

export interface IUsuarioRepository {
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  findByResetToken(token: string): Promise<Usuario | null>;
  findByConviteToken(token: string): Promise<Usuario | null>;
  findAll(): Promise<Usuario[]>;
  create(data: CreateUsuarioDTO): Promise<Usuario>;
  update(id: string, data: Partial<Usuario>): Promise<Usuario>;
  delete(id: string): Promise<void>;
}
