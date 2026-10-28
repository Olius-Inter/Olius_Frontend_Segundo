# Regras atualizadas do Olius em 20 de outubro de 2026

Registro das decisões informadas diretamente pelo responsável pelo produto nesta data. Estas decisões prevalecem sobre propostas e documentos funcionais anteriores nos pontos de conflito. O registro não confirma que as mudanças já estejam implementadas no banco, na API ou nas interfaces.

## Perfis e ações no aplicativo

| Participante                                   | Registrar óleo armazenado | Solicitar coleta | Papel na entrega B2C                                                                     |
| ---------------------------------------------- | ------------------------- | ---------------- | ---------------------------------------------------------------------------------------- |
| Estabelecimento B2B                            | Sim                       | Sim              | Pode receber entregas quando também estiver registrado como PEV                          |
| Cidadão B2C sem atuação como PEV               | Não                       | Não              | Leva o óleo a um PEV e apresenta seu QR Code                                             |
| PEV com responsável cidadão ou estabelecimento | Sim                       | Sim              | O responsável registra a quantidade efetivamente recebida do doador identificado pelo QR |

PEV é um ponto de coleta cadastrado, mantido por pessoa ou estabelecimento. Um cidadão que atua como responsável por PEV possui as ações operacionais desse papel; as restrições do B2C comum não eliminam as permissões do PEV.

Os botões “Registrar óleo” e “Solicitar coleta” ficam disponíveis somente ao B2B e ao PEV. Essas ações se referem ao óleo sob responsabilidade do estabelecimento ou ponto. A aprovação, a situação do ponto e as demais condições operacionais continuam seguindo as regras aplicáveis; esta decisão não concede autorização a qualquer cadastro pendente.

## Entrega de óleo pelo B2C

O cidadão B2C leva o óleo ao PEV e apresenta seu QR Code. Ele não precisa registrar previamente o óleo nem criar uma solicitação de retirada.

O responsável pelo PEV identifica o cidadão pela leitura do QR e registra a quantidade recebida. O sistema guarda essa quantidade na entrega vinculada ao cidadão e ao ponto, atualizando os históricos e os efeitos aplicáveis. A origem da quantidade registrada para esse B2C é a confirmação do PEV, e não um lançamento prévio feito pelo cidadão.

## Nível e ranking

- O nível do usuário passa a ser determinado pela quantidade de óleo registrado.
- O ranking passa a ser ordenado pelos pontos obtidos de acordo com a quantidade de óleo, aplicando a regra oficial de pontuação.
- Litros registrados, pontos e nível são informações diferentes; o ranking não deve ordenar diretamente por litros.
- Para o B2C comum, o registro de quantidade vem da entrega confirmada pelo PEV, pois ele não possui a ação de registrar óleo.
- Não foram definidos nesta decisão novos limiares de nível, fórmula de pontos, período de acúmulo ou critérios de desempate. Não inventar esses valores. A aplicação exata do termo “óleo registrado” nos níveis B2B/PEV deverá ser alinhada com o contrato de cálculo antes da implementação.
- Esta mudança trata dos níveis de usuários e do ranking. Não altera, por si só, metas ou regras dos certificados ambientais.

## Empresa operadora e administradores

Haverá uma única empresa compradora e operadora do aplicativo, como a Óleo Amigo. O escopo atual não prevê várias empresas operadoras independentes compartilhando a instalação.

Essa empresa adiciona suas contas ADMIN. Os ADM são as pessoas responsáveis por cadastrar os coletadores operacionais e exercer as demais funções administrativas previstas no catálogo, conforme suas permissões.

O web permanece destinado às contas administrativas dessa empresa. O cadastro de um estabelecimento B2B, de um cidadão ou de um PEV não cria automaticamente uma conta ADMIN.

Os estabelecimentos e os cidadãos continuam com o esquema de participação anterior, incorporando as alterações registradas aqui. A definição de uma única operadora não transforma os estabelecimentos participantes em empresas administradoras.

## Efeito sobre os documentos anteriores

- O planejamento de múltiplas empresas administradoras deixa de ser pendência do escopo atual.
- Requisitos de “Registrar óleo” e “Solicitar coleta” precisam contemplar também os PEVs mantidos por cidadãos, respeitando suas autorizações e condições específicas.
- O fluxo do B2C comum deve dispensar cadastro prévio de óleo e pedido de coleta.
- Telas, consultas, cálculos e relatórios devem separar nível por óleo registrado e ranking por pontos.
- Documentos e prompts antigos devem ser lidos em conjunto com este registro antes de implementar alterações.
