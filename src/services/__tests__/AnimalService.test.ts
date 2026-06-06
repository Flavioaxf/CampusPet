import { animalService } from '../AnimalService';
import { animalRepository, alteracaoPendenteRepository, logAuditoriaRepository } from '@/services';
import { PerfilUsuario, StatusAnimal, EspecieAnimal, SexoAnimal, StatusAprovacao, TipoOperacao } from '@/types/enums';
import { Animal, Usuario } from '@/types/domain';

jest.mock('@/services', () => ({
  animalRepository: {
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
  },
  alteracaoPendenteRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  },
  logAuditoriaRepository: {
    create: jest.fn(),
  },
}));

describe('AnimalService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const gestor: Usuario = {
    id: 'gestor1',
    nome: 'Gestor',
    email: 'gestor@test.com',
    ativo: true,
    perfil: PerfilUsuario.GESTOR,
    criadoEm: new Date(),
    ultimoLogin: null,
    tentativasFalhas: 0,
    bloqueadoAte: null,
    resetToken: null,
    resetExpires: null,
  };

  const voluntario: Usuario = {
    ...gestor,
    id: 'voluntario1',
    perfil: PerfilUsuario.VOLUNTARIO,
  };

  const animalDTO = {
    nome: 'Rex',
    especie: EspecieAnimal.CAO,
    pelagem: 'Marrom',
    sexo: SexoAnimal.MACHO,
    idadeEstimada: '2 anos',
    status: StatusAnimal.EM_CUIDADO,
    aptoParaAdocao: false,
    fotoUrl: 'http://photo.com',
  };

  describe('cadastrarAnimal', () => {
    it('should create animal directly if user is GESTOR', async () => {
      const createdAnimal = { id: 'anim1', ...animalDTO, criadoEm: new Date() };
      (animalRepository.create as jest.Mock).mockResolvedValue(createdAnimal);

      const result = await animalService.cadastrarAnimal(animalDTO, gestor);

      expect(animalRepository.create).toHaveBeenCalledWith(animalDTO);
      expect(logAuditoriaRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        operacao: TipoOperacao.CRIACAO,
        entidade: 'Animal',
      }));
      expect(result).toEqual(createdAnimal);
    });

    it('should create AlteracaoPendente if user is VOLUNTARIO', async () => {
      const pending = { id: 'pending1', entidade: 'Animal', status: StatusAprovacao.PENDENTE };
      (alteracaoPendenteRepository.create as jest.Mock).mockResolvedValue(pending);

      const result = await animalService.cadastrarAnimal(animalDTO, voluntario);

      expect(animalRepository.create).not.toHaveBeenCalled();
      expect(alteracaoPendenteRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        entidade: 'Animal',
        entidadeId: 'NEW',
        status: StatusAprovacao.PENDENTE,
      }));
      expect(result).toEqual(pending);
    });
  });

  describe('atualizarAnimal', () => {
    it('should throw error if animal not found', async () => {
      (animalRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(animalService.atualizarAnimal('1', {}, gestor)).rejects.toThrow('Animal não encontrado.');
    });

    it('should throw error if animal is deceased (RN-06)', async () => {
      (animalRepository.findById as jest.Mock).mockResolvedValue({ id: '1', status: StatusAnimal.OBITO });
      await expect(animalService.atualizarAnimal('1', { nome: 'Novo' }, gestor)).rejects.toThrow('RN-06');
    });

    it('should update directly if user is GESTOR', async () => {
      const animal = { id: '1', status: StatusAnimal.EM_CUIDADO };
      (animalRepository.findById as jest.Mock).mockResolvedValue(animal);
      (animalRepository.update as jest.Mock).mockResolvedValue({ ...animal, nome: 'Novo' });

      await animalService.atualizarAnimal('1', { nome: 'Novo' }, gestor);

      expect(animalRepository.update).toHaveBeenCalledWith('1', { nome: 'Novo' });
    });

    it('should create AlteracaoPendente if user is VOLUNTARIO and field is critical', async () => {
      const animal = { id: '1', status: StatusAnimal.EM_CUIDADO, nome: 'Velho' };
      (animalRepository.findById as jest.Mock).mockResolvedValue(animal);

      await animalService.atualizarAnimal('1', { nome: 'Novo' }, voluntario);

      expect(animalRepository.update).not.toHaveBeenCalled();
      expect(alteracaoPendenteRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        entidadeId: '1',
        dadosProposto: expect.stringContaining('Novo'),
      }));
    });
  });

  describe('isElegivelParaVitrine (RN-03)', () => {
    it('should return true if PARA_ADOCAO and aptoParaAdocao', () => {
      const animal = { status: StatusAnimal.PARA_ADOCAO, aptoParaAdocao: true } as Animal;
      expect(animalService.isElegivelParaVitrine(animal)).toBe(true);
    });

    it('should return false otherwise', () => {
      const animal = { status: StatusAnimal.EM_CUIDADO, aptoParaAdocao: true } as Animal;
      expect(animalService.isElegivelParaVitrine(animal)).toBe(false);
    });
  });

  describe('listarElegiveisParaVitrine', () => {
    it('should filter eligible animals', async () => {
      (animalRepository.findAll as jest.Mock).mockResolvedValue([
        { id: '1', status: StatusAnimal.PARA_ADOCAO, aptoParaAdocao: true },
        { id: '2', status: StatusAnimal.EM_CUIDADO, aptoParaAdocao: true },
      ]);
      const result = await animalService.listarElegiveisParaVitrine();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });
});
