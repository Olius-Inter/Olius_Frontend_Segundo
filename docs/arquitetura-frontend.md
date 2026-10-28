# Arquitetura do frontend

Refatoração solicitada em 27/10/2026. As URLs e as decisões funcionais anteriores continuam válidas, inclusive remoção do Ranking e convite de ADMIN. Esta organização substitui os diretórios técnicos globais anteriores.

## Onde colocar código

- src/app/router: rotas, redirecionamentos e composição das áreas administrativas. As páginas continuam carregadas por lazy.
- src/app/layouts: estrutura visual da aplicação.
- src/app/providers: composição dos providers e conexão dos adaptadores.
- src/app/mocks: fixtures e adaptadores locais existentes; carregados apenas com a flag local autorizada.
- src/features: auth, drivers, admin-records, dashboard, accounts, invitations, settings, notifications, schedule, reports e ai.
- src/shared: transporte HTTP, hooks genéricos, validação de UUID/datas, componentes genéricos, estilos e tipos compartilhados.

Cada funcionalidade usa apenas os diretórios necessários: pages, components, hooks, api, types, validation, lib, model, providers e tests. Componentes e páginas mantêm pasta com index.tsx e estilos CSS Modules próximos. Interfaces de props ficam nos arquivos de tipos correspondentes.

As funcionalidades legacy-b2b-home, legacy-history, legacy-map e legacy-reports preservam código anterior que não integra as rotas administrativas atuais. Sua migração não cria novos acessos nem restaura propostas funcionais antigas.

## Dependências

app → features → shared. Shared não conhece os módulos. Features não importam app. Uma funcionalidade acessa outra por uma interface pública pequena: index.ts para hooks/componentes/validações compartilhados, api.ts para serviços necessários, contracts.ts para tipos. Imports internos da própria funcionalidade são relativos. App pode conectar os pontos concretos de entrada de cada módulo.

O mecanismo genérico de filtros, tabelas, detalhes e ações permanece em admin-records, porque é usado por solicitações e coletas B2B. Dividi-lo em cópias por tela duplicaria o fluxo atual. A composição das áreas do menu fica em app/router/pages.

## API e estado

shared/api/coreClient.ts conserva URL base, CSRF, Bearer em memória, renovação concorrente, logout e cancelamento. Endpoints e validação da resposta ficam em features/<nome>/api. Nenhum endpoint foi acrescentado ou renomeado.

Perfil/planos, notificações, agenda e motoristas possuem portas próprias. App conecta implementações locais somente quando a flag e o hostname permitem; em produção, as portas ainda não implementadas conservam o estado de integração pendente. Contratos internos não confirmam endpoints reais. Convites preservam payload de aceite somente com token e senha. Relatórios mantêm o contrato para dados analíticos do backend/Databricks.

Os providers de perfil e notificações conservam uma instância por sessão. Preferências permanecem versionadas no navegador. Filtros existentes na URL, cancelamentos e controle de concorrência foram preservados. Não foi introduzida biblioteca de cache ou novo gerenciador de estado.

## Desempenho

As rotas continuam sob demanda. Os mocks administrativos agora são importados dinamicamente pela composição local, evitando carregar suas fixtures na execução normal de produção. A mudança de diretórios, isoladamente, não representa ganho de desempenho.

## Comandos

- npm run architecture:check: limites entre camadas, interfaces públicas e ciclos de imports.
- npm run format:check: Prettier com a configuração existente.
- npm run test:admin: validação administrativa e transporte/autenticação.
- npm run build: TypeScript e Vite.

Não há comando lint configurado. Dependências, arquivos públicos de terceiros e dist ficam fora da formatação. Nenhum commit é criado pela refatoração.

## Resultado da verificação

- TypeScript e build de produção concluídos.
- Nove testes existentes passaram.
- Prettier confirmou todos os arquivos abrangidos pela configuração.
- Verificação de arquitetura: 301 arquivos TS/TSX/CSS, sem imports inexistentes, ciclos ou violações de camadas.
- Inspeção visual pendente: Computer Use não conseguiu determinar com segurança a URL do navegador e encerrou a sessão de automação.
- O aviso já existente do PostCSS sobre a opção from permanece; o build foi concluído.

O escopo vigente exclui operações e consultas de cidadãos no web. Consulte references/escopo-web-b2b-2026-10-28.md.
