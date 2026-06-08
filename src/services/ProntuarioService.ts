import { 
  prontuarioRepository, 
  vacinaRepository, 
  pesagemRepository, 
  tratamentoRepository, 
  statusCastracaoRepository, 
  registroObitoRepository, 
  animalRepository, 
  logAuditoriaRepository,
  alteracaoPendenteRepository,
  notificacaoRepository,
  followUpPosAdocaoRepository
} from '@/services';
import { 
  Vacina, 
  CreateVacinaDTO, 
  Pesagem, 
  CreatePesagemDTO, 
  Tratamento, 
  CreateTratamentoDTO, 
  StatusCastracao, 
  CreateStatusCastracaoDTO, 
  RegistroObito, 
  CreateRegistroObitoDTO, 
  Usuario, 
  StatusAprovacao, 
  StatusAnimal, 
  TipoOperacao,
  AlteracaoPendente,
  FollowUpPosAdocao,
  CreateFollowUpPosAdocaoDTO,
  StatusFollowUp,
  TipoNotificacao,
  StatusNotificacao,
  PerfilUsuario
} from '@/types/domain';

export class ProntuarioService {
  /**
   * Registers a vaccine in the animal's medical record.
   */
  async registrarVacina(dados: CreateVacinaDTO, usuario: Usuario): Promise<Vacina> {
    const vacina = await vacinaRepository.create(dados);
    
    await logAuditoriaRepository.create({
      entidade: 'Vacina',
      entidadeId: vacina.id,
      operacao: TipoOperacao.CRIACAO,
      dadosAnteriores: null,
      dadosNovos: JSON.stringify(vacina),
      realizadoPorId: usuario.id
    });

    return vacina;
  }

  /**
   * Registers a weighing in the animal's medical record.
   */
  async registrarPesagem(dados: CreatePesagemDTO, usuario: Usuario): Promise<Pesagem> {
    const pesagem = await pesagemRepository.create(dados);

    await logAuditoriaRepository.create({
      entidade: 'Pesagem',
      entidadeId: pesagem.id,
      operacao: TipoOperacao.CRIACAO,
      dadosAnteriores: null,
      dadosNovos: JSON.stringify(pesagem),
      realizadoPorId: usuario.id
    });

    return pesagem;
  }

  /**
   * Registers a treatment in the animal's medical record.
   */
  async registrarTratamento(dados: CreateTratamentoDTO, usuario: Usuario): Promise<Tratamento> {
    const tratamento = await tratamentoRepository.create(dados);

    await logAuditoriaRepository.create({
      entidade: 'Tratamento',
      entidadeId: tratamento.id,
      operacao: TipoOperacao.CRIACAO,
      dadosAnteriores: null,
      dadosNovos: JSON.stringify(tratamento),
      realizadoPorId: usuario.id
    });

    return tratamento;
  }

  /**
   * Updates castration status.
   * RN-01: Needs approval if changed by a Volunteer.
   */
  async atualizarStatusCastracao(dados: CreateStatusCastracaoDTO, usuario: Usuario): Promise<StatusCastracao | AlteracaoPendente> {
    if (usuario.perfil === PerfilUsuario.GESTOR) {
      const status = await statusCastracaoRepository.create({
        ...dados,
        situacao: StatusAprovacao.APROVADO
      });

      await logAuditoriaRepository.create({
        entidade: 'StatusCastracao',
        entidadeId: status.id,
        operacao: TipoOperacao.CRIACAO,
        dadosAnteriores: null,
        dadosNovos: JSON.stringify(status),
        realizadoPorId: usuario.id
      });

      return status;
    } else {
      return await alteracaoPendenteRepository.create({
        entidade: 'StatusCastracao',
        entidadeId: 'NEW',
        dadosAnteriores: null,
        dadosProposto: JSON.stringify(dados),
        submetidoPorId: usuario.id,
        status: StatusAprovacao.PENDENTE
      });
    }
  }

  /**
   * Registers death of an animal (RN-06).
   * This is irreversible and changes the animal status.
   */
  async registrarObito(dados: CreateRegistroObitoDTO, usuario: Usuario): Promise<RegistroObito> {
    const prontuario = await prontuarioRepository.findById(dados.prontuarioId);
    if (!prontuario) {
      throw new Error('Prontuário não encontrado.');
    }

    const animal = await animalRepository.findById(prontuario.animalId);
    if (!animal) {
      throw new Error('Animal não encontrado.');
    }

    if (animal.status === StatusAnimal.OBITO) {
      throw new Error('O óbito deste animal já foi registrado.');
    }

    // Register death record (Imutable repository - only create)
    const obito = await registroObitoRepository.create(dados);

    // Update animal status to OBITO
    await animalRepository.update(animal.id, { status: StatusAnimal.OBITO });

    await logAuditoriaRepository.create({
      entidade: 'RegistroObito',
      entidadeId: obito.id,
      operacao: TipoOperacao.CRIACAO,
      dadosAnteriores: null,
      dadosNovos: JSON.stringify(obito),
      realizadoPorId: usuario.id
    });

    return obito;
  }

  /**
   * Registers a post-adoption follow-up.
   * If status is CRITICAL, triggers a notification (RF-21).
   */
  async registrarFollowUp(dados: CreateFollowUpPosAdocaoDTO, usuario: Usuario): Promise<FollowUpPosAdocao> {
    const followUp = await followUpPosAdocaoRepository.create(dados);

    await logAuditoriaRepository.create({
      entidade: 'FollowUpPosAdocao',
      entidadeId: followUp.id,
      operacao: TipoOperacao.CRIACAO,
      dadosAnteriores: null,
      dadosNovos: JSON.stringify(followUp),
      realizadoPorId: usuario.id
    });

    if (dados.statusFollowUp === StatusFollowUp.CRITICO) {
      // Find managers to notify
      // Simplified: create a notification record
      await notificacaoRepository.create({
        tipo: TipoNotificacao.FOLLOWUP_CRITICO,
        destinatarioId: 'GESTOR_ALL', // Logic to be refined
        assunto: 'ALERTA: Follow-up CRÍTICO registrado',
        mensagem: `O animal vinculado ao prontuário ${dados.prontuarioId} recebeu um follow-up com status CRÍTICO.`,
        status: StatusNotificacao.ENVIADA
      });
    }

    return followUp;
  }
}

export const prontuarioService = new ProntuarioService();
