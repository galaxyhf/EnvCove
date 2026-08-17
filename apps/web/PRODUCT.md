# Product

## Register

product

## Users

Desenvolvedores individuais, pequenas equipes de desenvolvimento e times de plataforma ou DevOps que precisam organizar e disponibilizar variáveis de ambiente com segurança. O produto deve atender desde quem configura o primeiro projeto até profissionais que operam vários ambientes e usam a CLI diariamente.

## Product Purpose

O EnvCove substitui o compartilhamento inseguro e manual de arquivos `.env` por uma fonte central, criptografada e auditável. O dashboard organiza projetos, ambientes, secrets, tokens e atividades; a CLI leva as variáveis autorizadas ao fluxo local ou ao processo em execução. O produto tem sucesso quando o usuário consegue armazenar, localizar, comparar e entregar configurações sensíveis sem expor valores em chats, planilhas, commits ou logs.

## Brand Personality

Precisa, confiável e discreta. A interface comunica segurança por meio de clareza operacional, linguagem direta e comportamento previsível, sem competir com o trabalho que o usuário está realizando.

## Anti-references

Nenhuma referência visual ou anti-referência específica foi definida. Decisões futuras devem ser justificadas pelo contexto do EnvCove, pelo fluxo do usuário e pelos princípios deste documento.

## Design Principles

1. **Tornar a segurança compreensível.** Explicar proteção, autorização e consequências no ponto da ação sem revelar ou registrar valores sensíveis.
2. **Conectar dashboard e terminal.** Tratar a interface web e a CLI como partes contínuas do mesmo fluxo, com nomes, estados e instruções coerentes.
3. **Priorizar o trabalho principal.** Manter criação, busca, comparação, importação, exportação e recuperação de secrets rápidas e previsíveis.
4. **Exibir estado com precisão.** Diferenciar claramente ambiente, seleção, carregamento, sucesso, erro, expiração e revogação para evitar ações no contexto errado.
5. **Servir diferentes níveis de experiência.** Oferecer orientação suficiente para o primeiro uso sem reduzir a eficiência de quem opera o produto diariamente.

## Accessibility & Inclusion

Atender ao WCAG AA. Todos os fluxos interativos devem funcionar por teclado, com ordem de foco lógica, foco visível, nomes acessíveis e estados comunicados sem depender apenas de cor.
