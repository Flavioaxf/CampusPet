# 🐾 Manual de Boas Práticas de Programação e Arquitetura — CampusPet

**Equipe:** Bia, Mateus e Guilherme  
**Elaborado por:** Tech Lead  
**Data:** Junho de 2026  
**Versão:** 1.1

---

## Introdução

Este documento define os padrões técnicos inegociáveis do projeto CampusPet. Ele não é uma sugestão — é o contrato de qualidade que a nossa equipe assina para garantir que o código seja consistente, performático e fácil de manter por qualquer pessoa do time, hoje e no futuro.

Sempre que tiver dúvida sobre "como fazer", consulte este manual antes de perguntar ou improvisar. E se algo não estiver coberto aqui, traga para discussão antes de criar um padrão novo sozinho.

Nossa stack: **Next.js (App Router) · Tailwind CSS v3 · Lucide React · Firebase**

---

## 1. Padrões Visuais e de Interface

A identidade visual do CampusPet adota um tema escuro (Dark Mode) moderno, com forte apelo visual por meio de fundos translúcidos e elementos de destaque arredondados. Inconsistências visuais entre telas passam uma imagem de desorganização, portanto, as regras abaixo são inegociáveis.

---

### 1.1 Paleta de Cores e Estilos Globais

O nosso sistema utiliza a paleta nativa de cores `slate`, `blue` e `amber` do Tailwind CSS. O arquivo `globals.css` já possui a configuração base do corpo do site e da barra de rolagem customizada.

| Papel | Tailwind Class | Cor de Referência |
|-------|----------------|-------------------|
| Fundo principal | `bg-slate-950` | Azul ultra-escuro |
| Texto principal | `text-slate-300` | Cinza claro/azulado |
| Ação Primária (Institucional) | `bg-blue-600` | Azul |
| Ação Secundária (Adoção) | `bg-amber-500` | Amarelo/Âmbar |

**✅ Certo — usar as classes semânticas do Tailwind diretamente:**
```tsx
<div className="bg-slate-950 text-slate-300 min-h-screen">
  <button className="bg-blue-600 text-white hover:bg-blue-700">
    Ajudar Agora
  </button>
  <button className="bg-amber-500 text-slate-900 hover:bg-amber-600">
    Quero Adotar
  </button>
</div>
```

**❌ Errado — usar hex avulso ou cores arbitrárias que fujam da paleta `slate`/`blue`/`amber`:**
```tsx
<div className="bg-[#121212]">
  <button className="bg-red-500">
    Ajudar Agora
  </button>
</div>
```

---

### 1.2 Tipografia

O CampusPet utiliza uma fonte sans-serif limpa e geométrica para passar credibilidade e modernidade. Não utilizaremos fontes monospace (como a VT323) nesta versão da interface.

**✅ Certo — usar variações de peso (bold, semibold, regular) da fonte principal:**
```tsx
<h1 className="text-5xl font-bold text-white">Proteção Animal no Campus</h1>
<p className="text-lg font-normal text-slate-300">Cuidando dos animais que fazem parte da nossa comunidade...</p>
```

**❌ Errado — importar fontes avulsas ou misturar serifadas:**
```tsx
<h1 style={{ fontFamily: 'Times New Roman' }}>Proteção Animal</h1>
```

---

### 1.3 Arredondamento de Bordas

A nossa identidade visual utiliza botões no formato "pílula" (pill-shaped) e elementos de interface com bordas bem suaves. 

| Classe Tailwind | Uso |
|-----------------|-----|
| `rounded-full` | Botões de ação principais (ex: "Ajudar Agora", "Quero Adotar") e badges |
| `rounded-2xl` / `rounded-xl` | Cards de animais, modais e painéis |
| `rounded-lg` | Inputs, selects e elementos menores |

**✅ Certo:**
```tsx
<button className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white">
  Ajudar Agora
</button>
```

---

### 1.4 Ícones

**Todos os ícones do projeto devem vir exclusivamente da biblioteca `lucide-react`.** Não importar SVGs avulsos, não usar emojis como ícones funcionais, não instalar outras bibliotecas de ícones.

**✅ Certo:**
```tsx
import { Heart, Search } from 'lucide-react';

export function BotoesHero() {
  return (
    <div className="flex gap-4">
      <button className="...">
        <Heart className="w-5 h-5 mr-2" />
        Quero Adotar
      </button>
      <button className="...">
        <Search className="w-5 h-5 mr-2" />
        Portal da Transparência
      </button>
    </div>
  );
}
```

---

## 2. Performance no React

Código que funciona não é sinônimo de código performático. Esta seção cobre os dois erros mais comuns que causam lentidão visível na interface — a sensação de "lag" ou "engasgamento" ao rolar a página.

---

### 2.1 Nunca use `useState` para capturar scroll

Este é o erro de performance mais frequente em projetos React. Quando você armazena a posição do scroll em um `useState`, **cada pixel de rolagem dispara um novo re-render do componente inteiro** — incluindo todos os seus filhos. 

O scroll é um dado volátil e de leitura. Ele não precisa acionar a lógica de renderização do React — precisa apenas mover um elemento na tela. Para isso, use `useRef` e manipule o DOM diretamente.

**❌ Errado — `useState` no scroll (causa re-render a cada pixel):**
```tsx
import { useState, useEffect } from 'react';

export function Header() {
  const [scrollY, setScrollY] = useState(0); 

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header style={{ opacity: scrollY > 50 ? 1 : 0.5 }}>
      CampusPet
    </header>
  );
}
```

**✅ Certo — `useRef` + manipulação direta do DOM (zero re-renders):**
```tsx
import { useEffect, useRef } from 'react';

export function Header() {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;
      headerRef.current.style.opacity = window.scrollY > 50 ? '1' : '0.5';
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header ref={headerRef}>
      CampusPet
    </header>
  );
}
```

---

### 2.2 Use `will-change-transform` para acelerar animações

Quando um elemento vai ser animado, adicionar a classe `will-change-transform` instrui o browser a **promover o elemento para uma camada de composição exclusiva na GPU**. 

**✅ Certo — avisar a GPU com antecedência:**
```tsx
<div className="will-change-transform transition-transform duration-300 hover:-translate-y-1">
  <AnimalCard />
</div>
```

**❌ Errado — animar propriedades que forçam recálculo de layout:**
```tsx
<div className="transition-all duration-300 hover:mt-[-4px]">
  <AnimalCard />
</div>
```

---

## 3. Arquitetura e Banco de Dados — O Padrão Repository

Esta é a regra arquitetural mais importante do projeto, e o seu descumprimento pode inviabilizar o futuro do sistema.

---

### 3.1 Por que isso importa: a migração que vem aí

Estamos usando **Firebase no MVP** porque é rápido de configurar. No entanto, **o sistema será migrado para um banco de dados próprio da universidade** após a fase inicial.

Se o código das telas chamar o Firebase diretamente, quando essa migração acontecer, precisaremos abrir cada arquivo de componente para remover as chamadas. A solução é o **Padrão Repository**.

---

### 3.2 A Regra

**O código de frontend (páginas e componentes) NUNCA deve importar ou chamar o Firebase diretamente.**

Toda e qualquer comunicação com o banco de dados deve passar por funções isoladas dentro da pasta `services/`. 

```text
src/
├── app/                  # (Boundary) Páginas e rotas (Next.js App Router)
│   ├── adocao/
│   ├── denuncias/
│   └── page.tsx
├── components/           # (Boundary) Componentes de UI reutilizáveis
│   ├── CardAnimal.tsx
│   └── Header.tsx
├── services/             # (Control) ÚNICA camada que comunica com o banco
│   ├── animais.ts
│   └── denuncias.ts
└── lib/
    └── firebase/         # (Entity Config) Configuração e instância do Firebase
        └── config.ts
```

---

### 3.3 Como implementar na prática

**Passo 1 — Crie funções isoladas em `services/`:**

```ts
// src/services/animais.ts
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Animal {
  id: string;
  nome: string;
  status: string;
}

export async function getAnimaisParaAdocao(): Promise<Animal[]> {
  const q = query(collection(db, 'animais'), where('status', '==', 'Para Adoção'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Animal));
}
```

**Passo 2 — As telas chamam apenas as funções de `services/`:**

```tsx
// src/app/adocao/page.tsx
import { getAnimaisParaAdocao } from '@/services/animais';

export default async function AdocaoPage() {
  const animais = await getAnimaisParaAdocao();

  return (
    <main>
      {animais.map(animal => (
        <AnimalCard key={animal.id} animal={animal} />
      ))}
    </main>
  );
}
```

---

## 4. Resumo das Regras

| # | Regra | Status |
|---|-------|--------|
| 1 | Utilizar o Dark Mode padronizado em `globals.css` (`slate-950` para fundo) | Inegociável |
| 2 | Botões principais devem usar `rounded-full` e cores `blue` ou `amber` | Inegociável |
| 3 | Todos os ícones exclusivamente de `lucide-react` | Inegociável |
| 4 | Manter a barra de rolagem customizada conforme `globals.css` | Inegociável |
| 5 | Nunca usar `useState` para capturar scroll — usar `useRef` | Inegociável |
| 6 | Adicionar `will-change-transform` em elementos animados na GPU | Fortemente recomendado |
| 7 | Nenhuma tela importa Firebase diretamente — sempre via `services/` | Inegociável |

---

## 5. Conclusão

Boas práticas não existem para complicar o trabalho — existem para garantir que o projeto continue saudável conforme cresce. Cada regra deste documento foi definida com base em problemas reais que projetos sem padrão enfrentam: interfaces inconsistentes, performance degradada e refatorações caras.

Quando em dúvida, a pergunta certa é: **"se esse código precisar mudar daqui a seis meses, vai ser fácil ou vai ser um pesadelo?"** Se a resposta for pesadelo, revise antes de fazer o PR.

---
*CampusPet · Equipe de Desenvolvimento · Documento interno · v1.1 · Junho de 2026*
```