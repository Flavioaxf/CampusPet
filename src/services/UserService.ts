import { usuarioRepository } from '@/services';
import { PerfilUsuario, Usuario } from '@/types/domain';

export class UserService {
  /**
   * Lists all volunteers.
   */
  async listVolunteers(): Promise<Usuario[]> {
    const allUsers = await usuarioRepository.findAll();
    return allUsers.filter(u => u.perfil === PerfilUsuario.VOLUNTARIO);
  }

  /**
   * Deactivates a user (soft delete).
   * @param userId - ID of the user to deactivate.
   */
  async deactivateUser(userId: string): Promise<void> {
    await usuarioRepository.update(userId, { ativo: false });
  }

  /**
   * Updates user information.
   * @param userId - ID of the user.
   * @param data - Partial user data.
   */
  async updateUser(userId: string, data: Partial<Usuario>): Promise<void> {
    // Prevent sensitive fields from being updated here
    const sensitiveFields: (keyof Usuario)[] = [
      'senhaHash',
      'resetToken',
      'resetExpires',
      'conviteToken',
      'conviteExpires'
    ];
    
    const safeData = { ...data };
    
    sensitiveFields.forEach(field => {
      delete safeData[field];
    });

    await usuarioRepository.update(userId, safeData);
  }
}

export const userService = new UserService();
