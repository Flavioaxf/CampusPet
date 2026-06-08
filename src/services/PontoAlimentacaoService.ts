import { 
  pontoAlimentacaoRepository, 
  vistoriaPontoAlimentacaoRepository,
  logAuditoriaRepository
} from '@/services';
import { 
  PontoAlimentacao, 
  VistoriaPontoAlimentacao,
  CreatePontoAlimentacaoDTO,
  CreateVistoriaPontoAlimentacaoDTO,
  Usuario,
  TipoOperacao
} from '@/types/domain';
import { StatusPonto } from '@/types/enums';

export class PontoAlimentacaoService {
  /**
   * UC-13 — Cadastrar Ponto de Alimentação
   */
  async cadastrarPonto(dados: CreatePontoAlimentacaoDTO, usuario: Usuario): Promise<PontoAlimentacao> {
    const ponto = await pontoAlimentacaoRepository.create(dados);

    await logAuditoriaRepository.create({
      entidade: 'PontoAlimentacao',
      entidadeId: ponto.id,
      operacao: TipoOperacao.CRIACAO,
      dadosAnteriores: null,
      dadosNovos: JSON.stringify(ponto),
      realizadoPorId: usuario.id
    });

    return ponto;
  }

  /**
   * UC-13 — Atualizar Ponto de Alimentação
   */
  async atualizarPonto(id: string, dados: Partial<PontoAlimentacao>, usuario: Usuario): Promise<PontoAlimentacao> {
    const atual = await pontoAlimentacaoRepository.findById(id);
    if (!atual) throw new Error('Ponto de alimentação não encontrado.');

    const ponto = await pontoAlimentacaoRepository.update(id, dados);

    await logAuditoriaRepository.create({
      entidade: 'PontoAlimentacao',
      entidadeId: ponto.id,
      operacao: TipoOperacao.ALTERACAO,
      dadosAnteriores: JSON.stringify(atual),
      dadosNovos: JSON.stringify(ponto),
      realizadoPorId: usuario.id
    });

    return ponto;
  }

  /**
   * UC-19 — Registrar Vistoria
   */
  async registrarVistoria(dados: CreateVistoriaPontoAlimentacaoDTO, usuario: Usuario): Promise<VistoriaPontoAlimentacao> {
    const ponto = await pontoAlimentacaoRepository.findById(dados.pontoId);
    if (!ponto) throw new Error('Ponto de alimentação não encontrado.');

    const vistoria = await vistoriaPontoAlimentacaoRepository.create({
      ...dados,
      voluntarioId: usuario.id
    });

    await logAuditoriaRepository.create({
      entidade: 'VistoriaPontoAlimentacao',
      entidadeId: vistoria.id,
      operacao: TipoOperacao.CRIACAO,
      dadosAnteriores: null,
      dadosNovos: JSON.stringify(vistoria),
      realizadoPorId: usuario.id
    });

    return vistoria;
  }

  /**
   * GEO-010 — Verificar se ponto ativo está sem vistoria há mais de 24h
   */
  async isPontoEmAlerta(pontoId: string): Promise<boolean> {
    const ponto = await pontoAlimentacaoRepository.findById(pontoId);
    if (!ponto || ponto.status !== StatusPonto.ATIVO) return false;

    const ultimaVistoria = await vistoriaPontoAlimentacaoRepository.findUltimaVistoria(pontoId);
    if (!ultimaVistoria) return true; // Nunca vistoriado = Alerta

    const vinteQuatroHorasAtras = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return ultimaVistoria.dataHora < vinteQuatroHorasAtras;
  }

  /**
   * Lista todos os pontos ativos com seu estado de alerta
   */
  async listarPontosComAlerta(): Promise<(PontoAlimentacao & { emAlerta: boolean })[]> {
    const pontosAtivos = await pontoAlimentacaoRepository.findAtivos();
    
    const promessas = pontosAtivos.map(async (ponto) => {
      const emAlerta = await this.isPontoEmAlerta(ponto.id);
      return { ...ponto, emAlerta };
    });

    return Promise.all(promessas);
  }
}

export const pontoAlimentacaoService = new PontoAlimentacaoService();
