# Psicóloga Camila Albuquerque · landing page

Landing page conceitual para uma psicóloga clínica (TCC para ansiedade), feita em HTML, CSS e JavaScript puro, sem framework e sem etapa de build. A página inteira, com as fotos, pesa cerca de 300 KB.

**Ideia:** "A Linha". Uma linha de metrô desce pela borda esquerda e cada seção é uma estação numerada, da recepção até o agendamento.

## Destaques

- Rolagem suave com curva própria (links, setas, Page Down e roda do mouse); trackpad e toque mantêm a inércia nativa
- Botões com brilho contínuo, preenchimento ao passar o mouse e inversão de cores ao clicar
- Títulos que entram palavra por palavra, retrato com anel que se desenha, faixa de pilares com botão de pausa
- Navegação por Alt + 1 a 5, link de pular para o conteúdo, foco visível e respeito a `prefers-reduced-motion`

## Estrutura

```
index.html        página principal
privacidade.html  política de privacidade provisória
style.css         estilos e tokens (cores, tipografia, botões, linha)
script.js         rolagem suave, linha de estações, menu, FAQ
img/              fotos em WebP
```

## Rodar localmente

Basta abrir o `index.html` ou servir a pasta:

```bash
npx http-server . -p 4323
```

## Aviso

Projeto conceitual de portfólio: o nome, o CRP, o telefone de WhatsApp (`script.js` e `index.html`), o endereço e o tempo de experiência são fictícios.
