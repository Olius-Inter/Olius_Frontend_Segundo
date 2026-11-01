# Organização dos estilos

Os estilos ficam em `styles/`, fora de `src/`, para respeitar a exigência literal de manter apenas
arquivos `.ts` e `.tsx` dentro de `src`.

- `styles/globals.css`: entrada global importada em `src/main.tsx`.
- `styles/tokens.css`: cores, fontes, espaçamentos e arredondamentos.
- `styles/base.css`: reset, tipografia, tabelas e foco de teclado.
- `styles/utilities.css`: classes globais reutilizadas.
- `styles/portal-theme.css`: temas do portal.
- `styles/shared.module.css`: regras compartilhadas existentes.
- `styles/components/Nome/styles.module.css`: estilos do componente correspondente.
- `styles/pages/Nome/styles.module.css`: estilos da página correspondente.

CSS Modules continuam encapsulando as classes. O componente importa o módulo com caminho relativo e
usa `styles['nome-da-classe']`. Dependências de seletores entre módulos usam `@value`, com caminhos
atualizados e sem ciclos.

Use os tokens existentes antes de criar valores. Preserve foco, contraste, estados desabilitados,
movimento reduzido e regras responsivas.

## Formatação do código-fonte

Dois espaços, uma propriedade por linha, ponto e vírgula ao final e uma linha em branco entre
regras. Prettier preserva o padrão automaticamente.

```css
.exemplo {
  display: flex;
  gap: var(--space-4);
}
```

A saída minificada em `dist/assets/css/` é gerada automaticamente e não deve ser formatada
manualmente. Consulte [Build e publicação](build.md).
