import { userService } from '../UserService';
import { usuarioRepository } from '@/services';
import { PerfilUsuario } from '@/types/enums';
import { Usuario } from '@/types/domain';

jest.mock('@/services', () => ({
  usuarioRepository: {
    findAll: jest.fn(),
    update: jest.fn(),
  },
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should list only volunteers', async () => {
    (usuarioRepository.findAll as jest.Mock).mockResolvedValue([
      { id: '1', perfil: PerfilUsuario.GESTOR },
      { id: '2', perfil: PerfilUsuario.VOLUNTARIO },
    ]);

    const result = await userService.listVolunteers();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should deactivate user', async () => {
    await userService.deactivateUser('123');
    expect(usuarioRepository.update).toHaveBeenCalledWith('123', { ativo: false });
  });

  it('should update user avoiding sensitive fields', async () => {
    await userService.updateUser('123', { nome: 'New', senhaHash: 'hack' } as Partial<Usuario>);
    expect(usuarioRepository.update).toHaveBeenCalledWith('123', { nome: 'New' });
  });
});
