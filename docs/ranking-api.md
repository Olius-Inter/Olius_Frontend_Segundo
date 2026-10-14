# Ranking B2B — integração preparada

A rota `/ranking` apresenta exclusivamente estabelecimentos. Não existe seleção de cidadão nem consulta a ranking B2C. Sem API, a posição e os litros são `—`; não há participantes ou conquistas fictícios.

## Configuração e consulta

Defina `VITE_RANKING_API_URL` após homologar o contrato abaixo e reinicie o Vite. A consulta usa sessão por cookie (`credentials: 'include'`), JSON e `cache: no-store`. Autenticação, cookies/CORS e autorização precisam ser implementados no servidor. Não inserir credenciais em variáveis `VITE_*`.

```text
GET {endpoint}?period=MONTH&month=10&year=2026&page=1&pageSize=10
```

- `period`: `MONTH` (mês corrente), `YEAR` (ano corrente), `ALL` (geral). Mês/ano iniciais seguem Brasília. Em `YEAR`, o servidor ignora o mês; em `ALL`, ignora mês/ano para o cálculo. Os filtros enviados são repetidos em `query` sem ajuste silencioso.
- A sessão identifica o estabelecimento ativo autorizado. Não se envia ID empresarial escolhido pelo navegador nem categoria B2C.
- `401`: sessão expirada. `403`: conta inativa, perfil sem autorização ou B2C. A interface oculta dados privados nesses estados; a proteção real é do backend. Login ainda não possui rota integrada.

Resposta direta, definida em `src/types/ranking.ts`:

```text
accountType: "B2B"
establishment: { id: string, name: string } // estabelecimento da sessão
query: { period, month, year, page, pageSize }
periodLabel: string
criteria: string // critérios e abrangência territorial informados pelo servidor
ownPosition: { rank: number | null, confirmedLiters: number | null } | null
podium: RankingEntry[] // até três primeiros do período completo
items: RankingEntry[] // página atual
total: número de participantes elegíveis
totalPages: ceil(total / pageSize)
achievements: { id, title, description, earnedAt }[] | null
```

`RankingEntry`: `{ establishmentId, name, city, rank, confirmedLiters }`. Os nomes e cidades são rótulos públicos autorizados pelo backend; não enviar endereços, CPF ou informações privadas. A posição do estabelecimento vem do período completo, mesmo quando não aparece na página atual. `null` significa indisponível; `0` somente um zero real.

## Regras para homologação

- Classificar por litros de retiradas confirmadas, em ordem decrescente. Não considerar registros de estoque, pedidos pendentes, aprovados ou aceitos como coleta confirmada.
- Backend determina elegibilidade, abrangência, desempate e ranking real. Em empates, posições podem se repetir; a ordenação entre empatados deve ser estável. Não recalcular posições no cliente.
- Definir a atribuição entre gerador e coletor para evitar contar a mesma retirada duas vezes. O ranking proposto compara estabelecimentos geradores; ser também coletor não acrescenta automaticamente os volumes de terceiros.
- `podium` é independente da página, contém os primeiros participantes na ordem do servidor e coincide com o início da primeira página. O destaque central usa o primeiro participante, sem fabricar uma vitória do usuário. O selo aparece somente se o ID corresponder ao estabelecimento da sessão.
- `achievements` pertence ao estabelecimento autorizado e ao período selecionado. `null` indica funcionalidade indisponível; array vazio indica nenhuma conquista. Retornar até 100 conquistas; se for necessário ultrapassar esse limite, ampliar o contrato com paginação própria. `earnedAt` usa ISO 8601 com fuso. Metas e critérios são confirmados pelo servidor; o frontend não inventa medalhas por faixas de litros.
- IDs únicos, posições positivas, valores finitos/não negativos, ordenação, totais, paginação, período e consistência entre pódio/lista/posição própria são validados no cliente. Respostas B2C são recusadas. O servidor deve conferir autorização e escopo novamente em cada requisição.
- Mudança de período reinicia a página. Consultas anteriores são canceladas ao mudar filtros, atualizar ou sair da rota. Uma página removida pode ser recuperada pelo botão de voltar à primeira página.

Esta entrega prepara a consulta e o visual. A API real e suas regras ainda precisam ser implementadas/homologadas. Não há publicação, POST, alteração de perfil, auditoria completa de acessibilidade nem concessão local de conquistas.
