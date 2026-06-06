import { authService } from '../AuthService';
import { usuarioRepository } from '@/services';
import { comparePassword, hashPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { PerfilUsuario } from '@/types/enums';

jest.mock('@/services', () => ({
  usuarioRepository: {
    findByEmail: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    findByResetToken: jest.fn(),
    findByConviteToken: jest.fn(),
  },
}));

jest.mock('@/lib/auth/password', () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(),
}));

jest.mock('@/lib/auth/jwt', () => ({
  generateToken: jest.fn(),
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const email = 'test@example.com';
    const password = 'password123';

    it('should throw error if user not found', async () => {
      (usuarioRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(email, password)).rejects.toThrow('Credenciais inválidas.');
    });

    it('should throw error if user is inactive', async () => {
      (usuarioRepository.findByEmail as jest.Mock).mockResolvedValue({
        email,
        ativo: false,
      });

      await expect(authService.login(email, password)).rejects.toThrow('Conta inativa.');
    });

    it('should throw error if account is locked', async () => {
      const futureDate = new Date(Date.now() + 100000);
      (usuarioRepository.findByEmail as jest.Mock).mockResolvedValue({
        email,
        ativo: true,
        bloqueadoAte: futureDate,
      });

      await expect(authService.login(email, password)).rejects.toThrow('Conta bloqueada temporariamente.');
    });

    it('should handle failed attempt if password invalid', async () => {
      (usuarioRepository.findByEmail as jest.Mock).mockResolvedValue({
        id: 'user123',
        email,
        ativo: true,
        tentativasFalhas: 0,
      });
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(email, password)).rejects.toThrow('Credenciais inválidas.');
      expect(usuarioRepository.update).toHaveBeenCalledWith('user123', expect.objectContaining({ tentativasFalhas: 1 }));
    });

    it('should login successfully', async () => {
      const user = {
        id: 'user123',
        email,
        ativo: true,
        tentativasFalhas: 0,
        senhaHash: 'hash',
        perfil: PerfilUsuario.GESTOR,
      };
      (usuarioRepository.findByEmail as jest.Mock).mockResolvedValue(user);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (generateToken as jest.Mock).mockReturnValue('token123');

      const token = await authService.login(email, password);

      expect(token).toBe('token123');
      expect(usuarioRepository.update).toHaveBeenCalledWith('user123', expect.objectContaining({
        tentativasFalhas: 0,
        bloqueadoAte: null,
      }));
    });
  });

  describe('inviteVolunteer', () => {
    it('should throw error if email already exists', async () => {
      (usuarioRepository.findByEmail as jest.Mock).mockResolvedValue({ id: '1' });

      await expect(authService.inviteVolunteer('test@test.com', 'Nome')).rejects.toThrow('E-mail já cadastrado.');
    });

    it('should create a new inactive volunteer', async () => {
      (usuarioRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      const token = await authService.inviteVolunteer('test@test.com', 'Nome');

      expect(token).toBeDefined();
      expect(usuarioRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        nome: 'Nome',
        email: 'test@test.com',
        ativo: false,
        perfil: PerfilUsuario.VOLUNTARIO,
      }));
    });
  });

  describe('requestPasswordReset', () => {
    it('should return a dummy token if user not found', async () => {
      (usuarioRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      const token = await authService.requestPasswordReset('notfound@test.com');
      expect(token).toBeDefined();
      expect(usuarioRepository.update).not.toHaveBeenCalled();
    });

    it('should set reset token if user found', async () => {
      (usuarioRepository.findByEmail as jest.Mock).mockResolvedValue({ id: 'user123' });
      const token = await authService.requestPasswordReset('found@test.com');
      expect(token).toBeDefined();
      expect(usuarioRepository.update).toHaveBeenCalledWith('user123', expect.objectContaining({
        resetToken: token,
      }));
    });
  });

  describe('resetPassword', () => {
    it('should throw error if token invalid or expired', async () => {
      (usuarioRepository.findByResetToken as jest.Mock).mockResolvedValue(null);
      await expect(authService.resetPassword('bad', 'newPass')).rejects.toThrow('Token de recuperação inválido ou expirado.');
    });

    it('should update password and clear token', async () => {
      (usuarioRepository.findByResetToken as jest.Mock).mockResolvedValue({
        id: 'user123',
        resetExpires: new Date(Date.now() + 100000),
      });
      (hashPassword as jest.Mock).mockResolvedValue('newHash');

      await authService.resetPassword('good', 'newPass');

      expect(usuarioRepository.update).toHaveBeenCalledWith('user123', expect.objectContaining({
        senhaHash: 'newHash',
        resetToken: null,
      }));
    });
  });

  describe('activateAccount', () => {
    it('should throw error if token invalid or expired', async () => {
      (usuarioRepository.findByConviteToken as jest.Mock).mockResolvedValue(null);
      await expect(authService.activateAccount('bad', 'pass')).rejects.toThrow('Convite inválido ou expirado.');
    });

    it('should activate account and set password', async () => {
      (usuarioRepository.findByConviteToken as jest.Mock).mockResolvedValue({
        id: 'user123',
        conviteExpires: new Date(Date.now() + 100000),
      });
      (hashPassword as jest.Mock).mockResolvedValue('newHash');

      await authService.activateAccount('good', 'pass');

      expect(usuarioRepository.update).toHaveBeenCalledWith('user123', expect.objectContaining({
        senhaHash: 'newHash',
        ativo: true,
      }));
    });
  });
});
