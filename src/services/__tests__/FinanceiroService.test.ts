import { financeiroService } from '../FinanceiroService';
import { 
  doacaoRepository, 
  despesaRepository, 
  estornoRepository, 
  contaFinanceiraRepository, 
  categoriaFinanceiraRepository,
  alteracaoPendenteRepository,
  logAuditoriaRepository
} from '@/services';
import { 
  PerfilUsuario, 
  StatusDoacao, 
  StatusAprovacao, 
  OrigemDoacao,
  TipoDoacao,
  MetodoDoacao,
} from '@/types/enums';
import { Usuario, CreateDoacaoDTO, CreateDespesaDTO, Doacao, Estorno, Despesa } from '@/types/domain';

jest.mock('@/services', () => ({
  doacaoRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  },
  despesaRepository: {
    create: jest.fn(),
  },
  estornoRepository: {
    create: jest.fn(),
  },
  contaFinanceiraRepository: {
    hasMovimentacoes: jest.fn(),
    delete: jest.fn(),
  },
  categoriaFinanceiraRepository: {
    hasMovimentacoes: jest.fn(),
    delete: jest.fn(),
  },
  alteracaoPendenteRepository: {
    create: jest.fn(),
  },
  logAuditoriaRepository: {
    create: jest.fn(),
  },
}));

describe('FinanceiroService', () => {
  const mockGestor: Usuario = {
    id: 'gestor-1',
    nome: 'Gestor Teste',
    email: 'gestor@teste.com',
    perfil: PerfilUsuario.GESTOR,
    ativo: true,
    criadoEm: new Date(),
    ultimoLogin: null,
    tentativasFalhas: 0,
    bloqueadoAte: null,
    resetToken: null,
    resetExpires: null,
  };

  const mockVoluntario: Usuario = {
    id: 'vol-1',
    nome: 'Voluntario Teste',
    email: 'vol@teste.com',
    perfil: PerfilUsuario.VOLUNTARIO,
    ativo: true,
    criadoEm: new Date(),
    ultimoLogin: null,
    tentativasFalhas: 0,
    bloqueadoAte: null,
    resetToken: null,
    resetExpires: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registrarDoacaoManual (UC-15)', () => {
    const doacaoDados: CreateDoacaoDTO = {
      tipo: TipoDoacao.DINHEIRO,
      valor: 100,
      data: new Date(),
      nomeDoador: 'Doador Teste',
      metodo: MetodoDoacao.PIX,
      contaId: 'conta-1',
      categoriaId: 'cat-1',
      transactionId: null,
      status: StatusDoacao.PENDENTE,
      origem: OrigemDoacao.MANUAL,
      registradoPorId: 'vol-1'
    };

    it('deve criar doação CONFIRMADA se o usuário for GESTOR', async () => {
      (doacaoRepository.create as jest.Mock).mockResolvedValue({ id: 'doacao-1', ...doacaoDados, status: StatusDoacao.CONFIRMADO } as Doacao);

      const result = await financeiroService.registrarDoacaoManual(doacaoDados, mockGestor) as Doacao;

      expect(doacaoRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        status: StatusDoacao.CONFIRMADO,
        origem: OrigemDoacao.MANUAL,
      }));
      expect(logAuditoriaRepository.create).toHaveBeenCalled();
      expect(result.status).toBe(StatusDoacao.CONFIRMADO);
    });

    it('deve criar AlteracaoPendente se o usuário for VOLUNTARIO (RN-01)', async () => {
      (alteracaoPendenteRepository.create as jest.Mock).mockResolvedValue({ id: 'alt-1' });

      await financeiroService.registrarDoacaoManual(doacaoDados, mockVoluntario);

      expect(alteracaoPendenteRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        entidade: 'Doacao',
        status: StatusAprovacao.PENDENTE,
      }));
      expect(doacaoRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('estornarDoacao (UC-17 / RN-02)', () => {
    it('deve lançar erro se o usuário não for gestor', async () => {
      await expect(financeiroService.estornarDoacao('doacao-1', 'Justificativa longa o suficiente', mockVoluntario))
        .rejects.toThrow('Apenas gestores podem realizar estornos.');
    });

    it('deve lançar erro se a justificativa tiver menos de 10 caracteres', async () => {
      await expect(financeiroService.estornarDoacao('doacao-1', 'Curta', mockGestor))
        .rejects.toThrow('A justificativa de estorno deve ter pelo menos 10 caracteres (RN-02).');
    });

    it('deve lançar erro se a doação não for encontrada', async () => {
      (doacaoRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(financeiroService.estornarDoacao('invalid-id', 'Justificativa válida com mais de 10 caracteres', mockGestor))
        .rejects.toThrow('Doação não encontrada.');
    });

    it('deve lançar erro se a doação já estiver estornada', async () => {
      (doacaoRepository.findById as jest.Mock).mockResolvedValue({ id: 'd1', status: StatusDoacao.ESTORNADO } as Doacao);
      await expect(financeiroService.estornarDoacao('d1', 'Justificativa válida com mais de 10 caracteres', mockGestor))
        .rejects.toThrow('Esta doação já foi estornada.');
    });

    it('deve realizar o estorno com sucesso', async () => {
      const mockDoacao = { id: 'doacao-1', status: StatusDoacao.CONFIRMADO } as Doacao;
      (doacaoRepository.findById as jest.Mock).mockResolvedValue(mockDoacao);
      (doacaoRepository.update as jest.Mock).mockResolvedValue({ ...mockDoacao, status: StatusDoacao.ESTORNADO } as Doacao);
      (estornoRepository.create as jest.Mock).mockResolvedValue({ id: 'estorno-1' } as Estorno);

      const result = await financeiroService.estornarDoacao('doacao-1', 'Justificativa válida com mais de 10 caracteres', mockGestor);

      expect(doacaoRepository.update).toHaveBeenCalledWith('doacao-1', { status: StatusDoacao.ESTORNADO });
      expect(estornoRepository.create).toHaveBeenCalled();
      expect(logAuditoriaRepository.create).toHaveBeenCalledTimes(2); // Doacao + Estorno
      expect(result).toBeDefined();
    });
  });

  describe('registrarDespesa', () => {
    it('deve registrar uma despesa com sucesso', async () => {
      const despesaDados: CreateDespesaDTO = { 
        valor: 50, 
        descricao: 'Ração', 
        contaId: '1', 
        categoriaId: '2', 
        data: new Date(), 
        prontuarioId: 'p1',
        registradoPorId: 'gestor-1'
      };
      (despesaRepository.create as jest.Mock).mockResolvedValue({ id: 'despesa-1', ...despesaDados } as Despesa);

      const result = await financeiroService.registrarDespesa(despesaDados, mockGestor);

      expect(despesaRepository.create).toHaveBeenCalled();
      expect(logAuditoriaRepository.create).toHaveBeenCalled();
      expect(result.id).toBe('despesa-1');
    });
  });

  describe('Exclusão de Contas e Categorias (RF-16)', () => {
    it('deve impedir exclusão de conta com movimentações', async () => {
      (contaFinanceiraRepository.hasMovimentacoes as jest.Mock).mockResolvedValue(true);
      await expect(financeiroService.excluirContaFinanceira('conta-1'))
        .rejects.toThrow('Não é possível excluir uma conta que possui movimentações vinculadas (RF-16).');
    });

    it('deve permitir exclusão de conta sem movimentações', async () => {
      (contaFinanceiraRepository.hasMovimentacoes as jest.Mock).mockResolvedValue(false);
      await financeiroService.excluirContaFinanceira('conta-1');
      expect(contaFinanceiraRepository.delete).toHaveBeenCalledWith('conta-1');
    });

    it('deve impedir exclusão de categoria com movimentações', async () => {
      (categoriaFinanceiraRepository.hasMovimentacoes as jest.Mock).mockResolvedValue(true);
      await expect(financeiroService.excluirCategoriaFinanceira('cat-1'))
        .rejects.toThrow('Não é possível excluir uma categoria que possui movimentações vinculadas (RF-16).');
    });

    it('deve permitir exclusão de categoria sem movimentações', async () => {
      (categoriaFinanceiraRepository.hasMovimentacoes as jest.Mock).mockResolvedValue(false);
      await financeiroService.excluirCategoriaFinanceira('cat-1');
      expect(categoriaFinanceiraRepository.delete).toHaveBeenCalledWith('cat-1');
    });
  });

  describe('anonimizarNomeDoador (RN-04)', () => {
    it('deve mascarar o nome corretamente', () => {
      expect(financeiroService.anonimizarNomeDoador('Ana Maria')).toBe('Ana ***');
      expect(financeiroService.anonimizarNomeDoador('João')).toBe('Joã ***');
      expect(financeiroService.anonimizarNomeDoador(null)).toBe('Doador Anônimo');
    });
  });
});
