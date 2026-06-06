import {
  PerfilUsuario, StatusAnimal, EspecieAnimal, SexoAnimal, StatusAprovacao,
  StatusFollowUp, CausaObito, TipoDoacao, MetodoDoacao, StatusDoacao, OrigemDoacao,
  TipoCategoria, StatusConectividade, TipoPonto, StatusPonto, TipoTarefa,
  TipoOcorrencia, StatusOcorrencia, TipoOperacao, TipoNotificacao, StatusCampanha,
  StatusNotificacao
} from './enums';

export {
  PerfilUsuario, StatusAnimal, EspecieAnimal, SexoAnimal, StatusAprovacao,
  StatusFollowUp, CausaObito, TipoDoacao, MetodoDoacao, StatusDoacao, OrigemDoacao,
  TipoCategoria, StatusConectividade, TipoPonto, StatusPonto, TipoTarefa,
  TipoOcorrencia, StatusOcorrencia, TipoOperacao, TipoNotificacao, StatusCampanha,
  StatusNotificacao
};

// --- Identidade e Autenticação ---
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senhaHash?: string; // Privado, mas existe na modelagem
  ativo: boolean;
  perfil: PerfilUsuario;
  criadoEm: Date;
  ultimoLogin: Date | null;
  tentativasFalhas: number;
  bloqueadoAte: Date | null;
  resetToken: string | null;
  resetExpires: Date | null;
  conviteToken?: string | null;
  conviteExpires?: Date | null;
}

export interface Gestor extends Usuario {
  notificacoesAtivas: TipoNotificacao[];
}

export type Voluntario = Usuario;

export type CreateUsuarioDTO = Omit<Usuario, 'id' | 'criadoEm' | 'ultimoLogin'>;

// --- Animal e Prontuário ---
export interface Animal {
  id: string;
  nome: string;
  especie: EspecieAnimal;
  pelagem: string;
  sexo: SexoAnimal;
  idadeEstimada: string;
  status: StatusAnimal;
  aptoParaAdocao: boolean;
  fotoUrl: string;
  criadoEm: Date;
}
export type CreateAnimalDTO = Omit<Animal, 'id' | 'criadoEm'>;

export interface Prontuario {
  id: string;
  animalId: string;
  observacoes: string | null;
}
export type CreateProntuarioDTO = Omit<Prontuario, 'id'>;

export interface Vacina {
  id: string;
  prontuarioId: string;
  nome: string;
  dataAplicacao: Date;
  proximaDose: Date | null;
}
export type CreateVacinaDTO = Omit<Vacina, 'id'>;

export interface Pesagem {
  id: string;
  prontuarioId: string;
  data: Date;
  pesoKg: number;
}
export type CreatePesagemDTO = Omit<Pesagem, 'id'>;

export interface Tratamento {
  id: string;
  prontuarioId: string;
  descricao: string;
  dataInicio: Date;
  fimEstimado: Date | null;
  medicacoes: string | null;
}
export type CreateTratamentoDTO = Omit<Tratamento, 'id'>;

export interface StatusCastracao {
  id: string;
  prontuarioId: string;
  castrado: boolean;
  situacao: StatusAprovacao;
  dataAlteracao: Date;
}
export type CreateStatusCastracaoDTO = Omit<StatusCastracao, 'id' | 'dataAlteracao'>;

export interface RegistroObito {
  id: string;
  prontuarioId: string;
  dataObito: Date;
  causa: CausaObito;
  observacoes: string | null;
  registradoPorId: string;
  registradoEm: Date;
}
export type CreateRegistroObitoDTO = Omit<RegistroObito, 'id' | 'registradoEm'>;

export interface FollowUpPosAdocao {
  id: string;
  prontuarioId: string;
  data: Date;
  texto: string;
  statusFollowUp: StatusFollowUp;
  registradoPorId: string;
  registradoEm: Date;
}
export type CreateFollowUpPosAdocaoDTO = Omit<FollowUpPosAdocao, 'id' | 'registradoEm'>;

export interface AnexoFollowUp {
  id: string;
  followUpId: string;
  nomeArquivo: string;
  url: string;
  tamanhoBytes: number;
  tipoMime: string;
}
export type CreateAnexoFollowUpDTO = Omit<AnexoFollowUp, 'id'>;

// --- Financeiro ---
export interface Despesa {
  id: string;
  prontuarioId: string;
  contaId: string;
  categoriaId: string;
  valor: number;
  data: Date;
  descricao: string;
  registradoPorId: string;
  registradoEm: Date;
}
export type CreateDespesaDTO = Omit<Despesa, 'id' | 'registradoEm'>;

export interface Doacao {
  id: string;
  transactionId: string | null;
  tipo: TipoDoacao;
  valor: number;
  data: Date;
  nomeDoador: string | null;
  metodo: MetodoDoacao;
  status: StatusDoacao;
  origem: OrigemDoacao;
  contaId: string;
  categoriaId: string;
  registradoPorId: string | null;
  registradoEm: Date;
}
export type CreateDoacaoDTO = Omit<Doacao, 'id' | 'registradoEm'>;

export interface Estorno {
  id: string;
  doacaoId: string;
  justificativa: string;
  realizadoPorId: string;
  realizadoEm: Date;
}
export type CreateEstornoDTO = Omit<Estorno, 'id' | 'realizadoEm'>;

export interface ContaFinanceira {
  id: string;
  nome: string;
  tipo: string;
  ativo: boolean;
}
export type CreateContaFinanceiraDTO = Omit<ContaFinanceira, 'id'>;

export interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: TipoCategoria;
}
export type CreateCategoriaFinanceiraDTO = Omit<CategoriaFinanceira, 'id'>;

// --- Rastreamento e Geolocalização ---
export interface SmartTag {
  id: string;
  macSerial: string;
  animalId: string | null;
  status: StatusConectividade;
  pareadoEm: Date | null;
  pareadoPorId: string | null;
}
export type CreateSmartTagDTO = Omit<SmartTag, 'id' | 'pareadoEm' | 'pareadoPorId'>;

export interface HistoricoLocalizacao {
  id: string;
  smartTagId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
}
export type CreateHistoricoLocalizacaoDTO = Omit<HistoricoLocalizacao, 'id'>;

export interface PontoAlimentacao {
  id: string;
  nome: string;
  tipo: TipoPonto;
  latitude: number;
  longitude: number;
  status: StatusPonto;
}
export type CreatePontoAlimentacaoDTO = Omit<PontoAlimentacao, 'id'>;

export interface VistoriaPontoAlimentacao {
  id: string;
  pontoId: string;
  voluntarioId: string;
  tipoTarefa: TipoTarefa;
  dataHora: Date;
  observacoes: string | null;
}
export type CreateVistoriaPontoAlimentacaoDTO = Omit<VistoriaPontoAlimentacao, 'id' | 'dataHora'>;

// --- Operação em Campo ---
export interface Ocorrencia {
  id: string;
  tipo: TipoOcorrencia;
  pontoId: string | null;
  latitude: number | null;
  longitude: number | null;
  observacoes: string | null;
  status: StatusOcorrencia;
  registradaPorId: string;
  registradaEm: Date;
  resolucao: string | null;
  resolvidaEm: Date | null;
}
export type CreateOcorrenciaDTO = Omit<Ocorrencia, 'id' | 'registradaEm' | 'resolvidaEm'>;

// --- Governança e Auditoria ---
export interface AlteracaoPendente {
  id: string;
  entidade: string;
  entidadeId: string;
  dadosAnteriores: string | null;
  dadosProposto: string;
  submetidoPorId: string;
  submetidoEm: Date;
  status: StatusAprovacao;
  revisadoPorId: string | null;
  revisadoEm: Date | null;
  justificativaRejeicao: string | null;
}
export type CreateAlteracaoPendenteDTO = Omit<AlteracaoPendente, 'id' | 'submetidoEm' | 'revisadoEm' | 'revisadoPorId' | 'justificativaRejeicao'>;

export interface LogAuditoria {
  id: string;
  entidade: string;
  entidadeId: string;
  operacao: TipoOperacao;
  dadosAnteriores: string | null;
  dadosNovos: string | null;
  realizadoPorId: string;
  realizadoEm: Date;
}
export type CreateLogAuditoriaDTO = Omit<LogAuditoria, 'id' | 'realizadoEm'>;

export interface Notificacao {
  id: string;
  tipo: TipoNotificacao;
  destinatarioId: string;
  assunto: string;
  mensagem: string;
  enviadaEm: Date;
  status: StatusNotificacao;
}
export type CreateNotificacaoDTO = Omit<Notificacao, 'id' | 'enviadaEm'>;

// --- Portal Público ---
export interface Campanha {
  id: string;
  titulo: string;
  texto: string;
  imagemUrl: string | null;
  linkDoacao: string | null;
  dataInicio: Date;
  dataFim: Date | null;
  status: StatusCampanha;
  criadoPorId: string;
}
export type CreateCampanhaDTO = Omit<Campanha, 'id'>;

export interface LegislacaoAnimal {
  id: string;
  titulo: string;
  numero: string;
  resumo: string;
  linkTextoCompleto: string;
  dataInclusao: Date;
  criadoPorId: string;
}
export type CreateLegislacaoAnimalDTO = Omit<LegislacaoAnimal, 'id' | 'dataInclusao'>;
