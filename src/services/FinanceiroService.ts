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
  Doacao, 
  Despesa, 
  Estorno, 
  Usuario,
  CreateDoacaoDTO,
  CreateDespesaDTO,
  StatusDoacao,
  StatusAprovacao,
  PerfilUsuario,
  TipoOperacao,
  OrigemDoacao,
  AlteracaoPendente
} from '@/types/domain';

export class FinanceiroService {
  /**
   * UC-15 — Registrar Doação Manual
   * RN-01: Se Voluntário, entra como Pendente (via AlteracaoPendente).
   * Se Gestor, entra como Confirmado diretamente.
   */
  async registrarDoacaoManual(dados: CreateDoacaoDTO, usuario: Usuario): Promise<Doacao | AlteracaoPendente> {
    if (usuario.perfil === PerfilUsuario.GESTOR) {
      const doacao = await doacaoRepository.create({
        ...dados,
        status: StatusDoacao.CONFIRMADO,
        origem: OrigemDoacao.MANUAL,
        registradoPorId: usuario.id
      });

      await logAuditoriaRepository.create({
        entidade: 'Doacao',
        entidadeId: doacao.id,
        operacao: TipoOperacao.CRIACAO,
        dadosAnteriores: null,
        dadosNovos: JSON.stringify(doacao),
        realizadoPorId: usuario.id
      });

      return doacao;
    } else {
      const alteracao = await alteracaoPendenteRepository.create({
        entidade: 'Doacao',
        entidadeId: 'NEW',
        dadosAnteriores: null,
        dadosProposto: JSON.stringify({
          ...dados,
          status: StatusDoacao.PENDENTE,
          origem: OrigemDoacao.MANUAL,
          registradoPorId: usuario.id
        }),
        submetidoPorId: usuario.id,
        status: StatusAprovacao.PENDENTE
      });

      return alteracao;
    }
  }

  /**
   * UC-17 — Estornar Doação
   * RN-02: Justificativa obrigatória (mín. 10 chars), cria Estorno, atualiza Doacao.
   */
  async estornarDoacao(doacaoId: string, justificativa: string, gestor: Usuario): Promise<Estorno> {
    if (gestor.perfil !== PerfilUsuario.GESTOR) {
      throw new Error('Apenas gestores podem realizar estornos.');
    }

    if (justificativa.trim().length < 10) {
      throw new Error('A justificativa de estorno deve ter pelo menos 10 caracteres (RN-02).');
    }

    const doacao = await doacaoRepository.findById(doacaoId);
    if (!doacao) {
      throw new Error('Doação não encontrada.');
    }

    if (doacao.status === StatusDoacao.ESTORNADO) {
      throw new Error('Esta doação já foi estornada.');
    }

    // Update Doacao status
    const doacaoAtualizada = await doacaoRepository.update(doacaoId, {
      status: StatusDoacao.ESTORNADO
    });

    // Create Estorno record
    const estorno = await estornoRepository.create({
      doacaoId,
      justificativa: justificativa.trim(),
      realizadoPorId: gestor.id
    });

    await logAuditoriaRepository.create({
      entidade: 'Doacao',
      entidadeId: doacaoId,
      operacao: TipoOperacao.ALTERACAO,
      dadosAnteriores: JSON.stringify(doacao),
      dadosNovos: JSON.stringify(doacaoAtualizada),
      realizadoPorId: gestor.id
    });

    await logAuditoriaRepository.create({
      entidade: 'Estorno',
      entidadeId: estorno.id,
      operacao: TipoOperacao.CRIACAO,
      dadosAnteriores: null,
      dadosNovos: JSON.stringify(estorno),
      realizadoPorId: gestor.id
    });

    return estorno;
  }

  /**
   * UC-07 — Registrar Despesa
   */
  async registrarDespesa(dados: CreateDespesaDTO, usuario: Usuario): Promise<Despesa> {
    const despesa = await despesaRepository.create({
      ...dados,
      registradoPorId: usuario.id
    });

    await logAuditoriaRepository.create({
      entidade: 'Despesa',
      entidadeId: despesa.id,
      operacao: TipoOperacao.CRIACAO,
      dadosAnteriores: null,
      dadosNovos: JSON.stringify(despesa),
      realizadoPorId: usuario.id
    });

    return despesa;
  }

  /**
   * RF-16: Excluir Conta Financeira (bloqueado se houver movimentações)
   */
  async excluirContaFinanceira(id: string): Promise<void> {
    const hasMov = await contaFinanceiraRepository.hasMovimentacoes(id);
    if (hasMov) {
      throw new Error('Não é possível excluir uma conta que possui movimentações vinculadas (RF-16).');
    }
    await contaFinanceiraRepository.delete(id);
  }

  /**
   * RF-16: Excluir Categoria Financeira (bloqueado se houver movimentações)
   */
  async excluirCategoriaFinanceira(id: string): Promise<void> {
    const hasMov = await categoriaFinanceiraRepository.hasMovimentacoes(id);
    if (hasMov) {
      throw new Error('Não é possível excluir uma categoria que possui movimentações vinculadas (RF-16).');
    }
    await categoriaFinanceiraRepository.delete(id);
  }

  /**
   * RN-04: Anonimização de doadores para o Portal Público.
   */
  anonimizarNomeDoador(nome: string | null): string {
    if (!nome) return 'Doador Anônimo';
    const partes = nome.trim().split(' ');
    const primeiroNome = partes[0];
    const prefixo = primeiroNome.substring(0, 3);
    return `${prefixo} ***`;
  }
}

export const financeiroService = new FinanceiroService();
