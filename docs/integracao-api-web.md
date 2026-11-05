# Integração do portal com a API existente

Somente o frontend foi alterado. Contratos conferidos nos controllers e DTOs locais da API Java; a
disponibilidade da mesma versão na AWS deve ser validada no deploy.

## Integrado nesta etapa

| Área          | Endpoints e comportamento                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| Motoristas    | GET/POST /api/v1/admin/drivers, GET/PATCH /{id}, PATCH /{id}/status, GET /{id}/metrics                            |
| Solicitações  | GET /api/v1/admin/collection-requests e GET /{id}; nome/endereço/contatos por GET /api/v1/users/{establishmentId} |
| Agenda        | Consulta todas as páginas de solicitações APPROVED e filtra scheduledAt no período; somente leitura               |
| Coletas B2B   | GET /api/v1/admin/collections e GET /{id}; POST /{id}/annulments com justificativa e expectedRevision reais       |
| Dashboard     | GET /api/v1/admin/environmental-summary; indicadores B2B oficiais do período                                      |
| Relatórios    | Mesma consulta agregada, gráficos de resultado e volume B2B; não é integração Databricks                          |
| Planos        | GET /api/v1/subscription-plans público, sem renovar sessão                                                        |
| Convites      | Integração anterior preservada; detalhes em integracao-convites.md                                                |
| Contas/perfil | Consulta por UUID, ativação/inativação e leitura do próprio perfil já existentes preservadas                      |

Motoristas são criados ACTIVE pela API. Solicitação de cadastro INACTIVE é recusada antes do POST,
orientando cadastrar ativo e inativar depois. Edição conserva CPF somente leitura; envia nome/CNH.
Ativação e inativação enviam apenas status; o motivo do formulário genérico não faz parte desse DTO.
Dashboard mostra visitas, litros e empresas efetivamente atendidas no período, sem métricas
simuladas. Preço anual, destaque e benefícios extras não existem no catálogo: não são
calculados/inventados. Anulação preserva a coleta e exige confirmação da nova revisão na resposta.
Correção/restauração aguardam formulários específicos; não se envia JSON livre ou se reproduzem
fatos antigos sem confirmação.

## Limites conhecidos e próxima etapa acordada

- Aprovação/rejeição/reagendamento/cancelamento de solicitações ainda não foram habilitados: a
  adequação dos formulários de motivo e acordo foi adiada pelo usuário.
- Busca textual não é suportada nesses endpoints: o adaptador recusa filtro não vazio com mensagem
  para limpar Buscar. Não filtra só uma página nem ignora o filtro silenciosamente. A revisão da UI
  de filtros fica para depois. Paginação base um da tela é convertida para base zero no transporte.
- Datas civis do portal são convertidas para [from, until) em Brasília, incluindo todo o dia final.
  Motoristas usam período nos indicadores, não na data cadastral.
- Agenda: from/until de solicitações se referem a requestAt, portanto não são usados para filtrar
  agendamentos. A consulta composta verifica todas as páginas antes de marcar complete=true. Limite
  de 10.000 solicitações aprovadas; acima disso há erro explícito, sem agenda parcial disfarçada.
  Mudança do total ou IDs duplicados durante paginação também exige atualizar. Não há snapshot
  transacional entre requisições e mudanças com mesmo total podem deslocar páginas.
- Não existe revisão operacional de solicitação no DTO: agenda usa revision=null e
  canReschedule=false.
- Dados empresariais são consultados por IDs únicos e mantidos apenas durante a consulta. Se o
  perfil retornar 403/404, exibe identificador e endereço indisponível. Demais falhas são
  propagadas.
- Na tabela de coletas, motorista aparece por UUID, sem buscar documentos pessoais para rotular
  linhas.
- Notificações, auditoria, edição de perfil/senha, recuperação de rejeitadas e configurações
  SMTP/CORS/AWS permanecem fora desta etapa. Nenhum endpoint hipotético é registrado.

## Validação e publicação

Executar build, architecture:check, testes de contrato e Prettier nos arquivos alterados. Testes
usam fixtures HTTP, sem disparar convites, criar contas ou anular coletas reais. Depois de revisar o
diff e publicar a branch/PR, fazer deploy no Render do commit aprovado. Validar com ADMIN real:
motoristas (cadastro/edição/status), solicitações/histórico, agenda, coletas, indicadores e planos.
Anulação real deve usar uma coleta de teste autorizada. Não há alteração no repositório da API nem
configuração automática da AWS nesta entrega.
