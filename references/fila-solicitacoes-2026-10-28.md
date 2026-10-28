# Fila de solicitações — atualização de 28/10/2026

Pedido mais recente do usuário: a página Solicitações mostra somente os pedidos PENDING em cartões, inspirados na lista de visitas da agenda. Cada cartão apresenta estabelecimento, endereço, volume estimado, contatos disponíveis, campo de data/hora e botões de aprovar/rejeitar. Não é necessário abrir um detalhe para decidir.

A consulta envia status PENDING ao adaptador e não limita o período inicialmente, incluindo pendências de meses anteriores. Busca, período opcional e paginação permanecem; os filtros não permitem mudar a fila para pedidos aprovados. Histórico de rejeitadas continua separado e recuperações retornam os pedidos à fila.

A lista precisa fornecer revisão atual, ações permitidas e metadados empresariais para habilitar ações diretas. Não há consulta de detalhes para cada cartão nem permissões inferidas apenas do status. Respostas sem metadados conservam as ações indisponíveis. Estes são contratos internos; endpoints operacionais reais permanecem pendentes conforme solicitacoes-agenda-2026-10-28.md.

Após sucesso, o pedido sai da fila e a lista é atualizada, retornando à página anterior se o último item da última página for resolvido. Validação, falhas e conflitos permanecem no cartão. URLs antigas de detalhe continuam abrindo popup para consulta quando necessário.

Mesma branch codex/fluxo-solicitacoes-agenda, sem commit até aprovação.

## Simplificação posterior do usuário

Os cartões da fila passam a mostrar somente o nome do estabelecimento e o endereço. Retirados telefone, e-mail, data do pedido, volume estimado, agendamento e botões de aprovação/rejeição da lista. Esta decisão substitui a aprovação direta descrita acima; permanecem a consulta de pendentes e o histórico separado.

### Informações complementares dos cartões

A pedido do usuário, os cartões exibem novamente a data/horário da solicitação e o volume estimado, junto ao nome e endereço. A apresentação segue a imagem enviada: solicitação à esquerda, litros estimados à direita. Os valores vêm do registro retornado pelo adaptador, sem números fixos. Contatos, agendamento e ações diretas continuam ausentes dos cartões.
