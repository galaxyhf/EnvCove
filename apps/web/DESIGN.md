---
name: "EnvCove"
description: "Uma sala de controle silenciosa para secrets, ambientes e operações seguras."
colors:
  verde-integridade: "oklch(0.78 0.14 155)"
  tinta-do-verde: "oklch(0.12 0.025 155)"
  carvao-profundo: "oklch(0.105 0 0)"
  grafite-superficie: "oklch(0.145 0 0)"
  grafite-popover: "oklch(0.16 0 0)"
  grafite-controle: "oklch(0.269 0 0)"
  branco-tecnico: "oklch(0.985 0 0)"
  texto-secundario: "oklch(0.708 0 0)"
  borda-sutil: "oklch(1 0 0 / 10%)"
  entrada-sutil: "oklch(1 0 0 / 15%)"
  vermelho-critico: "oklch(0.704 0.191 22.216)"
typography:
  display:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.375
    letterSpacing: "normal"
  body:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "normal"
  mono:
    fontFamily: "Geist Mono, Geist Mono Fallback, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.875rem"
  2xl: "1.125rem"
  3xl: "1.375rem"
  4xl: "1.625rem"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  compact: "0.75rem"
  md: "1rem"
  control: "1.25rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.verde-integridade}"
    textColor: "{colors.tinta-do-verde}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 0.625rem"
    height: "2rem"
  button-outline:
    backgroundColor: "{colors.carvao-profundo}"
    textColor: "{colors.branco-tecnico}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 0.625rem"
    height: "2rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.branco-tecnico}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 0.625rem"
    height: "2rem"
  input:
    backgroundColor: "{colors.carvao-profundo}"
    textColor: "{colors.branco-tecnico}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 0.625rem"
    height: "2rem"
  card:
    backgroundColor: "{colors.grafite-superficie}"
    textColor: "{colors.branco-tecnico}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "1rem"
  badge:
    backgroundColor: "{colors.verde-integridade}"
    textColor: "{colors.tinta-do-verde}"
    typography: "{typography.label}"
    rounded: "{rounded.4xl}"
    padding: "0.125rem 0.5rem"
    height: "1.25rem"
  nav-item:
    backgroundColor: "{colors.grafite-controle}"
    textColor: "{colors.branco-tecnico}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 0.75rem"
    height: "2.25rem"
  tooltip:
    backgroundColor: "{colors.branco-tecnico}"
    textColor: "{colors.carvao-profundo}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.375rem 0.75rem"
  dialog:
    backgroundColor: "{colors.grafite-popover}"
    textColor: "{colors.branco-tecnico}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "1rem"
---

# Design System: EnvCove

## 1. Overview

**Creative North Star: "A Sala de Controle Silenciosa"**

O EnvCove se comporta como uma sala de controle usada durante trabalho técnico real: escura para manter o foco, compacta para acelerar a leitura e pontuada por sinais verdes somente quando existe uma ação ou um estado que merece atenção. A identidade é precisa, confiável e discreta; segurança aparece na clareza dos estados e das consequências, não em decoração temática.

O sistema favorece padrões conhecidos, densidade moderada e superfícies contidas. Dashboard e CLI pertencem à mesma linguagem: Geist organiza a interface, Geist Mono identifica chaves, comandos e metadados, e o verde conecta confirmação, seleção e ação primária. Nenhuma anti-referência visual específica foi definida no produto; novas decisões devem permanecer justificadas pelo fluxo, pela legibilidade e pelo contexto operacional.

**Key Characteristics:**

- Tema escuro acromático com um único sinal verde operacional.
- Componentes compactos, familiares e previsíveis.
- Bordas e camadas tonais antes de sombras.
- Texto técnico direto, com mono reservado a dados operacionais.
- Estados acessíveis conforme WCAG AA, inclusive por teclado.

## 2. Colors

A paleta usa neutros acromáticos para estrutura e o Verde de Integridade como sinal raro de ação, seleção e confirmação.

### Primary

- **Verde de Integridade** (`oklch(0.78 0.14 155)`): ações primárias, seleção ativa, foco e confirmações positivas. Não é uma cor decorativa.
- **Tinta do Verde** (`oklch(0.12 0.025 155)`): texto e ícones sobre o Verde de Integridade, preservando contraste e parentesco de matiz.

### Neutral

- **Carvão Profundo** (`oklch(0.105 0 0)`): fundo global e base do espaço de trabalho.
- **Grafite de Superfície** (`oklch(0.145 0 0)`): cards e superfícies persistentes.
- **Grafite de Popover** (`oklch(0.16 0 0)`): menus, diálogos e camadas temporárias.
- **Grafite de Controle** (`oklch(0.269 0 0)`): controles secundários, estados ativos neutros e áreas muted.
- **Branco Técnico** (`oklch(0.985 0 0)`): texto principal e conteúdo de alta prioridade.
- **Texto Secundário** (`oklch(0.708 0 0)`): descrições, metadados e conteúdo auxiliar que ainda precisa atingir contraste AA.
- **Borda Sutil** (`oklch(1 0 0 / 10%)`): divisores e contornos estruturais.
- **Entrada Sutil** (`oklch(1 0 0 / 15%)`): base semântica de campos e controles no tema escuro.

### Semantic

- **Vermelho Crítico** (`oklch(0.704 0.191 22.216)`): erros, invalidação e ações destrutivas; nunca representa um estado neutro.

### Named Rules

**The Sinal Raro Rule.** O Verde de Integridade deve ocupar no máximo cerca de 10% de uma tela e aparecer apenas em ação primária, seleção, foco ou confirmação.

## 3. Typography

**Display Font:** Geist (with Geist Fallback e system-ui)
**Body Font:** Geist (with Geist Fallback e system-ui)
**Label/Mono Font:** Geist Mono (with Geist Mono Fallback e ui-monospace)

**Character:** Uma única família sans mantém o produto familiar e silencioso; a versão mono introduz precisão apenas onde o conteúdo é estrutural, como chaves, comandos, caminhos e metadados.

### Hierarchy

- **Display** (600, até `4.5rem`, line-height `1`): exclusivo da landing e de momentos editoriais públicos; use tracking mínimo de `-0.04em` e quebras balanceadas.
- **Headline** (600, `2.25rem`, line-height `1.1`): títulos de seções públicas; no dashboard, prefira a escala fixa de `1.5rem`.
- **Title** (500, `1rem`, line-height `1.375`): títulos de cards, diálogos e grupos de configuração.
- **Body** (400, `0.875rem`, line-height `1.5`): texto padrão da interface; prosa longa cresce para `1rem` ou `1.125rem` e fica entre 65 e 75 caracteres por linha.
- **Label** (500, `0.75rem`, line-height `1.25`): rótulos compactos e metadados; caixa alta e tracking amplo não formam um padrão de seção.
- **Mono** (400, `0.75rem`, line-height `1.5`): secrets ocultos, comandos, contagens técnicas, slugs e histórico.

### Named Rules

**The Tipografia de Operação Rule.** Geist conduz toda a interface; Geist Mono identifica dados técnicos e nunca substitui a fonte de leitura em parágrafos ou controles comuns.

## 4. Elevation

O sistema é plano por padrão. Cards persistentes usam diferença tonal e um ring de `1px`; menus, selects e sheets recebem sombras estruturais porque precisam se separar do conteúdo abaixo. A landing permite uma sombra profunda no terminal demonstrativo, tratado como artefato focal e não como padrão de card.

### Shadow Vocabulary

- **Navegação fixa** (`box-shadow: 0 6px 8px oklch(0 0 0 / 0.18)`): aparece somente quando a barra pública se sobrepõe ao conteúdo durante o scroll.
- **Overlay médio** (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`): menus e selects flutuantes.
- **Overlay alto** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): sheets e submenus que atravessam o layout.
- **Terminal focal** (`box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5)`): somente o terminal demonstrativo da landing.

### Named Rules

**The Plano em Repouso Rule.** Superfícies persistentes não recebem sombra; profundidade vem de tom e borda, enquanto sombras ficam reservadas a sobreposição ou foco narrativo real.

## 5. Components

Os componentes são compactos, familiares e previsíveis. Estados usam transições curtas, foco visível de `3px` e a mesma escala de raios em todas as rotas.

### Buttons

- **Shape:** retângulo compacto com raio `0.625rem`; pills ficam restritas a badges.
- **Primary:** Verde de Integridade com Tinta do Verde, altura padrão de `2rem` e padding horizontal de `0.625rem`.
- **Hover / Focus:** hover reduz a intensidade do fundo; foco combina mudança de borda com ring verde de `3px` a 50%; active desloca `1px` no eixo vertical.
- **Outline / Ghost:** outline usa borda sutil e superfície escura; ghost só revela fundo muted no hover. Disabled reduz opacidade e mantém cursor de indisponibilidade.

### Chips

- **Style:** badges têm `1.25rem` de altura, raio totalmente arredondado dentro da escala e texto de `0.75rem`.
- **State:** verde para estado ou categoria afirmativa; neutral, outline e destructive preservam a mesma geometria.

### Cards / Containers

- **Corner Style:** raio `0.875rem`.
- **Background:** Grafite de Superfície sobre Carvão Profundo.
- **Shadow Strategy:** planos em repouso; um ring branco a 10% define o limite.
- **Border:** divisores internos usam Borda Sutil de `1px`.
- **Internal Padding:** `1rem` por padrão e `0.75rem` na variante compacta.

### Inputs / Fields

- **Style:** altura `2rem`, raio `0.625rem`, fundo quase transparente e borda baseada em Entrada Sutil.
- **Focus:** borda Verde de Integridade mais ring externo de `3px` a 50%.
- **Error / Disabled:** erro troca borda e ring para Vermelho Crítico; disabled reduz opacidade e ganha superfície sutil.

### Navigation

- A sidebar fixa de `15rem` serve telas médias e grandes; no mobile, o mesmo conteúdo entra em um sheet lateral.
- Itens têm `2.25rem`, ícone de `1rem`, texto de `0.875rem`, raio `0.5rem` e fundo Grafite de Controle quando ativos.
- Hover e active alteram fundo e contraste sem deslocar o layout; o foco por teclado permanece visível.

### Dialogs and Overlays

- Diálogos usam Grafite de Popover, raio `0.875rem`, ring sutil e largura limitada ao conteúdo da tarefa.
- Overlays entram em `100–200ms` com fade, zoom ou slide curto. Conteúdo persistente do dashboard não recebe coreografia de entrada.
- Ações destrutivas usam confirmação explícita, Vermelho Crítico e texto que identifica o recurso afetado.

### Terminal and Secret Data

- Terminais, chaves e valores ocultos usam Geist Mono e superfícies mais profundas que o restante da página.
- Valores sensíveis permanecem ocultos até uma ação explícita; a aparência nunca sugere que um secret foi revelado quando não foi.

## 6. Do's and Don'ts

### Do:

- **Do** use o Verde de Integridade (`oklch(0.78 0.14 155)`) somente para ação primária, seleção, foco e confirmação.
- **Do** use diferença tonal e Borda Sutil de `1px` para estruturar superfícies persistentes.
- **Do** mantenha controles do dashboard compactos, com alturas de `2rem` a `2.25rem` e raios entre `0.5rem` e `0.875rem`.
- **Do** reserve Geist Mono para chaves, comandos, slugs, caminhos e metadados operacionais.
- **Do** garanta contraste WCAG AA, ordem de foco lógica, foco visível e estados compreensíveis sem depender apenas de cor.
- **Do** respeite `prefers-reduced-motion`; transições do produto ficam entre `100ms` e `250ms`, e revelações longas pertencem apenas à landing.

### Don't:

- **Don't** use o Verde de Integridade como preenchimento decorativo ou em mais de cerca de 10% da tela.
- **Don't** aplique sombras em cards persistentes; use Grafite de Superfície e ring branco a 10%.
- **Don't** use Geist Mono em parágrafos, botões comuns ou rótulos que não representam dados técnicos.
- **Don't** use tracking de display abaixo de `-0.04em`; o `-0.055em` atual do hero é uma exceção legada a corrigir em um polish futuro.
- **Don't** replique a grade decorativa ou a sequência de kickers pequenos em caixa alta da landing em novas superfícies.
- **Don't** revele, registre ou comunique valores sensíveis fora de uma ação explícita e autorizada.
