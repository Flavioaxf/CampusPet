import { pontoAlimentacaoService } from '../PontoAlimentacaoService';
import { 
  pontoAlimentacaoRepository, 
  vistoriaPontoAlimentacaoRepository,
  logAuditoriaRepository
} from '@/services';
import { PerfilUsuario, StatusPonto, TipoPonto, TipoTarefa } from '@/types/enums';
import { Usuario, CreatePontoAlimentacaoDTO, CreateVistoriaPontoAlimentacaoDTO, PontoAlimentacao, VistoriaPontoAlimentacao } from '@/types/domain';

jest.mock('@/services', () => ({
  pontoAlimentacaoRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    findAtivos: jest.fn(),
  },
  vistoriaPontoAlimentacaoRepository: {
    create: jest.fn(),
    findUltimaVistoria: jest.fn(),
  },
  logAuditoriaRepository: {
    create: jest.fn(),
  },
}));

describe('PontoAlimentacaoService', () => {
  const mockUsuario: Usuario = {
    id: 'user-1',
    nome: 'Usuario Teste',
    email: 'test@test.com',
    perfil: PerfilUsuario.GESTOR,
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

  describe('cadastrarPonto (UC-13)', () => {
    it('deve cadastrar um ponto e registrar no log', async () => {
      const dados: CreatePontoAlimentacaoDTO = { nome: 'Ponto A', tipo: TipoPonto.COMEDOURO, latitude: 0, longitude: 0, status: StatusPonto.ATIVO };
      (pontoAlimentacaoRepository.create as jest.Mock).mockResolvedValue({ id: 'p1', ...dados } as PontoAlimentacao);

      const result = await pontoAlimentacaoService.cadastrarPonto(dados, mockUsuario);

      expect(pontoAlimentacaoRepository.create).toHaveBeenCalledWith(dados);
      expect(logAuditoriaRepository.create).toHaveBeenCalled();
      expect(result.id).toBe('p1');
    });
  });

  describe('registrarVistoria (UC-19)', () => {
    it('deve registrar uma vistoria com sucesso', async () => {
      const dados: CreateVistoriaPontoAlimentacaoDTO = { 
        pontoId: 'p1', 
        tipoTarefa: TipoTarefa.ALIMENTACAO, 
        observacoes: 'Ok',
        voluntarioId: 'user-1'
      };
      (pontoAlimentacaoRepository.findById as jest.Mock).mockResolvedValue({ id: 'p1', status: StatusPonto.ATIVO } as PontoAlimentacao);
      (vistoriaPontoAlimentacaoRepository.create as jest.Mock).mockResolvedValue({ id: 'v1', ...dados, voluntarioId: 'user-1', dataHora: new Date() } as VistoriaPontoAlimentacao);

      const result = await pontoAlimentacaoService.registrarVistoria(dados, mockUsuario);

      expect(vistoriaPontoAlimentacaoRepository.create).toHaveBeenCalled();
      expect(logAuditoriaRepository.create).toHaveBeenCalled();
      expect(result.id).toBe('v1');
    });

    it('deve lançar erro se o ponto não existir', async () => {
      (pontoAlimentacaoRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(pontoAlimentacaoService.registrarVistoria({ pontoId: 'invalid', tipoTarefa: TipoTarefa.LIMPEZA } as CreateVistoriaPontoAlimentacaoDTO, mockUsuario))
        .rejects.toThrow('Ponto de alimentação não encontrado.');
    });
  });

  describe('GEO-010 — Alerta de 24h', () => {
    it('deve retornar true se o ponto nunca foi vistoriado', async () => {
      (pontoAlimentacaoRepository.findById as jest.Mock).mockResolvedValue({ id: 'p1', status: StatusPonto.ATIVO } as PontoAlimentacao);
      (vistoriaPontoAlimentacaoRepository.findUltimaVistoria as jest.Mock).mockResolvedValue(null);

      const alert = await pontoAlimentacaoService.isPontoEmAlerta('p1');
      expect(alert).toBe(true);
    });

    it('deve retornar true se a última vistoria foi há mais de 24h', async () => {
      const ontem = new Date(Date.now() - 25 * 60 * 60 * 1000);
      (pontoAlimentacaoRepository.findById as jest.Mock).mockResolvedValue({ id: 'p1', status: StatusPonto.ATIVO } as PontoAlimentacao);
      (vistoriaPontoAlimentacaoRepository.findUltimaVistoria as jest.Mock).mockResolvedValue({ dataHora: ontem } as VistoriaPontoAlimentacao);

      const alert = await pontoAlimentacaoService.isPontoEmAlerta('p1');
      expect(alert).toBe(true);
    });

    it('deve retornar false se a última vistoria foi recente', async () => {
      const agora = new Date();
      (pontoAlimentacaoRepository.findById as jest.Mock).mockResolvedValue({ id: 'p1', status: StatusPonto.ATIVO } as PontoAlimentacao);
      (vistoriaPontoAlimentacaoRepository.findUltimaVistoria as jest.Mock).mockResolvedValue({ dataHora: agora } as VistoriaPontoAlimentacao);

      const alert = await pontoAlimentacaoService.isPontoEmAlerta('p1');
      expect(alert).toBe(false);
    });

    it('deve retornar false se o ponto estiver INATIVO', async () => {
      (pontoAlimentacaoRepository.findById as jest.Mock).mockResolvedValue({ id: 'p1', status: StatusPonto.INATIVO } as PontoAlimentacao);
      const alert = await pontoAlimentacaoService.isPontoEmAlerta('p1');
      expect(alert).toBe(false);
    });
  });

  describe('listarPontosComAlerta', () => {
    it('deve listar pontos com flag emAlerta', async () => {
      const ponto = { id: 'p1', status: StatusPonto.ATIVO } as PontoAlimentacao;
      (pontoAlimentacaoRepository.findAtivos as jest.Mock).mockResolvedValue([ponto]);
      (pontoAlimentacaoRepository.findById as jest.Mock).mockResolvedValue(ponto);
      (vistoriaPontoAlimentacaoRepository.findUltimaVistoria as jest.Mock).mockResolvedValue(null); // Alerta

      const result = await pontoAlimentacaoService.listarPontosComAlerta();

      expect(result).toHaveLength(1);
      expect(result[0].emAlerta).toBe(true);
    });
  });
});
