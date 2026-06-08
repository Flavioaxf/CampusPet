# 🐾 CampusPet — Guia de Versionamento e Integração Git + Jira

**Equipe:** Bia, Mateus e Guilherme  
**Elaborado por:** Tech Lead  
**Data:** Junho de 2026  
**Versão:** 1.2

---

## 1. Introdução

Oi, time!

À medida que o CampusPet cresce e chegamos mais perto do nosso MVP, manter o código organizado e o Jira atualizado deixa de ser um detalhe e passa a ser uma necessidade real. Sem um padrão claro, perdemos tempo tentando entender "o que foi feito?", "qual branch corresponde a qual tarefa?" e atualizando cards manualmente — tempo que poderíamos estar usando para construir produto.

**Por isso, a partir de agora, adotamos um padrão unificado de versionamento com integração automática entre o GitHub e o Jira.** Isso nos traz três ganhos imediatos:

- ⏱ **Ganho de tempo:** O Jira atualiza o status dos cards automaticamente quando você faz um commit ou abre um PR — sem precisar entrar no board manualmente.
- 🔍 **Rastreabilidade total:** Qualquer pessoa da equipe consegue ver, no card do Jira, exatamente quais commits e branches estão relacionados àquela tarefa.
- 🚀 **Histórico limpo para o MVP:** Um repositório bem organizado facilita revisões de código, a identificação de bugs e o onboarding de novos membros futuramente.

Não se preocupem se parecer muito no começo — este guia explica tudo passo a passo, tanto pelo **terminal** quanto pelo **GitHub Desktop**, para que cada um use a ferramenta com que se sentir mais confortável. Em poucos dias vai virar rotina. Vamos juntos! 💪

---

## 2. Onde Encontrar a Chave da Tarefa no Jira

Cada card (tarefa) no nosso quadro do Jira possui um **identificador único**, chamado de **Chave da Tarefa**. Ela fica visível no próprio card, geralmente no canto superior esquerdo ou na URL ao abrir a tarefa.

**O formato padrão do nosso projeto é:**

```text
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

```text
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

```text
feature/CP-15-criar-botao-adocao
```

---

### 💻 Como criar a branch pelo Terminal

Antes de criar a branch, certifique-se de que está na branch `develop` e com o código atualizado:

```bash
# 1. Vá para a branch develop
git checkout develop

# 2. Baixe as últimas atualizações do repositório remoto
git pull origin develop

# 3. Crie a nova branch já a partir do develop atualizado
git checkout -b feature/CP-15-criar-botao-adocao
```

Para confirmar que a branch foi criada e que você já está nela:

```bash
git branch
# A branch atual aparece com um asterisco (*) na frente
```

---

### 🖥️ Como criar a branch pelo GitHub Desktop

1. No GitHub Desktop, clique em **Current Branch** (no topo)
2. Clique em **New Branch**
3. Digite o nome seguindo o formato acima
4. Confirme que a opção **"Create branch based on... `develop`"** está selecionada
5. Clique em **Create Branch**

---

> ⚠️ **Atenção:** Use sempre letras minúsculas e hífens no lugar de espaços. Nunca use acentos ou caracteres especiais no nome da branch.

---

## 4. Padrão de Nomenclatura de Commits

O commit é o momento em que você "salva" uma parte do seu trabalho no repositório. A mensagem do commit é o que o Jira lê para associar automaticamente aquela alteração ao card correto.

### Formato obrigatório

```text
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

```text
feat: [CP-15] adiciona cor primaria no tailwind
```

Outros exemplos do dia a dia:

```text
fix: [CP-12] corrige quebra de layout do header no mobile

style: [CP-20] ajusta espaçamento dos cards de adocao

refactor: [CP-18] extrai logica de filtros para hook customizado

chore: [CP-23] instala biblioteca de integracao com webhook
```

---

### 💻 Como fazer o commit pelo Terminal

```bash
# 1. Veja quais arquivos foram alterados
git status

# 2. Adicione os arquivos que fazem parte deste commit
#    Para adicionar um arquivo específico:
git add src/components/AdoptionSection.tsx

#    Para adicionar TODOS os arquivos alterados de uma vez:
git add .

# 3. Faça o commit com a mensagem no formato correto
git commit -m "feat: [CP-15] adiciona botao de adocao na vitrine"

# 4. Envie a branch para o GitHub (primeira vez que sobe a branch)
git push -u origin feature/CP-15-criar-botao-adocao

#    Nos próximos pushes da mesma branch, basta:
git push
```

> 💡 **Dica:** Use `git status` com frequência — ele mostra o estado atual do seu repositório e evita surpresas na hora do commit.

---

### 🖥️ Como fazer o commit pelo GitHub Desktop

1. Após salvar suas alterações no editor, abra o **GitHub Desktop**
2. Na aba **Changes**, revise os arquivos alterados
3. Marque apenas os arquivos que fazem parte deste commit
4. No campo **Summary**, escreva a mensagem seguindo o formato acima
5. Clique em **Commit to `nome-da-sua-branch`**
6. Clique em **Push origin** para enviar ao GitHub

---

> 💡 **Dica:** Faça commits pequenos e frequentes, cada um descrevendo uma mudança específica. Evite commits gigantes com tudo junto — eles dificultam revisões e a rastreabilidade no Jira.

---

## 5. Pull Requests (PRs)

Quando sua tarefa estiver concluída e você quiser integrar o código à branch principal, é hora de abrir um **Pull Request (PR)** no GitHub.

### Regra para o título do PR

O título **deve sempre começar** com a chave da tarefa entre colchetes:

```text
[CP-X] Descrição resumida do que foi implementado
```

### Exemplo prático

```text
[CP-15] Cria botão de adoção na vitrine de animais
```

---

### 💻 Como abrir o PR pelo Terminal

Após fazer o push da sua branch, você pode abrir o PR diretamente pelo navegador. O terminal vai exibir um link direto após o push:

```bash
git push -u origin feature/CP-15-criar-botao-adocao

# O terminal vai mostrar algo como:
# remote: Create a pull request for 'feature/CP-15-criar-botao-adocao' on GitHub by visiting:
# remote:   [https://github.com/campuspet/campuspet-web/pull/new/feature/CP-15-criar-botao-adocao](https://github.com/campuspet/campuspet-web/pull/new/feature/CP-15-criar-botao-adocao)
```

Basta clicar no link ou abrir o repositório no GitHub e clicar em **"Compare & pull request"**. Depois:

1. Confirme que a **base branch** é `develop` (não `main`)
2. Preencha o título seguindo o formato `[CP-X] Descrição`
3. Adicione uma descrição resumida do que foi feito
4. Atribua um colega como **Reviewer**
5. Clique em **Create Pull Request**

---

### 🖥️ Como abrir o PR pelo GitHub Desktop

1. Após fazer o commit e o push, clique em **Create Pull Request** (botão que aparece no topo)
2. O GitHub vai abrir no navegador automaticamente
3. Siga os mesmos passos descritos acima (título, base branch, reviewer)

---

### Boas práticas ao abrir um PR

- **Descrição:** Escreva um breve resumo do que foi feito e, se necessário, como testar localmente.
- **Reviewers:** Sempre solicite a revisão de pelo menos um colega antes de fazer o merge.
- **Branch de destino:** Confirme que o PR está sendo aberto para `develop` (nunca direto para `main`).
- **Checklist:** Verifique se o código está funcionando localmente antes de abrir o PR.

> ⚠️ **Nunca faça merge do seu próprio PR** sem a aprovação de pelo menos um colega. Isso é uma proteção para todos nós.

---

## 6. Referência Rápida de Comandos Git

Para quem está começando a usar o terminal, aqui está um resumo dos comandos mais usados no dia a dia:

```bash
# Ver o estado atual do repositório
git status

# Ver em qual branch você está
git branch

# Trocar de branch
git checkout nome-da-branch

# Atualizar a branch atual com o remoto
git pull

# Ver o histórico de commits
git log --oneline

# Desfazer alterações em um arquivo (antes do commit)
git checkout -- nome-do-arquivo

# Ver a diferença entre o que foi alterado e o último commit
git diff
```

---

## 7. Divisão de Papéis e Responsabilidades (MVP)

Para garantirmos agilidade e mantermos a modularidade do nosso código durante o MVP, dividimos as responsabilidades do projeto em três frentes de trabalho. Cada integrante será o "dono" de uma camada específica da arquitetura:

* **👩‍💻 Bia: Engenharia de UI e Componentização Front-end**
    * **Foco:** Transformar o design em código modular, criando a base de componentes reutilizáveis dentro de `src/components/`.
    * **Responsabilidade:** Garantir a consistência visual usando as diretrizes do Tailwind CSS (`globals.css`), respeitando limites de arredondamento de bordas e usando exclusivamente os ícones da biblioteca `lucide-react`.

* **👨‍💻 Mateus: Arquitetura de Dados e Serviços (Backend/Firebase)**
    * **Foco:** Construir o "motor" do sistema, isolando a configuração e as chamadas ao Firebase em `src/lib/firebase/config.ts`.
    * **Responsabilidade:** Implementar o Padrão Repository na pasta `src/services/`, assegurando que o front-end nunca faça chamadas diretas ao banco de dados. Isso garantirá uma transição limpa para um banco relacional no futuro.

* **👨‍💻 Guilherme: Integração Next.js e Performance**
    * **Foco:** Montar o roteamento da aplicação dentro de `src/app/` e integrar os componentes criados pela Bia com as funções de dados desenvolvidas pelo Mateus.
    * **Responsabilidade:** Otimizar a performance do React, gerenciando corretamente Server vs. Client Components, utilizando `useRef` (em vez de `useState`) para variáveis voláteis como rolagem de tela, e aplicando `will-change-transform` para aliviar a carga visual enviando animações para a GPU.

---

## 8. Conclusão

Time, essa prática começa a valer **imediatamente**, para todas as tarefas da sprint atual em diante.

Sabemos que mudar hábitos exige um esforço inicial, mas em poucos dias isso vai se tornar automático — e todos vamos sentir a diferença na organização do projeto. Um repositório limpo e um board do Jira sempre atualizado são sinais de um time maduro e profissional.

**Resumo rápido — cole no seu editor ou cole no bloco de notas:**

```text
Branch:  feature/CP-X-descricao-curta
Commit:  feat: [CP-X] descricao do que foi feito
PR:      [CP-X] Descricao resumida do que foi implementado
```

**Fluxo completo pelo terminal, do zero ao PR:**

```bash
git checkout develop
git pull origin develop
git checkout -b feature/CP-X-descricao-curta

# ... faz as alterações no código ...

git add .
git commit -m "feat: [CP-X] descricao do que foi feito"
git push -u origin feature/CP-X-descricao-curta

# Abre o link que aparece no terminal para criar o PR no GitHub
```

Qualquer dúvida, pode chamar no grupo. Nenhuma pergunta é pequena demais — o importante é que todos estejamos alinhados.

Bora codar! 🚀

---

*CampusPet · Equipe de Desenvolvimento · Documento interno · v1.2 · Junho de 2026*