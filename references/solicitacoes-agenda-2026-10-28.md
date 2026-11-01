# Solicitações e agenda — decisão de 28/10/2026

Pedido direto do usuário, posterior às decisões anteriores de agendamento.

- O ADM conversa externamente com o estabelecimento. O portal fornece apenas telefone/e-mail disponíveis; não cria conversa nem registra suposta interação.
- Solicitação em popup, sem situação nem histórico/autoria na confirmação. Essas informações continuam no domínio e nas listagens.
- Um único campo: data e horário programados para a coleta. Aprovar em verde, rejeitar em vermelho, editar agendamento após aprovação. Sem campo de motivo ou data do acordo neste fluxo.
- Rejeição preserva o pedido. Histórico → Solicitações rejeitadas permite recuperar para PENDING e analisar novamente. Recuperar não aprova, não agenda e não confirma coleta. ID e trilha local são preservados.
- Ações dependem das capacidades retornadas pelo adaptador e da revisão consultada. Operações já realizadas não são reabertas pelo formulário.
- Reagendamento na agenda usa o mesmo campo único, preservando o horário anterior nos eventos internos. O popup fecha e a lista/agenda recarrega após sucesso.

## Integração pendente

Core consultada em main: árvore 6fb47b05f56b7ab198734ca32d3173ae69c7eb88, sem controllers de solicitações/agenda. O contrato do banco ainda exige agreed_at e motivo em schedule_collection_request; reject_collection_request exige motivo e só aceita PENDING. Não existe recuperação de REJECTED documentada. Fonte: https://github.com/Olius-Inter/DB_Segundo/blob/main/PostgreSQL/access_control/API_DATABASE_CONTRACT.md (blob ed64840c162eea957b79dfd203a7982eda8bccba).

As portas internas do frontend refletem a nova decisão; não são endpoints homologados. O backend precisa revisar transições, recuperação, auditoria e DTOs antes da integração. Nenhum motivo ou horário do acordo fictício é enviado para satisfazer o contrato antigo. O funcionamento atual está nos mocks locais autorizados; produção conserva integração pendente.

Branch de trabalho: codex/fluxo-solicitacoes-agenda. Nenhum commit autorizado nesta entrega.
