import { approvalService } from '../ApprovalService';
import { 
  alteracaoPendenteRepository, 
  animalRepository, 
  statusCastracaoRepository,
  notificacaoRepository
} from '@/services';
import { PerfilUsuario, StatusAprovacao } from '@/types/enums';
import { Usuario } from '@/types/domain';

jest.mock('@/services', () => ({
  alteracaoPendenteRepository: { findById: jest.fn(), update: jest.fn() },
  animalRepository: { create: jest.fn(), update: jest.fn() },
  statusCastracaoRepository: { create: jest.fn() },
  logAuditoriaRepository: { create: jest.fn() },
  notificacaoRepository: { create: jest.fn() },
}));

describe('ApprovalService', () => {
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

  describe('aprovarAlteracao (RN-01)', () => {
    it('should throw error if not GESTOR', async () => {
      await expect(approvalService.aprovarAlteracao('1', { ...gestor, perfil: PerfilUsuario.VOLUNTARIO }))
        .rejects.toThrow('Apenas gestores');
    });

    it('should approve NEW animal creation', async () => {
      const alteracao = {
        id: 'alt1',
        entidade: 'Animal',
        entidadeId: 'NEW',
        dadosProposto: JSON.stringify({ nome: 'Rex' }),
        status: StatusAprovacao.PENDENTE,
        submetidoPorId: 'vol1',
      };
      (alteracaoPendenteRepository.findById as jest.Mock).mockResolvedValue(alteracao);
      (animalRepository.create as jest.Mock).mockResolvedValue({ id: 'a1', nome: 'Rex' });

      await approvalService.aprovarAlteracao('alt1', gestor);

      expect(animalRepository.create).toHaveBeenCalled();
      expect(alteracaoPendenteRepository.update).toHaveBeenCalledWith('alt1', expect.objectContaining({
        status: StatusAprovacao.APROVADO,
      }));
      expect(notificacaoRepository.create).toHaveBeenCalled();
    });

    it('should approve existing animal update', async () => {
      const alteracao = {
        id: 'alt1',
        entidade: 'Animal',
        entidadeId: 'a1',
        dadosProposto: JSON.stringify({ nome: 'Rex' }),
        status: StatusAprovacao.PENDENTE,
        submetidoPorId: 'vol1',
      };
      (alteracaoPendenteRepository.findById as jest.Mock).mockResolvedValue(alteracao);
      (animalRepository.update as jest.Mock).mockResolvedValue({ id: 'a1', nome: 'Rex' });

      await approvalService.aprovarAlteracao('alt1', gestor);

      expect(animalRepository.update).toHaveBeenCalledWith('a1', { nome: 'Rex' });
    });

    it('should approve StatusCastracao', async () => {
      const alteracao = {
        id: 'alt1',
        entidade: 'StatusCastracao',
        entidadeId: 'NEW',
        dadosProposto: JSON.stringify({ prontuarioId: 'p1', castrado: true }),
        status: StatusAprovacao.PENDENTE,
        submetidoPorId: 'vol1',
      };
      (alteracaoPendenteRepository.findById as jest.Mock).mockResolvedValue(alteracao);
      (statusCastracaoRepository.create as jest.Mock).mockResolvedValue({ id: 'sc1' });

      await approvalService.aprovarAlteracao('alt1', gestor);

      expect(statusCastracaoRepository.create).toHaveBeenCalled();
    });

    it('should throw error if already processed', async () => {
      (alteracaoPendenteRepository.findById as jest.Mock).mockResolvedValue({ status: StatusAprovacao.APROVADO });
      await expect(approvalService.aprovarAlteracao('alt1', gestor)).rejects.toThrow('já foi processada');
    });

    it('should throw error if alteracao not found', async () => {
      (alteracaoPendenteRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(approvalService.aprovarAlteracao('alt1', gestor)).rejects.toThrow('não encontrada');
    });

    it('should throw error for unsupported entity', async () => {
      const alteracao = {
        id: 'alt1',
        entidade: 'Unknown',
        status: StatusAprovacao.PENDENTE,
        dadosProposto: JSON.stringify({}),
      };
      (alteracaoPendenteRepository.findById as jest.Mock).mockResolvedValue(alteracao);
      await expect(approvalService.aprovarAlteracao('alt1', gestor)).rejects.toThrow('não suportada');
    });
  });

  describe('rejeitarAlteracao (RN-01)', () => {
    it('should throw error if justification too short', async () => {
      await expect(approvalService.rejeitarAlteracao('alt1', 'short', gestor))
        .rejects.toThrow('pelo menos 10 caracteres');
    });

    it('should throw error if not gestor', async () => {
      await expect(approvalService.rejeitarAlteracao('alt1', 'Justification', { ...gestor, perfil: PerfilUsuario.VOLUNTARIO }))
        .rejects.toThrow('Apenas gestores');
    });

    it('should throw error if alteracao not found', async () => {
      (alteracaoPendenteRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(approvalService.rejeitarAlteracao('alt1', 'Justification', gestor)).rejects.toThrow('não encontrada');
    });

    it('should throw error if already processed', async () => {
      (alteracaoPendenteRepository.findById as jest.Mock).mockResolvedValue({ status: StatusAprovacao.REJEITADO });
      await expect(approvalService.rejeitarAlteracao('alt1', 'Justification', gestor)).rejects.toThrow('já foi processada');
    });

    it('should update status to REJEITADO', async () => {
      const alteracao = { id: 'alt1', status: StatusAprovacao.PENDENTE, submetidoPorId: 'vol1', entidade: 'Animal' };
      (alteracaoPendenteRepository.findById as jest.Mock).mockResolvedValue(alteracao);

      await approvalService.rejeitarAlteracao('alt1', 'This is a long enough reason.', gestor);

      expect(alteracaoPendenteRepository.update).toHaveBeenCalledWith('alt1', expect.objectContaining({
        status: StatusAprovacao.REJEITADO,
        justificativaRejeicao: 'This is a long enough reason.',
      }));
    });
  });
});
