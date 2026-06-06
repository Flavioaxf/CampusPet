import { usuarioRepository } from '@/services';
import { comparePassword, hashPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { PerfilUsuario } from '@/types/enums';
import { Usuario } from '@/types/domain';
import crypto from 'crypto';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const RESET_TOKEN_DURATION_MS = 60 * 60 * 1000; // 1 hour
const INVITE_TOKEN_DURATION_MS = 48 * 60 * 60 * 1000; // 48 hours

export class AuthService {
  /**
   * Performs user login.
   * @param email - User's email.
   * @param password - User's plain text password.
   * @returns A promise that resolves to the JWT if successful.
   */
  async login(email: string, password: string): Promise<string> {
    const user = await usuarioRepository.findByEmail(email);

    if (!user) {
      throw new Error('Credenciais inválidas.');
    }

    if (!user.ativo) {
      throw new Error('Conta inativa. Entre em contato com o administrador.');
    }

    // Check if account is currently locked
    if (user.bloqueadoAte && user.bloqueadoAte > new Date()) {
      const remainingMinutes = Math.ceil((user.bloqueadoAte.getTime() - Date.now()) / 60000);
      throw new Error(`Conta bloqueada temporariamente. Tente novamente em ${remainingMinutes} minutos.`);
    }

    const isPasswordValid = await comparePassword(password, user.senhaHash || '');

    if (!isPasswordValid) {
      await this.handleFailedAttempt(user.id, user.tentativasFalhas);
      throw new Error('Credenciais inválidas.');
    }

    // Successful login: reset failed attempts and update last login
    await usuarioRepository.update(user.id, {
      tentativasFalhas: 0,
      bloqueadoAte: null,
      ultimoLogin: new Date(),
    });

    return generateToken({
      userId: user.id,
      email: user.email,
      perfil: user.perfil,
    });
  }

  /**
   * Generates a password reset token for a user.
   * @param email - User's email.
   */
  async requestPasswordReset(email: string): Promise<string> {
    const user = await usuarioRepository.findByEmail(email);

    if (!user) {
      // Return a dummy token or success message to avoid user enumeration
      return crypto.randomUUID();
    }

    const resetToken = crypto.randomUUID();
    const resetExpires = new Date(Date.now() + RESET_TOKEN_DURATION_MS);

    await usuarioRepository.update(user.id, {
      resetToken,
      resetExpires,
    });

    // TODO: Enviar e-mail com link de recuperação (UC-02)
    return resetToken;
  }

  /**
   * Resets a user's password using a valid reset token.
   * @param token - The reset token.
   * @param newPassword - The new plain text password.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await usuarioRepository.findByResetToken(token);

    if (!user || !user.resetExpires || user.resetExpires < new Date()) {
      throw new Error('Token de recuperação inválido ou expirado.');
    }

    const senhaHash = await hashPassword(newPassword);

    await usuarioRepository.update(user.id, {
      senhaHash,
      resetToken: null,
      resetExpires: null,
      tentativasFalhas: 0,
      bloqueadoAte: null,
    });
  }

  /**
   * Invites a new volunteer.
   * @param email - Volunteer's email.
   * @param nome - Volunteer's name.
   */
  async inviteVolunteer(email: string, nome: string): Promise<string> {
    const existingUser = await usuarioRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('E-mail já cadastrado.');
    }

    const conviteToken = crypto.randomUUID();
    const conviteExpires = new Date(Date.now() + INVITE_TOKEN_DURATION_MS);

    await usuarioRepository.create({
      nome,
      email,
      ativo: false,
      perfil: PerfilUsuario.VOLUNTARIO,
      tentativasFalhas: 0,
      bloqueadoAte: null,
      resetToken: null,
      resetExpires: null,
      conviteToken,
      conviteExpires,
    });

    // TODO: Enviar e-mail de convite (UC-04)
    return conviteToken;
  }

  /**
   * Activates a volunteer account using an invitation token.
   * @param token - The invitation token.
   * @param password - The password to set.
   */
  async activateAccount(token: string, password: string): Promise<void> {
    const user = await usuarioRepository.findByConviteToken(token);

    if (!user || !user.conviteExpires || user.conviteExpires < new Date()) {
      throw new Error('Convite inválido ou expirado.');
    }

    const senhaHash = await hashPassword(password);

    await usuarioRepository.update(user.id, {
      senhaHash,
      ativo: true,
      conviteToken: null,
      conviteExpires: null,
    });
  }

  /**
   * Handles a failed login attempt.
   * @param userId - ID of the user.
   * @param currentAttempts - Current number of failed attempts.
   */
  private async handleFailedAttempt(userId: string, currentAttempts: number): Promise<void> {
    const newAttempts = currentAttempts + 1;
    const updates: Partial<Usuario> = { tentativasFalhas: newAttempts };

    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      updates.bloqueadoAte = new Date(Date.now() + LOCKOUT_DURATION_MS);
      // TODO: Enviar e-mail de aviso ao titular (RF-01)
    }

    await usuarioRepository.update(userId, updates);
  }
}

export const authService = new AuthService();
