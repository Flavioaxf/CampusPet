# 🐾 CampusPet — Guia de Versionamento e Integração Git + Jira

**Equipe:** Bia, Mateus e Guilherme  
**Elaborado por:** Tech Lead  
**Data:** Junho de 2026  
**Versão:** 1.0

---

## 1. Introdução

Oi, time! 👋

À medida que o CampusPet cresce e chegamos mais perto do nosso MVP, manter o código organizado e o Jira atualizado deixa de ser um detalhe e passa a ser uma necessidade real. Sem um padrão claro, perdemos tempo tentando entender "o que foi feito?", "qual branch corresponde a qual tarefa?" e atualizando cards manualmente — tempo que poderíamos estar usando para construir produto.

**Por isso, a partir de agora, adotamos um padrão unificado de versionamento com integração automática entre o GitHub e o Jira.** Isso nos traz três ganhos imediatos:

- ⏱ **Ganho de tempo:** O Jira atualiza o status dos cards automaticamente quando você faz um commit ou abre um PR — sem precisar entrar no board manualmente.
- 🔍 **Rastreabilidade total:** Qualquer pessoa da equipe consegue ver, no card do Jira, exatamente quais commits e branches estão relacionados àquela tarefa.
- 🚀 **Histórico limpo para o MVP:** Um repositório bem organizado facilita revisões de código, facilitando a identificação de bugs e o onboarding de novos membros futuramente.

Não se preocupem se parecer muito no começo — este guia explica tudo passo a passo, e em poucos dias vai virar rotina. Vamos juntos! 💪

---

## 2. Onde Encontrar a Chave da Tarefa no Jira

Cada card (tarefa) no nosso quadro do Jira possui um **identificador único**, chamado de **Chave da Tarefa**. Ela fica visível no próprio card, geralmente no canto superior esquerdo ou na URL ao abrir a tarefa.

**O formato padrão do nosso projeto é:**

```
CP-X
```

Onde `CP` é a sigla do projeto (**C**ampus**P**et) e `X` é o número sequencial da tarefa.

**Exemplos reais:**

| Chave | Tarefa |
|-------|--------|
| `CP-12` | Criar componente Header responsivo |
| `CP-15` | Criar botão de adoção na vitrine |
| `CP-23` | Integrar webhook de doações PIX |

> 💡 **Dica:** Antes de começar qualquer tarefa, abra o card no Jira e anote a chave. Ela vai acompanhar tudo — a branch, os commits e o PR.

---

## 3. Padrão de Nomenclatura de Branches

Quando você for iniciar o trabalho em uma tarefa, o primeiro passo é criar uma branch com nome padronizado. Isso conecta automaticamente o seu código ao card no Jira.

### Formato obrigatório

```
tipo/CHAVE-DA-TAREFA-descricao-curta
```

### Tipos de branch aceitos

| Tipo | Quando usar |
|------|-------------|
| `feature` | Criação de uma funcionalidade nova |
| `fix` | Correção de um bug |
| `hotfix` | Correção urgente em produção |
| `refactor` | Melhoria de código sem mudar comportamento |
| `chore` | Tarefas de configuração, dependências, CI/CD |
| `docs` | Atualização de documentação |

### Exemplo prático

Você pegou a tarefa **CP-15** que pede para criar o botão de adoção. Sua branch deve ser:

```
feature/CP-15-criar-botao-adocao
```

### Como criar no GitHub Desktop

1. No GitHub Desktop, clique em **Current Branch** (no topo)
2. Clique em **New Branch**
3. Digite o nome seguindo o formato acima
4. Clique em **Create Branch**

> ⚠️ **Atenção:** Use sempre letras minúsculas e hífens no lugar de espaços. Nunca use acentos ou caracteres especiais no nome da branch.

---

## 4. Padrão de Nomenclatura de Commits

O commit é o momento em que você "salva" uma parte do seu trabalho no repositório. A mensagem do commit é o que o Jira lê para associar automaticamente aquela alteração ao card correto.

### Formato obrigatório

```
tipo: [CHAVE-DA-TAREFA] Descrição clara do que foi feito
```

### Tipos de commit aceitos

| Tipo | Quando usar |
|------|-------------|
| `feat` | Adição de uma funcionalidade nova |
| `fix` | Correção de bug |
| `refactor` | Refatoração de código |
| `style` | Alterações visuais, CSS, Tailwind (sem lógica) |
| `chore` | Configurações, dependências |
| `docs` | Documentação |
| `test` | Adição ou correção de testes |

### Exemplo prático

Trabalhando na tarefa **CP-15**, você acabou de adicionar a cor primária no Tailwind. O commit deve ser:

```
feat: [CP-15] adiciona cor primaria no tailwind
```

Outros exemplos do dia a dia:

```
fix: [CP-12] corrige quebra de layout do header no mobile

style: [CP-20] ajusta espaçamento dos cards de adocao

refactor: [CP-18] extrai logica de filtros para hook customizado

chore: [CP-23] instala biblioteca de integracao com webhook
```

### Como fazer o commit no GitHub Desktop

1. Após salvar suas alterações no editor, abra o **GitHub Desktop**
2. Na aba **Changes**, revise os arquivos alterados
3. No campo **Summary**, escreva a mensagem seguindo o formato acima
4. Clique em **Commit to `nome-da-sua-branch`**

> 💡 **Dica:** Faça commits pequenos e frequentes, cada um descrevendo uma mudança específica. Evite commits gigantes com tudo junto — eles dificultam revisões e a rastreabilidade no Jira.

---

## 5. Pull Requests (PRs)

Quando sua tarefa estiver concluída e você quiser integrar o código à branch principal, é hora de abrir um **Pull Request (PR)** no GitHub.

### Regra para o título do PR

O título **deve sempre começar** com a chave da tarefa entre colchetes:

```
[CP-X] Descrição resumida do que foi implementado
```

### Exemplo prático

```
[CP-15] Cria botão de adoção na vitrine de animais
```

### Boas práticas ao abrir um PR

- **Descrição:** Escreva um breve resumo do que foi feito e, se necessário, como testar.
- **Reviewers:** Sempre solicite a revisão de pelo menos um colega antes de fazer o merge.
- **Branch de destino:** Confirme que o PR está sendo aberto para a branch correta (`develop` ou `main`, conforme definido na sprint).
- **Checklist:** Verifique se o código está funcionando localmente antes de abrir o PR.

> ⚠️ **Nunca faça merge do seu próprio PR** sem a aprovação de pelo menos um colega. Isso é uma proteção para todos nós.

---

## 6. Conclusão

Time, essa prática começa a valer **imediatamente**, para todas as tarefas da sprint atual em diante.

Sabemos que mudar hábitos exige um esforço inicial, mas em poucos dias isso vai se tornar automático — e todos vamos sentir a diferença na organização do projeto. Um repositório limpo e um board do Jira sempre atualizado são sinais de um time maduro e profissional.

**Resumo rápido para colar no seu editor:**

```
Branch:  feature/CP-X-descricao-curta
Commit:  feat: [CP-X] descricao do que foi feito
PR:      [CP-X] Descricao resumida do que foi implementado
```

Qualquer dúvida, pode chamar no grupo. Nenhuma pergunta é pequena demais — o importante é que todos estejamos alinhados.

Bora codar! 🚀

---

*CampusPet · Equipe de Desenvolvimento · Documento interno · v1.0 · Junho de 2026*