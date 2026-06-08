import { prontuarioService } from '../ProntuarioService';
import { 
  prontuarioRepository, 
  vacinaRepository, 
  pesagemRepository, 
  tratamentoRepository, 
  statusCastracaoRepository, 
  registroObitoRepository, 
  animalRepository, 
  logAuditoriaRepository,
  notificacaoRepository,
  followUpPosAdocaoRepository,
  alteracaoPendenteRepository
} from '@/services';
import { PerfilUsuario, StatusAnimal, StatusAprovacao, StatusFollowUp, CausaObito } from '@/types/enums';
import { Usuario, CreateRegistroObitoDTO, CreateFollowUpPosAdocaoDTO } from '@/types/domain';

jest.mock('@/services', () => ({
  prontuarioRepository: { findById: jest.fn() },
  vacinaRepository: { create: jest.fn() },
  pesagemRepository: { create: jest.fn() },
  tratamentoRepository: { create: jest.fn() },
  statusCastracaoRepository: { create: jest.fn() },
  registroObitoRepository: { create: jest.fn() },
  animalRepository: { findById: jest.fn(), update: jest.fn() },
  logAuditoriaRepository: { create: jest.fn() },
  alteracaoPendenteRepository: { create: jest.fn() },
  notificacaoRepository: { create: jest.fn() },
  followUpPosAdocaoRepository: { create: jest.fn() },
}));

describe('ProntuarioService', () => {
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

  describe('registrarObito (RN-06)', () => {
    const obitoDTO: CreateRegistroObitoDTO = {
      prontuarioId: 'p1',
      dataObito: new Date(),
      causa: CausaObito.DOENCA,
      observacoes: 'None',
      registradoPorId: 'gestor1',
    };

    it('should throw error if prontuario not found', async () => {
      (prontuarioRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(prontuarioService.registrarObito(obitoDTO, gestor)).rejects.toThrow('Prontuário não encontrado.');
    });

    it('should throw error if animal already dead', async () => {
      (prontuarioRepository.findById as jest.Mock).mockResolvedValue({ id: 'p1', animalId: 'a1' });
      (animalRepository.findById as jest.Mock).mockResolvedValue({ id: 'a1', status: StatusAnimal.OBITO });
      await expect(prontuarioService.registrarObito(obitoDTO, gestor)).rejects.toThrow('já foi registrado.');
    });

    it('should register death and update animal status', async () => {
      (prontuarioRepository.findById as jest.Mock).mockResolvedValue({ id: 'p1', animalId: 'a1' });
      (animalRepository.findById as jest.Mock).mockResolvedValue({ id: 'a1', status: StatusAnimal.EM_CUIDADO });
      (registroObitoRepository.create as jest.Mock).mockResolvedValue({ id: 'o1', ...obitoDTO });

      const result = await prontuarioService.registrarObito(obitoDTO, gestor);

      expect(registroObitoRepository.create).toHaveBeenCalledWith(obitoDTO);
      expect(animalRepository.update).toHaveBeenCalledWith('a1', { status: StatusAnimal.OBITO });
      expect(logAuditoriaRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        entidade: 'RegistroObito',
      }));
      expect(result.id).toBe('o1');
    });
  });

  describe('registrarFollowUp', () => {
    it('should trigger notification if status is CRITICO', async () => {
      const followUpDTO: CreateFollowUpPosAdocaoDTO = {
        prontuarioId: 'p1',
        data: new Date(),
        texto: 'Critical',
        statusFollowUp: StatusFollowUp.CRITICO,
        registradoPorId: 'gestor1',
      };
      (followUpPosAdocaoRepository.create as jest.Mock).mockResolvedValue({ id: 'f1', ...followUpDTO });

      await prontuarioService.registrarFollowUp(followUpDTO, gestor);

      expect(notificacaoRepository.create).toHaveBeenCalled();
    });

    it('should NOT trigger notification if status is BEM', async () => {
      const followUpDTO: CreateFollowUpPosAdocaoDTO = {
        prontuarioId: 'p1',
        data: new Date(),
        texto: 'All good',
        statusFollowUp: StatusFollowUp.BEM,
        registradoPorId: 'gestor1',
      };
      (followUpPosAdocaoRepository.create as jest.Mock).mockResolvedValue({ id: 'f2', ...followUpDTO });

      await prontuarioService.registrarFollowUp(followUpDTO, gestor);

      expect(notificacaoRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('clinical registrations', () => {
    it('should register vaccine', async () => {
      const dto = { prontuarioId: 'p1', nome: 'V1', dataAplicacao: new Date(), proximaDose: null };
      (vacinaRepository.create as jest.Mock).mockResolvedValue({ id: 'v1', ...dto });
      await prontuarioService.registrarVacina(dto, gestor);
      expect(vacinaRepository.create).toHaveBeenCalled();
    });

    it('should register weighing', async () => {
      const dto = { prontuarioId: 'p1', data: new Date(), pesoKg: 10 };
      (pesagemRepository.create as jest.Mock).mockResolvedValue({ id: 'w1', ...dto });
      await prontuarioService.registrarPesagem(dto, gestor);
      expect(pesagemRepository.create).toHaveBeenCalled();
    });

    it('should register treatment', async () => {
      const dto = { prontuarioId: 'p1', descricao: 'T1', dataInicio: new Date(), fimEstimado: null, medicacoes: null };
      (tratamentoRepository.create as jest.Mock).mockResolvedValue({ id: 't1', ...dto });
      await prontuarioService.registrarTratamento(dto, gestor);
      expect(tratamentoRepository.create).toHaveBeenCalled();
    });
  });

  describe('atualizarStatusCastracao (RN-01)', () => {
    const dto = { prontuarioId: 'p1', castrado: true, situacao: StatusAprovacao.PENDENTE };

    it('should update directly if GESTOR', async () => {
      (statusCastracaoRepository.create as jest.Mock).mockResolvedValue({ id: 'sc1', ...dto, situacao: StatusAprovacao.APROVADO });
      await prontuarioService.atualizarStatusCastracao(dto, gestor);
      expect(statusCastracaoRepository.create).toHaveBeenCalledWith(expect.objectContaining({ situacao: StatusAprovacao.APROVADO }));
    });

    it('should create AlteracaoPendente if VOLUNTARIO', async () => {
      const voluntario = { ...gestor, perfil: PerfilUsuario.VOLUNTARIO };
      await prontuarioService.atualizarStatusCastracao(dto, voluntario);
      expect(alteracaoPendenteRepository.create).toHaveBeenCalledWith(expect.objectContaining({ entidade: 'StatusCastracao' }));
    });
  });
});
