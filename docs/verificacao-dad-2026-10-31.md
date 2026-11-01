# Verificação de DAD — 31/10/2026

Escopo: frontend ADMIN B2B em prévia local, sem chamadas à API ou à IA.

## Correções

- Cores de cabeçalhos de tabela, descrições, ajuda e cancelamento do formulário passam a respeitar
  os temas. O axe encontrou contraste abaixo de 4,5:1 antes dessas alterações.
- Diálogos compartilham um hook curto para abrir, conter Tab/Shift+Tab, impedir rolagem do fundo,
  limpar listeners e devolver o foco. Nomes acessíveis usam IDs únicos.
- Menu móvel mantém o foco na navegação, oferece fechamento interno, Escape e devolução ao
  acionador; conteúdo ao fundo fica `inert` enquanto o menu está aberto.
- Notificações recebem foco ao abrir e recuperam o acionador ao fechar por Escape.
- Envio de foto mostra foco visível no controle.
- Exemplo de desempenho isolado compara a mesma filtragem com e sem memoização. Dependências de
  teste ficam em devDependencies; Vite atualizado para 8.3.3.

## Evidências reproduzíveis

`npm run test:ui` executa Playwright + axe no navegador Edge sem interface no Windows:

| Verificação                                                                                                                                           | Resultado                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 38 cenários axe: login, 9 rotas em 3 temas, formulário inválido em 3 temas, 3 diálogos, notificações, menu móvel, largura 390 px e formulário editado | Zero violações detectadas nas regras WCAG 2 A/AA e 2.1 A/AA selecionadas       |
| Teclado dos 3 diálogos                                                                                                                                | Abertura por Enter, foco inicial, Tab/Shift+Tab, Escape e retorno ao acionador |
| Menu móvel e notificações                                                                                                                             | Navegação por teclado e retorno de foco passaram                               |
| Viewport 390 px                                                                                                                                       | Sem rolagem horizontal na tela verificada                                      |
| Network                                                                                                                                               | Módulo de Relatórios: 0 requisições antes e 1 após a primeira navegação        |
| Reducer                                                                                                                                               | Formulário real passou por invalid → valid → editing sem salvar dados          |
| Profiler, 20 mudanças apenas no contador                                                                                                              | Lista comum: 20 atualizações; lista memoizada: 0 atualizações                  |
| Alteração do filtro na demonstração                                                                                                                   | A lista memoizada voltou a atualizar                                           |

Os JSON completos, tempos do Profiler e árvores acessíveis dos modais são gerados em
`artifacts/dad/`. Os tempos variam por execução e refletem uma lista sintética de 10.000 itens, não
desempenho do portal inteiro. O exemplo usa o componente React Profiler; a gravação na extensão
React DevTools tem roteiro próprio em [apresentação](apresentacao-dad.md).

O axe retorna uma checagem **incomplete** no acionador de notificações quando o popover está
fechado: o alvo de `aria-controls` existe no DOM, mas está fora da árvore acessível por estar
fechado. O teste abre o popover, verifica o diálogo e fecha por Escape. A relação e o ID são
preservados; a regra não foi desativada.

## Limites da auditoria

Não há leitor NVDA instalado nesta máquina. As árvores de acessibilidade foram inspecionadas por
teste e o roteiro de uso com leitor real está preparado, mas esse teste humano ainda precisa ser
executado. Não se declara conformidade WCAG AA completa só com automação.

O fluxo real de autenticação/persistência e as integrações de IA/API permanecem fora deste escopo. A
demonstração usa o modo local já autorizado pelo projeto.
