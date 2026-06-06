# Guia de Integração Front-end — CampusPet

Este guia descreve como os componentes e hooks do front-end devem consumir os serviços de dados e lógica de negócio do CampusPet.

## ⚠️ Regra de Ouro: Arquitetura em Camadas

Seguindo as diretrizes de `architecture.md`, **nunca** importe nada diretamente dos seguintes locais em seus componentes ou hooks:
- ❌ `firebase/*`
- ❌ `@/lib/firebase/config`
- ❌ `@/services/repositories/*`

Toda a interação com dados deve ser feita através de **serviços** ou instâncias de **repositórios** exportadas por `@/services`.

---

## 📦 Onde Importar?

O ponto único de entrada para o front-end é o arquivo `src/services/index.ts`.

```typescript
// ✅ Maneira Correta
import { authService, animalService, animalRepository } from '@/services';
import type { Animal } from '@/types/domain';
import { StatusAnimal } from '@/types/enums';
```

---

## 🔐 Autenticação

Use o `authService` para operações de login e gestão de conta.

### Exemplo: Login em um Server Action ou Componente

```typescript
import { authService } from '@/services';

async function handleLogin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const token = await authService.login(email, password);
    // Armazene o token ou redirecione
  } catch (error) {
    console.error(error.message); // "Credenciais inválidas."
  }
}
```

---

## 🐕 Gestão de Animais

Use o `animalService` para lógica de negócio e o `animalRepository` para buscas simples.

### Listando Animais para a Vitrine (Regra RN-03)

O `animalService` já encapsula a lógica de filtragem para a vitrine pública.

```typescript
import { animalService } from '@/services';

// No seu componente ou hook
const animaisElegiveis = await animalService.listarElegiveisParaVitrine();
```

### Cadastrando um Animal (Workflow RN-01)

O método `cadastrarAnimal` gerencia automaticamente se a criação será direta (Gestor) ou se criará uma alteração pendente (Voluntário).

```typescript
import { animalService } from '@/services';

async function onSubmit(dados: CreateAnimalDTO, usuarioLogado: Usuario) {
  const result = await animalService.cadastrarAnimal(dados, usuarioLogado);

  if ('status' in result && result.status === 'PENDENTE') {
    alert('Sua solicitação foi enviada para aprovação do gestor.');
  } else {
    alert('Animal cadastrado com sucesso!');
  }
}
```

---

## 📋 Prontuário Médico

Use o `prontuarioService` para registrar eventos clínicos.

### Registrando um Óbito (Operação Irreversível RN-06)

```typescript
import { prontuarioService } from '@/services';

async function handleObito(idProntuario: string, causa: CausaObito, usuario: Usuario) {
  if (confirm('Esta operação é irreversível. Confirma?')) {
    await prontuarioService.registrarObito({
      prontuarioId: idProntuario,
      dataObito: new Date(),
      causa,
      observacoes: '...',
      registradoPorId: usuario.id
    }, usuario);
  }
}
```

---

## 💡 Boas Práticas

1.  **Tipagem**: Sempre utilize as interfaces de `src/types/domain.ts` e enums de `src/types/enums.ts`.
2.  **Tratamento de Erros**: Os serviços lançam erros com mensagens amigáveis em **PT-BR**. Capture-os em blocos `try/catch` para exibir feedbacks na UI.
3.  **Hooks Customizados**: Prefira encapsular chamadas de serviços em hooks customizados (ex: `useAnimais`, `useAuth`) para manter os componentes limpos.
4.  **Loading States**: Sempre gerencie estados de carregamento ao chamar métodos assíncronos dos serviços.

---

## 🛠️ Validação de Arquitetura

Para garantir que seu código não está violando as camadas, você pode rodar:

```bash
npm run lint
# E o check de segurança:
grep -r "from 'firebase" src/ --exclude-dir=lib/firebase --exclude-dir=services/repositories
```
