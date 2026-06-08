export enum PerfilUsuario {
  GESTOR = 'GESTOR',
  VOLUNTARIO = 'VOLUNTARIO',
}

export enum StatusAnimal {
  EM_CUIDADO = 'EM_CUIDADO',
  EM_TRATAMENTO_GRAVE = 'EM_TRATAMENTO_GRAVE',
  PARA_ADOCAO = 'PARA_ADOCAO',
  ADOTADO = 'ADOTADO',
  OBITO = 'OBITO',
}

export enum EspecieAnimal {
  CAO = 'CAO',
  GATO = 'GATO',
  OUTRO = 'OUTRO',
}

export enum SexoAnimal {
  MACHO = 'MACHO',
  FEMEA = 'FEMEA',
}

export enum StatusAprovacao {
  PENDENTE = 'PENDENTE',
  APROVADO = 'APROVADO',
  REJEITADO = 'REJEITADO',
}

export enum StatusFollowUp {
  BEM = 'BEM',
  ATENCAO = 'ATENCAO',
  CRITICO = 'CRITICO',
}

export enum CausaObito {
  DOENCA = 'DOENCA',
  ATROPELAMENTO = 'ATROPELAMENTO',
  OUTRO = 'OUTRO',
}

export enum TipoDoacao {
  DINHEIRO = 'DINHEIRO',
  RACAO = 'RACAO',
  MEDICAMENTO = 'MEDICAMENTO',
  OUTRO = 'OUTRO',
}

export enum MetodoDoacao {
  DEPOSITO = 'DEPOSITO',
  PIX = 'PIX',
  DINHEIRO = 'DINHEIRO',
  ENTREGA_PRESENCIAL = 'ENTREGA_PRESENCIAL',
}

export enum StatusDoacao {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  ESTORNADO = 'ESTORNADO',
}

export enum OrigemDoacao {
  MANUAL = 'MANUAL',
  WEBHOOK = 'WEBHOOK',
}

export enum TipoCategoria {
  DESPESA = 'DESPESA',
  RECEITA = 'RECEITA',
}

export enum StatusConectividade {
  CONECTADO = 'CONECTADO',
  DESCONECTADO = 'DESCONECTADO',
  SEM_SINAL = 'SEM_SINAL',
}

export enum TipoPonto {
  BEBEDOURO = 'BEBEDOURO',
  COMEDOURO = 'COMEDOURO',
}

export enum StatusPonto {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
}

export enum TipoTarefa {
  ALIMENTACAO = 'ALIMENTACAO',
  TROCA_AGUA = 'TROCA_AGUA',
  LIMPEZA = 'LIMPEZA',
  MANUTENCAO = 'MANUTENCAO',
}

export enum TipoOcorrencia {
  ANIMAL_FERIDO = 'ANIMAL_FERIDO',
  ANIMAL_SOFRIMENTO = 'ANIMAL_SOFRIMENTO',
  FALTA_RACAO = 'FALTA_RACAO',
  BEBEDOURO_DANIFICADO = 'BEBEDOURO_DANIFICADO',
  ABANDONO_NOVOS_ANIMAIS = 'ABANDONO_NOVOS_ANIMAIS',
  OUTRO = 'OUTRO',
}

export enum StatusOcorrencia {
  ABERTA = 'ABERTA',
  RESOLVIDA = 'RESOLVIDA',
}

export enum TipoOperacao {
  CRIACAO = 'CRIACAO',
  ALTERACAO = 'ALTERACAO',
  EXCLUSAO = 'EXCLUSAO',
  APROVACAO = 'APROVACAO',
  REJEICAO = 'REJEICAO',
}

export enum TipoNotificacao {
  PENDENCIA_APROVACAO = 'PENDENCIA_APROVACAO',
  OCORRENCIA_CAMPO = 'OCORRENCIA_CAMPO',
  FOLLOWUP_CRITICO = 'FOLLOWUP_CRITICO',
  API_INDISPONIVEL = 'API_INDISPONIVEL',
  FALHA_WEBHOOK = 'FALHA_WEBHOOK',
  APROVACAO_VOLUNTARIO = 'APROVACAO_VOLUNTARIO',
  REJEICAO_VOLUNTARIO = 'REJEICAO_VOLUNTARIO',
}

export enum StatusCampanha {
  ATIVA = 'ATIVA',
  ARQUIVADA = 'ARQUIVADA',
}

export enum StatusNotificacao {
  ENVIADA = 'ENVIADA',
  FALHA = 'FALHA',
  SUPRIMIDA = 'SUPRIMIDA',
}
