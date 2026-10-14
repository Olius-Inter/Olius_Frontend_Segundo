# Pontos de coleta e habilitação B2B

## Regras consultadas

Fontes locais: `references/Olius_Documento_Mestre.docx` (seções 5/RN01, RN13, RN14; 6.3; RF07; 14) e `docs/plano-arquitetura-dad-qrcode.md` (distinção entre PEV e coletor B2B homologado).

- RN01: operar somente na área homologada pela BioPower; informar **Fora da área de cobertura** quando aplicável.
- RF07/seção 6.3: GPS, distância, aberto agora, tipo, selo, endereço, horário e rota. O documento atribui originalmente a consulta ao cidadão; esta tela reaproveita a consulta em B2B sem converter o perfil.
- RN13: destaque pago é identificado como **Patrocinado**, conforme a informação do servidor. Nenhum destaque é inferido por plano.
- RN14: API retorna somente endereço público autorizado do ponto. Não incluir CPF, dados privados de contato ou volumes comerciais.
- O documento prevê mudança para ponto de coleta, com detalhes ainda em aberto. Conforme a orientação do usuário, o convite abre o fluxo de formulário; o formulário será enviado depois. Essa entrega não inventa campos nem ativa cadastro artificialmente.
- PEV que recebe entregas voluntárias e coletor que transporta de outros B2Bs são habilitações diferentes. Tornar-se ponto não concede automaticamente acesso às ofertas B2B.

## Configuração

```dotenv
VITE_COLLECTION_MAP_API_URL=
VITE_MAP_TILE_URL=
VITE_MAP_TILE_ATTRIBUTION=
```

Endpoint vazio: sem dados fictícios, permissões nem marcadores. Tiles e atribuição precisam ser configurados com o provedor cartográfico aprovado. Leaflet 1.9.4 faz zoom, arraste e seleção dos pontos. O mapa só é inicializado com centro recebido da API e configuração cartográfica; a lista permanece utilizável sem tiles. Tiles mostram apenas os marcadores da página e o ponto próprio autorizado.

Referências técnicas: [Leaflet](https://leafletjs.com/) e [política de tiles OSM](https://operations.osmfoundation.org/policies/tiles/). Se usar OSM, manter atribuição visível e cumprir sua política; não implementar download em massa/offline. Configuração de tiles é código local confiável; texto da API é inserido como texto, nunca HTML.

## GET de consulta

```text
{endpoint}?search=...&radiusKm=10&openNow=false&type=ALL&withSeal=false&page=1&pageSize=10
```

Após ação explícita **Usar minha localização**, enviar também `latitude`/`longitude`. O navegador solicita permissão; se negada, a busca por texto continua disponível. Coordenadas não são persistidas. Busca textual limpa o GPS anterior; a API resolve o endereço/nome e aplica os filtros. Sem busca/GPS, centralizar no estabelecimento autorizado na sessão; se não houver localização, retornar `UNKNOWN`.

Raio permitido: 5/10/25/50 km; `type`: `ALL`/`PEV`/`ESTABLISHMENT`; página: 1–100000; tamanho: 10; texto máximo: 120 caracteres. API calcula distâncias/abertura e aplica filtros em todo o conjunto antes de paginar. Ordenar proximidade com desempate estável. Horários/abertura consideram o fuso local e calendário do ponto. Não geocodificar com um serviço público sem acordo de uso.

Sessão por cookie (`credentials: include`), sem ID empresarial escolhido pelo navegador. Backend deve validar conta B2B ativa, vínculo e acesso a cada consulta. `401` e `403` ocultam pontos privados e permissões. Login, cookies/CORS e autorização real ainda dependem do backend.

Contrato direto `CollectionMapData` em `src/types/collectionMap.ts`:

```text
accountType: "B2B"
establishmentId: string // estabelecimento autorizado na sessão
query: MapQuery // filtros recebidos e aplicados
center: { latitude, longitude } | null
coverage: "COVERED" | "OUTSIDE" | "UNKNOWN"
collector: MapCollector
items: CollectionPoint[]
total: número de resultados dos filtros
totalPages: ceil(total / 10)
```

`CollectionPoint`:

```text
id, name, address: string
ownerEstablishmentId: string | null
coordinates: { latitude: number, longitude: number }
type: "PEV" | "ESTABLISHMENT"
active: true
approvalStatus: "APPROVED"
covered: true
scheduleLabel: string | null
openNow: boolean | null
distanceMeters: number | null
seal: "BRONZE" | "SILVER" | "GOLD" | null
sponsored: boolean
marker: "POINT" | "PERSON"
```

Pontos inativos/não aprovados/fora de cobertura não entram na consulta. `PERSON` usa pessoa branca sobre azul; `POINT` usa marcador amarelo. Distância/horário desconhecidos permanecem indisponíveis. `OUTSIDE`/`UNKNOWN` exigem resultados vazios. Em `COVERED`, fornecer centro válido. A rota abre o Google Maps com o destino retornado, sem calcular trajeto fictício.

## Cadastro e habilitação

`MapCollector`:

```text
status: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "INACTIVE"
active, canApply, canViewRequests, canViewCollections: boolean
ownPoint: CollectionPoint | null
```

1. Usuário comum consulta mapa/lista. `NONE` não libera solicitações nem operações de coleta.
2. **Vire Coletor** abre `/mapa/virar-coletor`; por enquanto, essa rota informa que o formulário será disponibilizado e permite voltar.
3. Futuro formulário registrará a localização e os dados definidos pelo usuário. O servidor cria o cadastro e retorna o estado real; o frontend não troca o perfil nem usa localStorage para conceder poderes.
4. `PENDING` mostra cadastro em análise, sem convite para reenviar nem acesso às operações.
5. `APPROVED` e `active: true` removem o convite. `ownPoint` deve existir, ser aprovado/ativo/coberto, ter `marker: PERSON` e pertencer a `establishmentId`. A localização vem do formulário persistido no servidor, nunca do GPS atual do navegador.
6. `canViewRequests`/`canViewCollections` são permissões distintas. Antes da habilitação, devem ser falsas. Aprovar um PEV não libera ofertas de transporte entre B2Bs. A área operacional existente mantém sua validação própria de homologação.
7. Rejeição/inativação não mantém ponto próprio nem permissões. `canApply` decide se pode tentar novo cadastro. O backend revalida tudo ao consultar ou executar uma operação.

Esta entrega não contém formulário definitivo, POST de cadastro, confirmação de entregas nem novo fluxo operacional. Consulta cancelável ao trocar filtros/sair da rota, validação de resposta, estados de erro/vazio e alternativa textual ao mapa estão implementados. Não foi concluída auditoria completa de acessibilidade.
