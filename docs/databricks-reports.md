# Relatórios preparados para o Databricks

## Fluxo previsto

`AdminReportsPage` → `getAdminReports` → `analyticsGateway.reports` → API autenticada do Olius → Databricks.

Os relatórios deixaram de depender da consulta de indicadores da visão geral. O portal recebe os gráficos já agregados do período completo. A fonte analítica e seu transporte podem ser ligados sem alterar os componentes da tela.

## Contrato interno da interface

`src/types/analytics.ts` define uma porta interna, e não um endpoint HTTP existente:

- Entrada: `from`, `to` no formato `AAAA-MM-DD` e cancelamento por `AbortSignal`.
- Saída: `period`, `generatedAt`, `complete` e `charts`.
- Cada gráfico: `id`, `title`, `unit` (`L` ou `count`) e `values` com `id`, `label` e `value` numérico não negativo.
- O serviço valida período, data de atualização, IDs únicos e valores antes de renderizar. Resposta parcial é sinalizada. Lista de gráficos vazia possui estado próprio.

O formato dos gráficos reaproveita o componente acessível do portal e oferece consulta dos valores em tabela. Se o produto optar por gráficos embutidos ou outros tipos de série, o contrato de visualização deverá ser definido antes de ampliar o adaptador; a implementação atual é preparada para dados normalizados.

## Pendências para integração real

1. Definir com o backend o endpoint de relatório, DTO, autorização por empresa e tratamento de erros.
2. Confirmar quais datasets/consultas do Databricks geram cada série e a regra de agregação, fuso e atualização.
3. Definir como o backend trata execução pendente, falha, resultado parcial e cancelamento. A tela não deve consultar apenas uma página de resultados e apresentá-la como total completo.
4. Implementar o adaptador real em `src/services/analyticsGateway.ts`, usando o cliente autenticado da aplicação após verificar o contrato.
5. Homologar os totais e a data de atualização com os responsáveis pelos dados.

Credenciais do Databricks e acesso às consultas ficam no backend. Não colocar tokens, chaves ou SQL privilegiado em variáveis `VITE_*`, no navegador ou no código dos componentes. Não foi criado endpoint, consulta SQL, embed ou conexão real com o Databricks nesta entrega.

## Dados locais

O adaptador local reutiliza os registros confirmados em memória para gerar séries dinâmicas conforme o período. A seleção local/real permanece centralizada e o modo local continua bloqueando chamadas reais à Core. Os avisos visuais foram removidos por solicitação do usuário; essa remoção não altera o isolamento nem transforma os mocks em persistência real.
