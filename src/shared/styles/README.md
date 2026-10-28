# Organização dos estilos

- `globals.css` é importado uma vez, antes da aplicação, em `src/main.tsx`.
- `tokens.css` reúne cores, fonte, espaçamentos e arredondamentos compartilhados.
- `base.css` contém reset, tipografia, tabelas e foco de teclado.
- `utilities.css` contém classes globais reutilizadas: `card`, `button`, `button-secondary`, `eyebrow`, `lead`, `sr-only` e `table-scroll`.
- `shared.module.css` contém estilos usados em mais de um componente, como estrutura de gráficos e cabeçalhos das seções B2B.
- Cada página ou componente com regras próprias tem `styles.module.css` ao lado de `index.tsx`. Componentes que apenas compõem outros podem não precisar de CSS próprio.

Importe o módulo e use `styles['nome-da-classe']`. Para classes condicionais já existentes, `mapClassNames` associa os nomes aos exports do módulo, preservando as classes globais. Os mapas ficam fora do componente.

Uma regra contextual que depende de outro componente importa o seletor com `@value`. Por exemplo, os campos do motorista importam a classe raiz do formulário. Evite dependências circulares e mantenha overrides específicos no componente que os utiliza.

Use variáveis existentes antes de criar valores novos. As media queries ficam no arquivo do componente ou layout correspondente. Preserve as regras de foco, contraste, desabilitação e movimento reduzido.

## Formatação

Use dois espaços, uma propriedade por linha, ponto e vírgula ao final e uma linha em branco entre regras:

```css
.exemplo {
  display: flex;
  gap: var(--space-4);
}

@media (max-width: 700px) {
  .exemplo {
    flex-direction: column;
  }
}
```
