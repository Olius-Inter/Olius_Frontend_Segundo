# Demonstração de DAD sem API e sem IA

## Executar

```powershell
npm ci
$env:VITE_LOCAL_ADMIN_DEMO = 'true'
npm run dev -- --host 127.0.0.1
```

Use somente a prévia local. Entre com `admin@olius.test` e `OliusTeste123!`. O modo de demonstração
já existente usa dados locais; ele não demonstra autorização ou persistência no backend.

Para repetir as verificações automatizadas:

```powershell
npm run architecture:check
npm run test:admin
npm run test:ui
npm run build
npm run format:check
```

`test:ui` inicia e encerra sua própria prévia local. No Windows usa Edge instalado. Em outros
sistemas, instale o navegador de teste com `npx playwright install chromium`. Os resultados ficam em
`artifacts/dad/` e não entram no Git.

## Acessibilidade: roteiro de apresentação

1. No login, navegue com Tab e Shift+Tab e envie campos vazios. Confira nome dos campos, mensagem de
   erro, foco e acesso ao botão Entrar.
2. No portal, use o link Pular para o conteúdo. Abra detalhes de motorista, agenda e plano com
   Enter. Tab e Shift+Tab devem permanecer no modal; Escape fecha e devolve o foco ao botão de
   abertura. O fundo fica indisponível durante o modal.
3. Abra Notificações por teclado. Escape fecha e devolve o foco. O popover é não modal: não deve
   prender a navegação como os detalhes.
4. Em 390 px, abra o menu. Confira foco contido, botão Fechar e Escape. Navegue sem rolagem
   horizontal. Em Aparência/Acessibilidade, repita nos temas claro, escuro e alto contraste.
5. Com **NVDA ou outro leitor de tela real**, confirme leitura de títulos, links, rótulos, mensagens
   de erro e nomes dos diálogos. Verifique se o fundo do modal não é lido e se o contexto é
   recuperado ao fechar. Marque data, navegador e leitor utilizados.

O passo 5 permanece uma verificação humana: a árvore de acessibilidade salva em `.aria.yml` confirma
a semântica exposta pelo navegador, mas não equivale a escutar um leitor de tela. Zero violações do
axe também não comprova conformidade WCAG AA completa.

## Desempenho: comparação curta e reproduzível

Abra `/demo/desempenho.html` na mesma prévia. Essa página está fora da entrada de produção. Ela usa
10.000 motoristas sintéticos e a mesma função pura de filtragem/ordenação do projeto.

1. No React DevTools, abra **Profiler**, inicie a gravação e clique em Limpar medições.
2. Clique 20 vezes em Atualizar contador. Pare a gravação e compare as duas listas.
3. O contador muda, mas os dados e filtros continuam iguais. Sem memoização, a função refaz o filtro
   e a ordenação e a lista renderiza novamente. Com `useMemo`, o resultado mantém a referência;
   `useCallback` mantém a função passada à lista envolvida por `memo`.
4. Altere Filtrar nomes: as duas listas precisam atualizar. Clique em um motorista nos dois lados e
   confirme a seleção. A otimização não pode bloquear uma mudança necessária.
5. Use Baixar medições para exportar os eventos do componente React `Profiler`.

O teste automatizado coleta `actualDuration`/`baseDuration` pelo callback oficial de `Profiler` e
compara renderizações. A gravação na extensão DevTools é feita durante a apresentação. Os
milissegundos variam por máquina; este experimento não mede o portal inteiro nem a API. O benefício
depende de trabalho repetido e de referências estáveis recebidas por um filho `memo`; não é
justificativa para envolver toda função do projeto com esses hooks.

## Network: carregamento sob demanda

1. Abra DevTools → Network, desative o cache e recarregue a página inicial após o login.
2. Limpe a lista de requisições e entre em Relatórios.
3. Em desenvolvimento aparece `src/pages/AdminReportsPage/index.tsx` ao entrar pela primeira vez. O
   teste verifica zero carregamentos antes e um após a navegação.
4. Para mostrar produção, rode `npm run build` e `npm run preview`; os arquivos têm hash e aparecem
   em `assets/js/` e `assets/css/`. Localize o chunk da página pela navegação. Reabrir uma página já
   carregada pode usar o cache do módulo.

O ponto no código é `src/app/router/index.tsx`: `lazy` carrega as páginas e `Suspense` fornece o
estado de carregamento. Não confunda chunks da aplicação com chamadas HTTP da API.

## useEffect e Context: um exemplo real

Abra `src/contexts/PreferencesContext/index.tsx` e `src/hooks/settings/usePreferences.ts`. O
provider compartilha tema/contraste; o hook consome o contexto. Em Aparência, mude o tema: o portal
inteiro deve mudar. Navegue para outra página e recarregue: a preferência continua.

O efeito depende de `[preferences]` porque sincroniza esse estado com atributos do documento e
`localStorage`. `[]` deixaria alterações posteriores sem sincronização; omitir a lista executaria o
efeito após toda renderização. Não remova dependências para reduzir execuções. O `useMemo` do valor
depende de `[preferences, storageAvailable]`.

Em `src/hooks/useDialogFocus.ts`, o efeito depende de `[ref, open]`: abre o diálogo quando
necessário e limpa listeners, bloqueio de rolagem e foco ao fechar/desmontar.

## Reducer: transições visíveis, sem gravar dados

Abra Motoristas → Cadastrar motorista e `src/hooks/drivers/useDriverForm.ts` junto de
`src/reducers/drivers/driverValidationReducer.ts`.

1. Clique em Validar campos com o formulário vazio: estado `invalid` e erros por campo.
2. Preencha nome, CPF `52998224725` e CNH `84721603955`; valide: estado `valid` e confirmação
   explícita de que nenhum dado foi enviado ou salvo.
3. Altere o nome: volta para `editing` e a confirmação anterior desaparece.

Os valores ficam em `useState`; o reducer concentra as transições da validação. Não existe efeito de
gravação disfarçado nesse exemplo.

## Fontes

- [React Profiler](https://react.dev/reference/react/Profiler).
- [Testes de acessibilidade com Playwright](https://playwright.dev/docs/accessibility-testing).
- [Padrão de diálogo modal do W3C](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
