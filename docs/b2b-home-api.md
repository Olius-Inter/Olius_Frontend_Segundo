# Início web B2B — integração preparada

A página `/` contém o resumo do estabelecimento. A API ainda não existe: não há dados de demonstração, usuário autenticado artificialmente ou URLs fictícias habilitadas. Sem configuração, os valores aparecem como `—`, as ações ficam desabilitadas e a aba do coletor permanece oculta.

## Configuração

Defina URLs completas ou caminhos relativos em `.env.local` quando o backend estiver disponível. Reinicie o Vite após alterar as variáveis.

```dotenv
VITE_B2B_HOME_API_URL=
VITE_B2B_OFFERS_API_URL=
VITE_B2B_REGISTER_OIL_API_URL=
VITE_B2B_REQUEST_COLLECTION_API_URL=
```

As URLs estão separadas para não assumir rotas que ainda não foram aprovadas. `VITE_API_BASE_URL` dos outros serviços não habilita este painel automaticamente.

O cliente foi preparado para sessão por cookie, usando `credentials: 'include'`. A autenticação real, configuração de cookies/CORS e proteção contra CSRF precisam ser acordadas e implementadas no backend. Se o projeto adotar token, adaptar o serviço ao provedor de sessão real. Nenhuma credencial deve ser colocada em variáveis `VITE_*`.

## GET — resumo do início

`VITE_B2B_HOME_API_URL` retorna diretamente o contrato `B2BHomeData`, definido em `src/types/b2bHome.ts`. A sessão identifica o estabelecimento: não se envia um ID escolhido pelo navegador nesta consulta.

Exemplo estrutural para o backend; este JSON não é utilizado como dado da interface:

```json
{
  "user": {
    "id": "usuario-id",
    "name": "Nome do responsável",
    "accountType": "B2B",
    "active": true
  },
  "establishment": { "id": "estabelecimento-id", "name": "Nome empresarial" },
  "periodLabel": "Período informado pela API",
  "impact": {
    "collectedLiters": null,
    "preservedWaterLiters": null,
    "avoidedCo2Kg": null,
    "confirmedBiodieselLiters": null
  },
  "oilStock": {
    "storedLiters": null,
    "reservedLiters": null,
    "availableLiters": null,
    "minimumCollectionLiters": null,
    "canRequestCollection": false,
    "blockedReason": "Saldo aguardando confirmação"
  },
  "canRegisterOil": false,
  "requests": [],
  "requestCount": 0,
  "collector": null,
  "sustainability": null
}
```

- `null` indica métrica indisponível. `0` só deve representar um zero real.
- `requests` traz pedidos recentes, ordenados do mais novo para o mais antigo. A tela mostra até três inicialmente; permite expandir os pedidos retornados. `requestCount` é o total real.
- Pedido: `{ id, estimatedLiters, createdAt, status }`. Status aceitos: `PENDING`, `APPROVED`, `ASSIGNED`, `ARRIVED`, `COLLECTED`, `REJECTED`, `CANCELLED`.
- Datas da API usam ISO 8601 com fuso/UTC. A apresentação de datas usa o horário de Brasília.
- `sustainability`, quando disponível: `{ levelLabel, progressLiters, nextLevelLiters }`, com meta positiva e critérios calculados no servidor.
- Resposta `401`: sessão ausente/expirada. `403`: conta inativa, B2C ou acesso indevido. Esses estados ocultam os dados privados. Um payload não B2B também é rejeitado pelo cliente.
- JSON incompatível, erro HTTP ou falha de rede não habilitam permissões nem geram valores de substituição.

### Credenciamento do coletor

Para exibir `Coletas disponíveis`, `collector` deve corresponder ao estabelecimento da sessão e conter:

```text
id: string
establishmentId: string
kind: "ESTABLISHMENT"
status: "APPROVED" | "PENDING" | "INACTIVE" | "REJECTED"
active: boolean
validFrom: ISO 8601 | null
validUntil: ISO 8601 | null
canViewOffers: boolean
canAcceptOffers: boolean
```

Somente `APPROVED`, ativo, dentro da vigência e com `canViewOffers: true` abre a aba. `null` na vigência significa ausência daquele limite. `canAcceptOffers` controla as ações de aceite/recusa. A expiração remove a aba mesmo se a página continuar aberta.

O backend deve validar novamente a sessão, vínculo empresarial, credenciamento e escopo regional a cada consulta/ação. Ocultar a aba é uma regra de apresentação, não a autorização do servidor.

## GET — ofertas elegíveis

`VITE_B2B_OFFERS_API_URL?establishmentId=...&limit=3`

Resposta: `{ items: B2BOffer[], total: number }`.

Cada oferta contém `id`, `establishmentName`, `regionLabel`, `estimatedLiters`, `windowStart`, `windowEnd`, `expiresAt` (ISO 8601 ou `null`). As ofertas devem estar ordenadas por recência. A tela mostra até três e não apresenta endereço completo nessa etapa.

A API deve restringir as ofertas ao credenciamento autorizado, mesmo que alguém altere o ID enviado. O circuito B2B entre estabelecimentos depende da rede homologada descrita na proposta de arquitetura; não habilitar coletas entre empresas arbitrárias.

### POST — resposta à oferta

Rotas propostas, derivadas da URL configurada de ofertas:

```text
POST {offersUrl}/{id}/accept
POST {offersUrl}/{id}/decline
Body: { "establishmentId": "..." }
```

- Aceite atômico, com um único coletor vencedor. Retornar `409` se a oferta já tiver sido aceita ou mudado de estado. A lista é recarregada nesse caso.
- Recusa vale somente para o coletor atual; não cancela o pedido do gerador.
- Aceitar não confirma retirada, não reduz estoque físico e não produz biodiesel. A confirmação operacional e o QR Code pertencem a outra etapa.

## POST — registrar óleo e solicitar coleta

Registro (`VITE_B2B_REGISTER_OIL_API_URL`):

```text
{ "establishmentId": "...", "liters": number }
```

Solicitação (`VITE_B2B_REQUEST_COLLECTION_API_URL`):

```text
{
  "establishmentId": "...",
  "liters": number,
  "windowStart": "ISO 8601 UTC",
  "windowEnd": "ISO 8601 UTC"
}
```

A interface aceita litros positivos com até duas casas decimais. A solicitação exige saldo/mínimo conhecidos, `canRequestCollection`, volume dentro do disponível, mínimo vigente e janela futura com fim posterior ao início. O horário preenchido é interpretado no fuso local do navegador e enviado com UTC. O servidor deve repetir essas validações e impedir reserva duplicada de saldo.

As ações só ficam ativas quando a conta recebeu autorização e o respectivo endpoint está configurado. A tela aguarda um HTTP de sucesso antes de exibir confirmação e recarregar o resumo. `401/403` acionam nova consulta da sessão; `422` indica violação de regra. Nenhum formulário usa armazenamento local como persistência.

Os POSTs incluem `Idempotency-Key`, reutilizada em tentativas da mesma ação enquanto a interface permanece aberta. O backend deve implementar a deduplicação; cancelar uma requisição no navegador não desfaz uma escrita já recebida pelo servidor.

## Regras consultadas e limites

Base: `Olius_Documento_Mestre.docx`, requisitos de DAD de maio/2026 e `docs/plano-arquitetura-dad-qrcode.md` do workspace documental.

- O web atende B2B; o perfil B2C não recebe este resumo.
- O mínimo de coleta vem da API. Nenhum valor fixo de 50 L foi imposto.
- O saldo disponível considera reservas; o estoque físico muda após a confirmação autorizada da coleta.
- Água, CO₂, biodiesel e níveis dependem de fatores/critérios/destinação validados. A interface não calcula indicadores sem contrato homologado.
- Interfaces/props estão em `src/types`, serviços usam `Promise` e `try/catch`, o acesso HTTP fica fora dos componentes e as respostas são validadas em tempo de execução.
- Os componentes incluem estados de carregamento, vazio e erro, cancelamento de requisições, rótulos dos campos, erros associados aos campos, navegação das abas por teclado e modal com foco/restauração.

Esta entrega prepara a página inicial e os contratos do cliente. Não implementa o backend, login, credenciamento, QR Code, confirmação final de retirada ou proteção global das outras rotas. As demais telas mantêm suas integrações existentes.
