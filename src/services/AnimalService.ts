import { animalRepository, alteracaoPendenteRepository, logAuditoriaRepository } from '@/services';
import { 
  Animal, 
  CreateAnimalDTO, 
  Usuario, 
  AlteracaoPendente,
  StatusAprovacao,
  StatusAnimal,
  TipoOperacao,
  PerfilUsuario
} from '@/types/domain';

export class AnimalService {
  /**
   * Registers a new animal.
   * If the user is a Volunteer, it creates a pending change.
   * If the user is a Manager, it creates the animal directly.
   */
  async cadastrarAnimal(dados: CreateAnimalDTO, usuario: Usuario): Promise<Animal | AlteracaoPendente> {
    if (usuario.perfil === PerfilUsuario.GESTOR) {
      const animal = await animalRepository.create(dados);
      
      await logAuditoriaRepository.create({
        entidade: 'Animal',
        entidadeId: animal.id,
        operacao: TipoOperacao.CRIACAO,
        dadosAnteriores: null,
        dadosNovos: JSON.stringify(animal),
        realizadoPorId: usuario.id
      });

      return animal;
    } else {
      const alteracao = await alteracaoPendenteRepository.create({
        entidade: 'Animal',
        entidadeId: 'NEW', // Indicator for new record
        dadosAnteriores: null,
        dadosProposto: JSON.stringify(dados),
        submetidoPorId: usuario.id,
        status: StatusAprovacao.PENDENTE
      });

      return alteracao;
    }
  }

  /**
   * Updates an animal.
   * If the user is a Volunteer, it creates a pending change for critical fields.
   * Critical fields: nome, especie, fotoUrl, status, aptoParaAdocao (RN-01).
   */
  async atualizarAnimal(id: string, dados: Partial<Animal>, usuario: Usuario): Promise<Animal | AlteracaoPendente> {
    const animalAtual = await animalRepository.findById(id);
    if (!animalAtual) {
      throw new Error('Animal não encontrado.');
    }

    if (animalAtual.status === StatusAnimal.OBITO) {
      throw new Error('Não é possível alterar dados de um animal que veio a óbito (RN-06).');
    }

    if (usuario.perfil === PerfilUsuario.GESTOR) {
      const animalAtualizado = await animalRepository.update(id, dados);

      await logAuditoriaRepository.create({
        entidade: 'Animal',
        entidadeId: id,
        operacao: TipoOperacao.ALTERACAO,
        dadosAnteriores: JSON.stringify(animalAtual),
        dadosNovos: JSON.stringify(animalAtualizado),
        realizadoPorId: usuario.id
      });

      return animalAtualizado;
    } else {
      // RN-01: Critical fields for Volunteer
      const camposCriticos = ['nome', 'especie', 'fotoUrl', 'status', 'aptoParaAdocao'];
      const alteracaoCritica = Object.keys(dados).some(key => camposCriticos.includes(key));

      if (alteracaoCritica) {
        return await alteracaoPendenteRepository.create({
          entidade: 'Animal',
          entidadeId: id,
          dadosAnteriores: JSON.stringify(animalAtual),
          dadosProposto: JSON.stringify({ ...animalAtual, ...dados }),
          submetidoPorId: usuario.id,
          status: StatusAprovacao.PENDENTE
        });
      } else {
        const animalAtualizado = await animalRepository.update(id, dados);
        return animalAtualizado;
      }
    }
  }

  /**
   * Checks if an animal is eligible for the adoption showcase (RN-03).
   */
  isElegivelParaVitrine(animal: Animal): boolean {
    return (
      animal.status === StatusAnimal.PARA_ADOCAO &&
      animal.aptoParaAdocao === true
    );
  }

  /**
   * Lists animals eligible for the showcase.
   */
  async listarElegiveisParaVitrine(): Promise<Animal[]> {
    const todos = await animalRepository.findAll();
    return todos.filter(a => this.isElegivelParaVitrine(a));
  }
}

export const animalService = new AnimalService();
