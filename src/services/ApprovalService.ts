import { 
  alteracaoPendenteRepository, 
  animalRepository, 
  statusCastracaoRepository,
  logAuditoriaRepository,
  notificacaoRepository
} from '@/services';
import { 
  Usuario, 
  StatusAprovacao, 
  TipoOperacao,
  TipoNotificacao,
  StatusNotificacao,
  PerfilUsuario
} from '@/types/domain';

export class ApprovalService {
  /**
   * Approves a pending change.
   * Applying the proposed data to the original entity.
   */
  async aprovarAlteracao(id: string, gestor: Usuario): Promise<void> {
    if (gestor.perfil !== PerfilUsuario.GESTOR) {
      throw new Error('Apenas gestores podem aprovar alterações.');
    }

    const alteracao = await alteracaoPendenteRepository.findById(id);
    if (!alteracao) {
      throw new Error('Alteração pendente não encontrada.');
    }

    if (alteracao.status !== StatusAprovacao.PENDENTE) {
      throw new Error('Esta alteração já foi processada.');
    }

    const dadosProposto = JSON.parse(alteracao.dadosProposto);

    // Apply the change based on the entity type
    switch (alteracao.entidade) {
      case 'Animal':
        if (alteracao.entidadeId === 'NEW') {
          const animal = await animalRepository.create(dadosProposto);
          await logAuditoriaRepository.create({
            entidade: 'Animal',
            entidadeId: animal.id,
            operacao: TipoOperacao.APROVACAO,
            dadosAnteriores: null,
            dadosNovos: JSON.stringify(animal),
            realizadoPorId: gestor.id
          });
        } else {
          const animalAtualizado = await animalRepository.update(alteracao.entidadeId, dadosProposto);
          await logAuditoriaRepository.create({
            entidade: 'Animal',
            entidadeId: alteracao.entidadeId,
            operacao: TipoOperacao.APROVACAO,
            dadosAnteriores: alteracao.dadosAnteriores,
            dadosNovos: JSON.stringify(animalAtualizado),
            realizadoPorId: gestor.id
          });
        }
        break;

      case 'StatusCastracao':
        const status = await statusCastracaoRepository.create({
          ...dadosProposto,
          situacao: StatusAprovacao.APROVADO
        });
        await logAuditoriaRepository.create({
          entidade: 'StatusCastracao',
          entidadeId: status.id,
          operacao: TipoOperacao.APROVACAO,
          dadosAnteriores: null,
          dadosNovos: JSON.stringify(status),
          realizadoPorId: gestor.id
        });
        break;

      default:
        throw new Error(`Entidade ${alteracao.entidade} não suportada para aprovação automática.`);
    }

    // Update AlteracaoPendente status
    await alteracaoPendenteRepository.update(id, {
      status: StatusAprovacao.APROVADO,
      revisadoPorId: gestor.id,
      revisadoEm: new Date()
    });

    // Notify the volunteer (RF-21)
    await notificacaoRepository.create({
      tipo: TipoNotificacao.APROVACAO_VOLUNTARIO,
      destinatarioId: alteracao.submetidoPorId,
      assunto: 'Alteração Aprovada',
      mensagem: `Sua alteração para a entidade ${alteracao.entidade} foi aprovada pelo gestor.`,
      status: StatusNotificacao.ENVIADA
    });
  }

  /**
   * Rejects a pending change.
   * RN-01: Justification is mandatory (min 10 chars).
   */
  async rejeitarAlteracao(id: string, justificativa: string, gestor: Usuario): Promise<void> {
    if (gestor.perfil !== PerfilUsuario.GESTOR) {
      throw new Error('Apenas gestores podem rejeitar alterações.');
    }

    if (justificativa.length < 10) {
      throw new Error('A justificativa de rejeição deve ter pelo menos 10 caracteres (RN-01).');
    }

    const alteracao = await alteracaoPendenteRepository.findById(id);
    if (!alteracao) {
      throw new Error('Alteração pendente não encontrada.');
    }

    if (alteracao.status !== StatusAprovacao.PENDENTE) {
      throw new Error('Esta alteração já foi processada.');
    }

    await alteracaoPendenteRepository.update(id, {
      status: StatusAprovacao.REJEITADO,
      revisadoPorId: gestor.id,
      revisadoEm: new Date(),
      justificativaRejeicao: justificativa
    });

    await logAuditoriaRepository.create({
      entidade: 'AlteracaoPendente',
      entidadeId: id,
      operacao: TipoOperacao.REJEICAO,
      dadosAnteriores: alteracao.dadosProposto,
      dadosNovos: JSON.stringify({ status: StatusAprovacao.REJEITADO, justificativa }),
      realizadoPorId: gestor.id
    });

    // Notify the volunteer (RF-21)
    await notificacaoRepository.create({
      tipo: TipoNotificacao.REJEICAO_VOLUNTARIO,
      destinatarioId: alteracao.submetidoPorId,
      assunto: 'Alteração Rejeitada',
      mensagem: `Sua alteração para a entidade ${alteracao.entidade} foi rejeitada. Justificativa: ${justificativa}`,
      status: StatusNotificacao.ENVIADA
    });
  }
}

export const approvalService = new ApprovalService();
