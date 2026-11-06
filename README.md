# Olius — portal administrativo

Portal React/TypeScript para contas **ADMIN** da empresa operadora. O portal trabalha com empresas
B2B e seu contexto de PEV; esse cadastro não concede acesso administrativo automaticamente.

## Executar

```sh
npm install
npm run dev
```

Copie `.env.example` para `.env.local`, configure `VITE_API_BASE_URL` e reinicie o Vite. Na
integração real, é necessária uma conta ADMIN ativa previamente provisionada pela Core; não há
credencial padrão nem ligação direta ao PostgreSQL. Para conferir as telas sem API, use somente a
demonstração local descrita abaixo.

## Áreas

| Área          | Conteúdo                                                                  |
| ------------- | ------------------------------------------------------------------------- |
| Visão geral   | Visitas, litros recolhidos e empresas atendidas no período                |
| Operação      | Solicitações, calendário com múltiplas visitas e histórico de coletas B2B |
| Motorista     | Consulta, cadastro e edição de motoristas                                 |
| Relatórios    | Gráficos do período completo, diretamente na lateral                      |
| Configurações | Perfil, senha, aparência, acessibilidade e cartões de planos              |
| Notificações  | Categorias, paginação, leitura e contagem global no sino                  |
| Administração | Contas e auditoria                                                        |

Login, renovação de sessão, logout, consulta de contas e leitura do perfil utilizam a Core.
Motoristas, solicitações em consulta, agenda em consulta, coletas, indicadores, planos e convites
possuem adaptadores HTTP reais. As operações ainda sem integração permanecem indisponíveis. A
demonstração local optativa utiliza dados fictícios e alterações temporárias em memória.

Consulte [funções integradas e limites](docs/integracao-api-web.md) e
[contrato de convites](docs/integracao-convites.md).

## Estrutura

- `src/components/` e `src/pages/`: pastas próprias com `index.tsx`.
- `src/types/`, `src/services/` e `src/utils/`: tipos, APIs e validações por domínio.
- `src/hooks/`, `src/contexts/` e `src/reducers/`: estado e coordenação.
- `src/app/`: rotas, composição e mocks locais existentes.
- `styles/`: CSS global e CSS Modules fora de src.
- `tests/`: testes existentes fora de src.
- `dist/assets/js/` e `dist/assets/css/`: build minificado, gerado automaticamente.
- Prettier e EditorConfig com indentação de 2 espaços.

## Validar

```sh
npm run architecture:check
npm run build
npm run format:check
npm run test:admin
npm run test:integration
```

Não há script de lint configurado. Os testes locais usam fixtures de protocolo, sem cadastrar contas
reais nem acessar o banco.

## Acesso de demonstração local

Por solicitação do usuário, VITE_LOCAL_ADMIN_DEMO=true em .env.local habilita um login fictício
somente em localhost/127.0.0.1: admin@olius.test / OliusTeste123!. A sessão vive apenas na memória e
não gera JWT, conta real nem gravações. Todas as chamadas à Core ficam bloqueadas nesse modo. Para
integrar a API, definir a flag como false, configurar VITE_API_BASE_URL e reiniciar/recompilar o
Vite.

## Atualização da interface

Agenda, planos, notificações e configurações seguem o pedido mais recente. Os endpoints de edição de
perfil/senha e as operações dos novos módulos ainda dependem do backend.

## Fluxos atuais

Detalhes abrem em popups sobre a tabela. Cadastro/edição e ações concluídas retornam à listagem;
falhas mantêm o formulário aberto. Ranking foi removido e avisos de demonstração foram ocultados. Os
dados locais continuam temporários e separados dos dados reais.

Relatórios consultam indicadores operacionais agregados da API. A integração com Databricks
permanece pendente.

## Convites de administradores

A criação direta com senha foi substituída por convite em Administração → Contas. A página pública é
/convites/aceitar. O aceite projeta somente token e password; confirmação permanece no frontend. A
lista inclui Reenviar/Revogar conforme as permissões do registro. O banco já define prazo de 24
horas e revogação do convite anterior no reenvio. O frontend está conectado aos endpoints de
convites; o envio real depende do serviço de e-mail configurado na API.

## Build e publicação

Execute `npm run build` para verificar TypeScript e gerar `dist/`. Use `npm run preview` apenas para
conferir o resultado localmente. No Render, publique como Static Site com `npm ci && npm run build`,
diretório `dist` e rewrite `/*` para `/index.html`. O arquivo `render.yaml` também permite criar o
serviço por Blueprint.

Configure `VITE_API_BASE_URL` com a origem HTTPS da API, sem `/api/v1`, e
`VITE_LOCAL_ADMIN_DEMO=false` em produção. As variáveis VITE são públicas e entram no build;
recompile após alterar. Não inclua senhas, tokens ou chaves privadas nessas variáveis.

Scripts e testes próprios usam TypeScript. As ferramentas são resolvidas pelas dependências
instaladas. `.env.local`, `node_modules/` e `dist/` permanecem ignorados pelo Git. Componentes
apresentam a interface, hooks coordenam o estado e serviços realizam o acesso HTTP.
`src/app/providers/configureGateways.ts` seleciona adaptadores reais ou demonstração local.
