# Portal administrativo Olius

## Base consultada em 20 de outubro de 2026

Esta implementação segue o catálogo **OLIUS Funcionalidades do Administrador** de 15/10, `docs/plano-web-administrativo.md`, `references/regras-atualizadas-2026-10-20.md` e a seção DAD do PDF oficial de maio/2026. O plano de arquitetura/QR anterior é histórico e não define o portal atual.

Repositórios consultados na branch principal:

- [DB_Segundo, commit 974eb4dcb1c779ad39891f79f3356d7cac7a0cfa](https://github.com/Olius-Inter/DB_Segundo/tree/974eb4dcb1c779ad39891f79f3356d7cac7a0cfa): scripts PostgreSQL 01–08 e `access_control/API_DATABASE_CONTRACT.md`.
- [API_Olius, commit 084ddb43dd1b00cf9a48f474ffbd4f3db39b514b](https://github.com/Olius-Inter/API_Olius/tree/084ddb43dd1b00cf9a48f474ffbd4f3db39b514b): controllers, DTOs, segurança, cookies e documentação de identidade.

### Resultado da análise

- Há três perfis autenticados: ADMIN, ESTABLISHMENT e CITIZENS. Motorista é cadastro operacional sem login. PEV é vínculo de negócio, não perfil de autenticação.
- No schema atual, `request_status_t` contém PENDING/APPROVED/REJECTED/CANCELLED. Coleta física é um registro separado; não criar artificialmente um estado COMPLETED no pedido.
- Revisões usam RECORDED/ANNULLED e `expected_revision`. `correct_collection` e `correct_pev_delivery` preservam histórico e recalculam pelas rotinas oficiais. Cancelar pedido não substitui anular coleta.
- PEV possui exatamente um responsável (cidadão ou estabelecimento), endereço próprio e aprovação com autor/data. Trigger mantém `establishment.is_pev`; esse campo não é um checkbox administrativo livre.
- CPF/CNH de motorista são únicos, nome tem limite físico de 150 caracteres. A política de campos editáveis do futuro controller ainda precisa ser homologada; o formulário reutilizado conserva CPF em consulta e usa nome/CNH na edição.
- Índices contemplam pedido por situação/agendamento, coleta por motorista/estabelecimento/data e PEV pendente. Unicidade e FKs preservam um atendimento por solicitação, responsáveis e vínculos históricos.
- `vw_annual_scores` e `vw_annual_ranking` agregam pontos anuais por público. O data mart acrescenta dimensões, fatos, ponte de motivos e ranking anual; sua atualização não é uma escrita direta do frontend.
- Funções/procedures de agendamento, cancelamento, coleta, entrega, correção e pagamento devem ser chamadas pela API com contexto de auditoria. Logs e rotinas internas não têm acesso direto liberado à Core comum.
- Decisões de 20/10: uma única operadora; ranking por pontos oficiais, sem ordenar por litros; níveis e certificados são conceitos distintos. O frontend não inventa novos fatores, limiares ou desempates.

## Estrutura e acesso

A navegação atual está descrita em [Ajustes de 26/10/2026](../references/ajustes-portal-admin-2026-10-26.md), que substitui a distribuição original do catálogo:

- `/login`: exclusivo para ADMIN ativo; demonstração local optativa.
- `/`: três indicadores operacionais e dois gráficos do período.
- `/operacao/solicitacoes`, `/operacao/agenda`, `/operacao/historico?tipo=b2c`.
- `/motoristas`, `/motoristas/novo`, `/motoristas/:id`, `/motoristas/:id/editar`.
- `/relatorios`: acesso direto na lateral e porta analítica preparada para Databricks.
- `/notificacoes`: avisos e contagem de não lidas.
- `/configuracoes/perfil`, `/configuracoes/aparencia`, `/configuracoes/acessibilidade`, `/configuracoes/planos`.
- `/administracao/contas`, `/administracao/auditoria`.

Comercial, certificados e os demais cadastros foram retirados da interface. Caminhos antigos úteis de motoristas, ranking, relatórios e planos conservam compatibilidade. Fontes B2B antigos continuam históricos e não são montados pelo portal ADMIN.

## Integração real preparada com a Core

Configurar `VITE_API_BASE_URL` com a origem da Core, sem `/api/v1` no final. O frontend acessa exclusivamente os endpoints verificados:

| Método | Caminho                           | Uso no portal                    |
| ------ | --------------------------------- | -------------------------------- |
| GET    | `/api/v1/auth/web/csrf`           | Token mascarado e nome do header |
| POST   | `/api/v1/auth/web/login`          | Login por e-mail/senha           |
| POST   | `/api/v1/auth/web/refresh`        | Renovação coordenada             |
| POST   | `/api/v1/auth/web/logout`         | Encerrar sessão atual            |
| GET    | `/api/v1/users/me`                | Validar perfil ADMIN/ACTIVE      |
| GET    | `/api/v1/users/{id}`              | Consulta autorizada por UUID     |
| POST   | `/api/v1/admin/users`             | Criação protegida de ADMIN       |
| PATCH  | `/api/v1/admin/users/{id}/status` | Ativação/inativação              |

Access token fica em memória; refresh fica no cookie HttpOnly da Core. Login/refresh/logout obtêm CSRF por JSON e usam `credentials: include`. Demais chamadas usam Bearer. O perfil é consultado no servidor, não extraído de um papel inventado/localStorage. A restauração usa uma única renovação por vez; Web Locks coordena abas da mesma origem quando o navegador suporta. Navegadores sem Web Locks só coordenam chamadas da própria aba; evitar sessões concorrentes em múltiplas abas nesses navegadores.

Requisições GET podem repetir uma vez após renovar. Escritas não são repetidas automaticamente. Logout não precisa de access válido. Erro de logout encerra acesso local e informa que a revogação no servidor não foi confirmada. Reativação exige novo login.

Configuração de CORS, cookies SameSite/Secure, HTTPS, conta ADMIN previamente provisionada e disponibilidade da Core são dependências do ambiente. Não foram fornecidas credenciais nem executadas operações reais de cadastro ou alteração de contas.

## Módulos operacionais aguardando backend

Na versão consultada, **somente três controllers** existem: Authentication, Identity e UserAdministration. Não há endpoints operacionais de drivers, PEVs, requests, agenda, collections, deliveries, planos, financeiro, certificados ou auditoria. Tabelas, views e procedures não comprovam que esses endpoints existam.

`src/services/adminGateway.ts` contém portas de integração internas tipadas. **Não é um contrato HTTP proposto e não inventa URLs.** Sua configuração inicial vazia faz a interface mostrar **Integração pendente**, diferente de um retorno real vazio ou de uma falha.

Para conectar um recurso:

1. Ler novamente o catálogo, decisões vigentes, schema/rotinas e o controller real.
2. Implementar um serviço do recurso com Promise/try-catch, transporte autenticado e validação do JSON bruto.
3. Normalizar apenas campos autorizados para `AdminRecord`/`AdminDetail`; nunca propagar QR, hash de senha ou segredos financeiros.
4. Registrar `list`, `detail` e, quando autorizado, `act` em `adminGateway.resources`. Registrar o adaptador específico de motoristas para leitura/salvamento.
5. Mapear filtros, paginação e totais reais. A API calcula indicadores do período completo, exclui anuladas e evita multiplicar uma coleta pelos motivos de falha. Dashboard não soma páginas.
6. Retornar ações autorizadas pelo estado/permissões atuais. Revalidar tudo no backend durante a escrita. Aprovação/reagendamento de solicitação exige horário exato e `agreedAt`; motivo é obrigatório. Revisão desatualizada não pode ser sobrescrita.
7. Correção depende de formulário específico de campos autorizados. A interface não oferece um JSON livre nem edição irrestrita; anulação usa revisão esperada.

Sem adaptador não há chamada de endpoint fictício, sucesso simulado, consulta direta ao PostgreSQL ou ganho local de permissões. O salvamento de motorista fica desabilitado; a validação continua disponível.

## Divergências e pendências documentadas

- O frontend antigo usava sessão por cookie para consultas e pressupunha `/api/v1/drivers`. A Core exige Bearer e não possui esse controller. O portal novo usa o cliente autenticado e remove a pressuposição de drivers.
- Relatórios/ranking/mapa anteriores eram B2B, com contratos propostos e demonstração. Agora as consultas são administrativas e o ranking é por pontos; serviços antigos não são usados nas rotas novas.
- O catálogo tem intenção de auditoria e manutenção comercial, mas a Core comum não acessa logs livremente. Faltam mecanismos de API e políticas de manutenção/retroatividade.
- Regras de nível por “óleo registrado” foram alteradas no produto e ainda precisam de alinhamento com cálculo. Não implementar critérios novos no navegador.
- Correção, anulação, manutenção de planos/certificados, financeiro e formulários de PEV aguardam controllers/DTOs/políticas. Não há botão para confirmar pagamento, conceder pontos ou executar coleta como motorista.
- Proteção frontend não substitui o backend. Não foi validada uma instância publicada nem feita auditoria integral WCAG/NVDA. Navegação, contraste e fluxos reais devem ser conferidos com a API disponível.

## Validação e desenvolvimento

```text
npm run dev
npm run build
npm run format:check
node --experimental-strip-types --test tests/adminValidation.test.mjs
```

O projeto mantém páginas/componentes em pastas com `index.tsx`, CSS Modules por componente, interfaces em `src/types`, hooks e serviços separados, Context/reducer, cancelamento de consultas, lazy/Suspense e formatação de 2 espaços. Não existe script lint no projeto atual. Os testes puros não substituem integração com a Core ou verificação de fluxos operacionais quando os endpoints forem entregues.

## Exceção de demonstração solicitada pelo usuário

Após a entrega, o usuário autorizou um acesso fictício para testar a navegação. A flag VITE_LOCAL_ADMIN_DEMO exige hostname local, sinaliza o modo na tela e bloqueia chamadas à Core. Não provisiona ADMIN no banco, não emite tokens e não deve ser confundida com autenticação real. Credenciais e instruções estão no README.

## Atualização posterior da interface

Ranking removido, detalhes em popup e retorno à listagem após ações concluídas. A fonte dos relatórios tem contrato interno próprio; detalhes em [Databricks](databricks-reports.md) e [decisão vigente](../references/fluxos-listagens-e-databricks-2026-10-26.md). Avisos locais foram ocultados sem alterar a separação entre mocks e chamadas reais.

## Convites — decisão mais recente

Cadastro direto com senha e a chamada POST /api/v1/admin/users foram retirados do frontend. O banco atual possui funções de convite, enquanto a Core consultada ainda não possui controllers do fluxo. Implementadas as telas, portas tipadas e fixtures locais, sem envio real de e-mail. Detalhes e fontes revalidadas em [Convites de administradores](../references/convites-admin-2026-10-26.md).
