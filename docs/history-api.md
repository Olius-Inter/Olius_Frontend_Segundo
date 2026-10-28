> Histórico do frontend anterior. Para o escopo vigente ADMIN, consulte [portal-administrativo.md](portal-administrativo.md), o plano web e as referências de 20/10/2026.

# Histórico de coletas — contrato proposto

A página `/historico` é somente de consulta. Configure `VITE_HISTORY_API_URL` com a URL completa ou caminho relativo acordado com o backend e reinicie o Vite. Sem endpoint, a tela mostra `—` e informa que aguarda conexão. Não usa números demonstrativos.

## Consulta

GET com `credentials: 'include'`, `Accept: application/json` e `cache: no-store`:

```text
{endpoint}?month=10&year=2026&status=ALL&page=1&pageSize=10&scope=own
```

A sessão identifica o estabelecimento. O cliente não envia IDs empresariais escolhidos pelo navegador. O servidor deve validar conta ativa, vínculo e permissões a cada consulta. O frontend não substitui essa autorização. Adaptar o transporte ao provedor real caso a autenticação não use cookie; nunca colocar credenciais em `VITE_*`.

Resposta direta conforme `HistoryData` em `src/types/history.ts`:

```text
establishment: { id: string, name: string }
allowedScopes: ("own" | "collections")[]
query: { month, year, status, page, pageSize, scope } // filtros aplicados
items: { id, date, status, estimatedLiters, confirmedLiters }[]
total: número de registros do período e status selecionados
periodTotal: número de registros do período, antes do filtro de status
totalPages: ceil(total / pageSize), zero quando vazio
impact: { collectedLiters, preservedWaterLiters, avoidedCo2Kg, confirmedBiodieselLiters }
```

- `allowedScopes` sempre inclui `own`; inclui `collections` somente com autorização vigente para consultar retiradas realizadas como coletor. A resposta pertence ao escopo solicitado. A interface separa as visões e remove dados anteriores durante nova consulta ou perda de autorização.
- Mês: 1–12; ano: 2000–2100; página: 1–100000; tamanho: 10. O mês se refere ao fuso `America/Sao_Paulo`. Datas são ISO 8601 com fuso. Ordenar registros do mais recente para o mais antigo, com ID como desempate estável.
- `impact` pertence ao período completo e ao escopo autorizado, independente de `page` e `status`. Deve considerar somente retiradas/destinações confirmadas e fatores ambientais homologados. Nenhum indicador é calculado a partir da página no navegador.
- Métricas/volumes indisponíveis são `null`, exibidos como `—`. Zero é um valor real. Números devem ser finitos e não negativos.
- `REGISTERED`: óleo registrado em armazenamento; `PENDING`, `APPROVED`, `ASSIGNED`, `ARRIVED`: solicitação ainda em andamento, visual **Pendente**; `COLLECTED`: retirada confirmada; `PROCESSED`: processamento confirmado. Aprovação/aceite/chegada não comprovam retirada.
- Filtro `PENDING` deve agrupar os quatro estados pendentes no servidor. Os demais filtros usam o estado correspondente. `ALL` inclui todos os estados definidos neste contrato. Cancelados/rejeitados não pertencem aos cinco filtros propostos; se forem necessários, acordar seu significado e ampliar o contrato antes de habilitar a API. Estados desconhecidos são rejeitados, sem mapeamento silencioso.
- `COLLECTED`/`PROCESSED` exigem `confirmedLiters`; os demais não possuem volume confirmado. `estimatedLiters` pode ser `null`. A tabela identifica explicitamente estimado e confirmado.
- `401` mostra sessão expirada; `403` mostra acesso negado e esconde dados. O login ainda não possui rota integrada; não foi criada uma rota fictícia de autenticação.
- A resposta valida período, escopo, status, IDs únicos, volumes, totais e paginação. Página que deixou de existir deve ser consultada novamente como página 1; mudar os filtros sempre reinicia a página. O servidor não deve devolver registros de outro mês nem ajustar silenciosamente filtros.

As consultas são canceladas ao mudar filtros, tentar novamente ou sair da página. Respostas antigas não substituem a consulta atual. Não há confirmação de coleta/processamento, escrita na API ou persistência de dados pessoais nesta tela.

O endpoint e o contrato ainda precisam ser implementados/homologados pelo backend. Esta entrega não afirma integração real, autorização no servidor nem auditoria de acessibilidade concluídas.
