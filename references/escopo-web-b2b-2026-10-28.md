# Escopo do web — atualização de 28/10/2026

Pedido direto do usuário posterior às decisões anteriores: o portal exclusivo de ADMIN atende empresas B2B e seu contexto de PEV B2B. Remover as funcionalidades de B2C do web por ora.

- Histórico não oferece Entregas B2C nem consultas de cidadãos.
- Recursos administrativos deliveries/citizens e opção de público CITIZENS foram retirados da configuração do portal e dos mocks.
- Links antigos de histórico com tipo removido redirecionam ao histórico B2B, sem reaproveitar o registro selecionado ou filtros de identidade do link antigo.
- Solicitações, agenda, coletas B2B, contatos empresariais, motoristas e recuperação de rejeitadas permanecem no escopo.
- Esta entrega não cria novas telas de PEV e não modifica regras, endpoints ou dados do aplicativo dos cidadãos.
- O discriminador CITIZENS permanece apenas no contrato de identidade da API e nas verificações de negação de acesso. Sua presença não habilita consulta, gestão ou login de cidadão no portal. Consultas administrativas de contas são limitadas a ADMIN por padrão e ESTABLISHMENT quando explicitamente aplicável.

Branch: codex/fluxo-solicitacoes-agenda. Sem commit até aprovação do usuário.
