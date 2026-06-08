# CampusPet — Camada de Dados (Data Layer)

Este documento descreve a implementação da camada de dados para o sistema CampusPet, desenvolvida na **TASK-001**. 
Toda a arquitetura segue rigorosamente o **Padrão Repository**, isolando os componentes e regras de negócio do acesso direto ao Firebase Firestore.

## 1. Firebase Configuração

O único ponto de entrada para o SDK do Firebase em todo o projeto é o arquivo `src/lib/firebase/config.ts`. Este arquivo inicializa a aplicação usando as credenciais providas no `.env.local`. Todos os repositórios importam exclusivamente a instância `db` deste arquivo. 

Nenhum arquivo fora de `src/services/repositories/` ou da infraestrutura base possui imports do Firebase.

## 2. Tipos de Domínio e Enums

O domínio do sistema está mapeado em `src/types/domain.ts` e `src/types/enums.ts`. Foram implementadas 25 entidades e 22 enumerações que garantem a tipagem forte do TypeScript (strict mode) por todo o sistema. Para cada entidade, foi criado um `Create{Entity}DTO`, tipicamente usando `Omit<Entity, 'id' | 'criadoEm'>` para isolar campos de sistema dos campos manipulados na interface de criação.

## 3. Interfaces (Contratos)

Os contratos dos repositórios encontram-se em `src/services/interfaces/`. Eles ditam as regras e os métodos permitidos. 

Respeitando as regras de imutabilidade e as regras de negócio:
- **LogAuditoria** e **RegistroObito**: Não possuem métodos `update` ou `delete` nas interfaces.
- **AnexoFollowUp** e **Estorno**: Não possuem método `update`.
- **Despesa**, **Doacao** e **Estorno**: Não possuem método `delete`.

Isso garante em tempo de compilação (compile-time) que esses dados críticos não sofrerão alterações indevidas pela aplicação.

## 4. Repositórios e Firebase Firestore

As 25 classes de repositório encontram-se em `src/services/repositories/`. Cada classe implementa a interface correspondente. 

**Características padrão:**
- Conversão de `Timestamp` (Firestore) para `Date` (JavaScript) no utilitário de conversão `toXxx()`.
- Utilização de `serverTimestamp()` no momento de criação de documentos (nos campos baseados em datas como `criadoEm` e `registradoEm`).
- Log consolidado de erros de acesso e busca no Console.

## 5. Singletons

O arquivo `src/services/index.ts` funciona como um **Barrel Export**, instanciando e exportando cada repositório como um Singleton. Todos os componentes e hooks do React que necessitam buscar ou gravar dados devem importar a instância daqui (ex: `animalRepository`).

```typescript
import { animalRepository } from '@/services';

// Exemplo
const animal = await animalRepository.findById('...');
```

## 6. Validação Técnica
- Nenhuma falha encontrada no `npx tsc --noEmit`.
- O comando de build do Next.js foi concluído sem erros de tipagem da camada de dados.
- Total respeito às Regras de Negócio e Restrições de Camadas.
