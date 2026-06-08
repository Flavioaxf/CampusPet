export * from './interfaces/IUsuarioRepository';
import { UsuarioRepository } from './repositories/UsuarioRepository';
export const usuarioRepository = new UsuarioRepository();

export * from './interfaces/IAnimalRepository';
import { AnimalRepository } from './repositories/AnimalRepository';
export const animalRepository = new AnimalRepository();

export * from './interfaces/IProntuarioRepository';
import { ProntuarioRepository } from './repositories/ProntuarioRepository';
export const prontuarioRepository = new ProntuarioRepository();

export * from './interfaces/IVacinaRepository';
import { VacinaRepository } from './repositories/VacinaRepository';
export const vacinaRepository = new VacinaRepository();

export * from './interfaces/IPesagemRepository';
import { PesagemRepository } from './repositories/PesagemRepository';
export const pesagemRepository = new PesagemRepository();

export * from './interfaces/ITratamentoRepository';
import { TratamentoRepository } from './repositories/TratamentoRepository';
export const tratamentoRepository = new TratamentoRepository();

export * from './interfaces/IStatusCastracaoRepository';
import { StatusCastracaoRepository } from './repositories/StatusCastracaoRepository';
export const statusCastracaoRepository = new StatusCastracaoRepository();

export * from './interfaces/IRegistroObitoRepository';
import { RegistroObitoRepository } from './repositories/RegistroObitoRepository';
export const registroObitoRepository = new RegistroObitoRepository();

export * from './interfaces/IFollowUpPosAdocaoRepository';
import { FollowUpPosAdocaoRepository } from './repositories/FollowUpPosAdocaoRepository';
export const followUpPosAdocaoRepository = new FollowUpPosAdocaoRepository();

export * from './interfaces/IAnexoFollowUpRepository';
import { AnexoFollowUpRepository } from './repositories/AnexoFollowUpRepository';
export const anexoFollowUpRepository = new AnexoFollowUpRepository();

export * from './interfaces/IDespesaRepository';
import { DespesaRepository } from './repositories/DespesaRepository';
export const despesaRepository = new DespesaRepository();

export * from './interfaces/IDoacaoRepository';
import { DoacaoRepository } from './repositories/DoacaoRepository';
export const doacaoRepository = new DoacaoRepository();

export * from './interfaces/IEstornoRepository';
import { EstornoRepository } from './repositories/EstornoRepository';
export const estornoRepository = new EstornoRepository();

export * from './interfaces/IContaFinanceiraRepository';
import { ContaFinanceiraRepository } from './repositories/ContaFinanceiraRepository';
export const contaFinanceiraRepository = new ContaFinanceiraRepository();

export * from './interfaces/ICategoriaFinanceiraRepository';
import { CategoriaFinanceiraRepository } from './repositories/CategoriaFinanceiraRepository';
export const categoriaFinanceiraRepository = new CategoriaFinanceiraRepository();

export * from './interfaces/ISmartTagRepository';
import { SmartTagRepository } from './repositories/SmartTagRepository';
export const smartTagRepository = new SmartTagRepository();

export * from './interfaces/IHistoricoLocalizacaoRepository';
import { HistoricoLocalizacaoRepository } from './repositories/HistoricoLocalizacaoRepository';
export const historicoLocalizacaoRepository = new HistoricoLocalizacaoRepository();

export * from './interfaces/IPontoAlimentacaoRepository';
import { PontoAlimentacaoRepository } from './repositories/PontoAlimentacaoRepository';
export const pontoAlimentacaoRepository = new PontoAlimentacaoRepository();

export * from './interfaces/IVistoriaPontoAlimentacaoRepository';
import { VistoriaPontoAlimentacaoRepository } from './repositories/VistoriaPontoAlimentacaoRepository';
export const vistoriaPontoAlimentacaoRepository = new VistoriaPontoAlimentacaoRepository();

export * from './interfaces/IOcorrenciaRepository';
import { OcorrenciaRepository } from './repositories/OcorrenciaRepository';
export const ocorrenciaRepository = new OcorrenciaRepository();

export * from './interfaces/IAlteracaoPendenteRepository';
import { AlteracaoPendenteRepository } from './repositories/AlteracaoPendenteRepository';
export const alteracaoPendenteRepository = new AlteracaoPendenteRepository();

export * from './interfaces/ILogAuditoriaRepository';
import { LogAuditoriaRepository } from './repositories/LogAuditoriaRepository';
export const logAuditoriaRepository = new LogAuditoriaRepository();

export * from './interfaces/INotificacaoRepository';
import { NotificacaoRepository } from './repositories/NotificacaoRepository';
export const notificacaoRepository = new NotificacaoRepository();

export * from './interfaces/ICampanhaRepository';
import { CampanhaRepository } from './repositories/CampanhaRepository';
export const campanhaRepository = new CampanhaRepository();

export * from './interfaces/ILegislacaoAnimalRepository';
import { LegislacaoAnimalRepository } from './repositories/LegislacaoAnimalRepository';
export const legislacaoAnimalRepository = new LegislacaoAnimalRepository();

export * from './AuthService';
export * from './UserService';
export * from './AnimalService';
export * from './ProntuarioService';
export * from './ApprovalService';
export * from './FinanceiroService';
export * from './PontoAlimentacaoService';

