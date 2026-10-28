# Plano do portal web administrativo do Olius

## Escopo vigente em 20 de outubro de 2026

O portal web será destinado às contas ADMIN de uma única empresa compradora e operadora, como a Óleo Amigo. Essa empresa adiciona seus administradores, responsáveis pelo cadastro dos coletadores operacionais e pelas demais funções autorizadas. O cadastro comum de estabelecimento B2B não concede acesso administrativo. A definição deste escopo vem das decisões do produto de 20/10/2026 registradas em `references/regras-atualizadas-2026-10-20.md` e do documento `references/OLIUS Funcionalidades do Administrador.docx`, com referência de 15/10/2026. As decisões posteriores prevalecem em caso de conflito.

Este documento substitui o escopo web do plano anterior `plano-arquitetura-dad-qrcode.md`. O plano anterior permanece como histórico de propostas; sua arquitetura de formulários operacionais web e de disputa de ofertas não deve ser implementada como requisito vigente deste portal.

## Usuários e limites de atuação

- ADMIN consulta e administra as operações autorizadas, cadastra motoristas, analisa solicitações e PEVs e realiza correções justificadas.
- O motorista cadastrado registra a coleta B2B pelo mecanismo operacional aprovado. Conforme o catálogo, não terá login nem painel próprio no MVP.
- O responsável autenticado pelo PEV aprovado registra a entrega B2C.
- Os botões “Registrar óleo” e “Solicitar coleta” pertencem ao B2B e ao PEV, incluindo pontos mantidos por cidadãos. O B2C comum somente leva o óleo e apresenta seu QR; a quantidade da entrega é registrada pelo PEV.
- O nível dos usuários considera óleo registrado; o ranking considera pontos conforme a quantidade de óleo e a regra oficial. Para o B2C comum, o registro vem da entrega confirmada pelo PEV. Limiares e fórmulas dependem dos contratos aprovados; não confundir nível de usuário com certificado ambiental.
- O perfil ADMIN, por si só, não autoriza registrar uma coleta como motorista ou validar uma entrega como responsável pelo PEV.
- O canal do registro operacional, inclusive eventual formulário iniciado por QR, precisa ser confirmado à luz da decisão de restringir o web ao público administrativo. Não presumir a manutenção do antigo formulário público/operacional nem transferir sua implementação para outro canal sem definição.

## Funcionalidades previstas no catálogo

| Área                    | Funções do portal                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Acesso                  | Login, renovação, logout, proteção das rotas e permissões verificadas no backend                                                                                   |
| Usuários                | Consulta controlada, ativação/inativação e criação protegida de administradores                                                                                    |
| Motoristas              | Cadastro, edição permitida, ativação/inativação e indicadores por período                                                                                          |
| PEVs                    | Consulta, aprovação, rejeição e inativação com autoria e histórico                                                                                                 |
| Solicitações B2B        | Análise, aprovação com horário acordado, rejeição e cancelamento nas condições permitidas                                                                          |
| Solicitações de PEVs    | Acompanhamento de pedidos dos pontos mantidos por cidadãos ou estabelecimentos, com regras específicas a alinhar; não presumir os mesmos planos e contratos do B2B |
| Agenda                  | Consulta e reagendamento com horário anterior/novo, motivo e autoria                                                                                               |
| Coletas e entregas      | Consulta, detalhamento e identificação de correções e anulações                                                                                                    |
| Correções               | Operações específicas com motivo e revisão esperada; recálculo pelas rotinas oficiais                                                                              |
| Planos e assinaturas    | Catálogo permitido, contratos, ciclos, reservas e utilização                                                                                                       |
| Financeiro              | Consulta de cobranças, pagamentos, benefícios, reembolsos e exceções de integração                                                                                 |
| Pontos e ranking        | Consulta de resultados oficiais, sem edição livre do saldo                                                                                                         |
| Certificados            | Consulta de progresso, validade e histórico; manutenção de catálogo conforme política aprovada                                                                     |
| Indicadores e auditoria | Filtros definidos, totais vigentes, autoria e histórico autorizado                                                                                                 |

O catálogo completo não constitui compromisso de entregar todos esses módulos na primeira versão de DAD.

## Proposta de primeira entrega de DAD

1. Estrutura do portal administrativo, autenticação e controle de acesso ADMIN.
2. CRUD operacional de motoristas, preservando registros históricos por inativação.
3. Consulta de solicitações B2B e operações de aprovação, rejeição e agendamento conforme contratos disponíveis na API.
4. Consulta de coletas e indicadores básicos por motorista.
5. Feedback de carregamento, validação, erros, paginação e filtros necessários para essas telas.

Essa sequência é uma recomendação de implementação, sujeita aos requisitos da disciplina e à prioridade do grupo. PEVs, correções, financeiro e demais módulos podem compor entregas posteriores conforme definição do produto e disponibilidade dos endpoints.

## Regras que precisam orientar as telas

- Rotas e veículos continuam organizados externamente. Não incluir otimização de rotas, distribuição automática de motoristas ou localização em tempo real neste MVP.
- A agenda registra o horário exato acordado externamente; reagendamentos preservam motivo, autor e histórico.
- Uma conta inativada perde acesso e sessões; reativação exige novo login.
- Aprovação administrativa não contorna limites contratuais ou reservas de solicitações.
- Após registro de coleta, desfazer efeitos exige correção/anulação; não cancelar o pedido como atalho.
- Correções exigem motivo e revisão esperada. Conflitos de revisão pedem releitura, preservando alterações concorrentes.
- Indicadores usam os valores vigentes, excluem operações anuladas e não multiplicam coletas com vários motivos de falha.
- Pontos, certificados e benefícios financeiros seguem as rotinas oficiais; controles administrativos não permitem marcar efeitos como concluídos sem os eventos correspondentes.
- Dados pessoais e financeiros só aparecem conforme necessidade e permissão; tokens QR e hashes de senha não são copiados para logs.

## Integração e pontos ainda pendentes

O catálogo descreve algumas rotas de identidade existentes na Core consultada em 15/10/2026 e informa que os controllers operacionais ainda eram escopo de desenvolvimento nessa consulta. Isso não comprova o estado atual do código ou da publicação em 20/10/2026; revisar a API antes de planejar a integração de cada módulo.

A decisão do produto define uma única empresa operadora. Não planejar seleção de empresa operadora ou isolamento entre múltiplas empresas compradoras como requisito atual. Permanecem as autorizações por perfil e por operação para administradores, estabelecimentos, cidadãos e responsáveis por PEV.

As propostas anteriores de qualquer B2B virar coletor e disputar ofertas não aparecem como funcionalidades neste catálogo. Elas ficam fora da base de implementação do portal e precisam de decisão explícita para retornar ao escopo.

Revalidar o relatório de mudanças no banco contra o schema atualizado e este catálogo antes de implementar migrações. A lista produzida em setembro refletia uma proposta anterior e não deve ser aplicada integralmente como requisito vigente.
