# 📖 Bíblia do Front-end — Guia de Integração CampusPet

Este documento é o guia definitivo para a equipe de UI. Ele descreve como os componentes e hooks do front-end devem consumir a camada de dados e lógica de negócio do sistema, garantindo segurança, padronização e integridade das regras de negócio.

---

## 1. ⚠️ A Regra de Ouro Arquitetural

**Componentes React, Hooks e Server Actions NUNCA devem importar nada diretamente de `firebase/*` ou de `src/services/repositories/*`.**

O acesso ao banco de dados e à lógica de negócio deve ser feito **EXCLUSIVAMENTE** através dos singletons exportados em:
👉 `src/services/index.ts`

### ✅ O Jeito Certo:
```typescript
import { authService, financeiroService, animalService } from '@/services';
```

### ❌ O Jeito Errado:
```typescript
import { db } from '@/lib/firebase/config'; // PROIBIDO
import { collection, getDocs } from 'firebase/firestore'; // PROIBIDO
import { DoacaoRepository } from '@/services/repositories/DoacaoRepository'; // PROIBIDO
```

---

## 2. 🏗️ Setup de Tipagem

O sistema é 100% tipado. Sempre utilize as interfaces e enums oficiais para garantir que os dados exibidos e enviados estejam corretos.

```typescript
// Importando Interfaces (Entidades e DTOs)
import type { Usuario, Animal, Doacao, CreateDoacaoDTO } from '@/types/domain';

// Importando Enums (Status, Perfis, Tipos)
import { PerfilUsuario, StatusAnimal, StatusDoacao, TipoDoacao } from '@/types/enums';
```

---

## 3. 💻 Exemplos Práticos de Código

### 🔐 Autenticação e RBAC (Controle de Acesso)
Para validar se um usuário pode acessar uma funcionalidade ou ver um botão:

```typescript
'use client';
import { useAuth } from '@/hooks/useAuth'; // Hook sugerido que consome o authService
import { PerfilUsuario } from '@/types/enums';

export function PainelGestor() {
  const { user } = useAuth();

  // Validação de Perfil (RBAC)
  const isGestor = user?.perfil === PerfilUsuario.GESTOR;

  if (!isGestor) {
    return <p>Acesso negado. Esta área é exclusiva para Gestores.</p>;
  }

  return <div>Bem-vindo ao Painel de Controle</div>;
}
```

### 🐾 Gestão de Animais (Vitrine Pública)
O `animalService` já implementa a **RN-03**, garantindo que apenas animais aptos e aprovados apareçam na vitrine.

```typescript
import { animalService } from '@/services';

// Em um Server Component ou Hook
async function carregarVitrine() {
  try {
    // Retorna apenas animais com status=PARA_ADOCAO e aptoParaAdocao=true
    const animais = await animalService.listarElegiveisParaVitrine();
    return animais;
  } catch (error) {
    // Erros já vêm em PT-BR
    toast.error('Erro ao carregar a vitrine de adoção.');
  }
}
```

### 💰 Módulo Financeiro: Doação Manual (Workflow RN-01)
O serviço decide automaticamente se a doação entra como `CONFIRMADO` ou `PENDENTE`.

```typescript
import { financeiroService } from '@/services';
import { TipoDoacao, MetodoDoacao } from '@/types/enums';

async function handleNovaDoacao(dadosForm: any, usuarioLogado: Usuario) {
  try {
    const payload = {
      ...dadosForm,
      data: new Date(),
      tipo: TipoDoacao.DINHEIRO,
      metodo: MetodoDoacao.PIX,
    };

    const result = await financeiroService.registrarDoacaoManual(payload, usuarioLogado);

    // RN-01: Se for Voluntário, o serviço retorna uma 'AlteracaoPendente'
    if ('status' in result && result.status === 'PENDENTE') {
      toast.info('Registro enviado para aprovação do Gestor.');
    } else {
      toast.success('Doação registrada e confirmada com sucesso!');
    }
  } catch (error: any) {
    toast.error(error.message);
  }
}
```

### 🔄 Módulo Financeiro: Estorno (Regra RN-02)
O estorno nunca apaga o registro original, ele cria um novo registro de `Estorno` vinculado.

```typescript
import { financeiroService } from '@/services';

async function realizarEstorno(doacaoId: string, justificativa: string, gestor: Usuario) {
  try {
    // RN-02: O serviço valida se a justificativa tem no mínimo 10 caracteres
    const estorno = await financeiroService.estornarDoacao(doacaoId, justificativa, gestor);
    
    toast.success('Doação estornada com sucesso!');
    return estorno;
  } catch (error: any) {
    // Exibe "A justificativa de estorno deve ter pelo menos 10 caracteres (RN-02)."
    toast.error(error.message);
  }
}
```

---

## 4. 🚨 Tratamento de Erros Padrão

Nossos serviços lançam exceções estruturadas com mensagens em **Português Brasileiro (PT-BR)** prontas para o usuário final. Sempre envolva as chamadas em `try/catch`.

```typescript
import { financeiroService } from '@/services';

async function deletarConta(id: string) {
  try {
    await financeiroService.excluirContaFinanceira(id);
    toast.success('Conta excluída com sucesso!');
  } catch (error: any) {
    // O erro capturado será, por exemplo: 
    // "Não é possível excluir uma conta que possui movimentações vinculadas (RF-16)."
    toast.error(error.message); 
  }
}
```

---

## 5. 🛠️ Comandos de Validação

Antes de subir qualquer código para o repositório, garanta que ele passa nos testes de integridade:

```bash
# 1. Verifica erros de tipagem
npx tsc --noEmit

# 2. Verifica padrões de código e imports proibidos
npm run lint

# 3. Garante que nada foi quebrado
npm test
```
