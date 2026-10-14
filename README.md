# Olius Frontend — segundo ano

Frontend web do Olius, desenvolvido com Vite, React e TypeScript.

## Executar

```powershell
npm install
npm run dev
```

O servidor exibirá a URL local no terminal. Para configurar a API, copie `.env.example` para `.env.local` e ajuste `VITE_API_BASE_URL`.

## Navegação

A página inicial está em `/` e a área de motoristas em `/motoristas`. Endereços desconhecidos mostram uma página de não encontrado. A listagem consome `GET /api/v1/drivers`, retornando uma lista de motoristas com `id`, `name`, `cpf`, `cnh` e `status` (`ACTIVE` ou `INACTIVE`). CPF e CNH aparecem mascarados na tela.

O layout usa o logo Olius e mantém as páginas responsivas para desktop e telas menores.

A consulta de motoristas apresenta telas de carregamento, lista vazia e falha, com opção de tentar novamente. Endereços desconhecidos exibem a tela 404. Esses estados usam o mesmo componente visual e preservam a navegação do aplicativo.

## Formulários de motoristas

- `/motoristas/novo`: cadastro com nome, CPF, CNH e status inicial.
- `/motoristas/:driverId/editar`: edição de nome e CNH; CPF mascarado e status somente para consulta. Datas são exibidas quando disponíveis, com tratamento de valores ausentes/inválidos.
- A listagem oferece **Cadastrar motorista** e **Editar** em cada registro.
- A edição reutiliza `GET /api/v1/drivers` para encontrar o ID informado; não pressupõe um endpoint individual. Trata carregamento, erro com nova tentativa, ID ausente e registro não encontrado. Exige a mesma API configurada para a listagem.

As regras em `src/utils/validateDriver.ts` conferem nome obrigatório (3–120 caracteres), CPF com dígitos verificadores, CNH com 11 dígitos sem sequência de dígitos iguais e status permitido. O nome é normalizado e espaços excedentes são removidos; CPF recebe máscara automática. Limites de nome e validação estrutural de CNH são decisões provisórias do frontend, a reconciliar com o contrato da API.

Os campos relacionados usam um objeto de estado no hook `useDriverForm`. Erros aparecem por campo ao sair do campo ou ao validar, com labels, atributos ARIA e foco no primeiro erro. Novas alterações removem o feedback da validação anterior.

**Validar campos** somente confere o preenchimento: nenhum dado é enviado ou salvo. Cancelar, navegar ou recarregar descarta alterações. Não há POST, PUT, PATCH nem armazenamento local dos formulários. Permanecem pendentes envio, persistência, duplicidade de CPF/CNH, consulta individual e autorização administrativa. O status inicial também precisa ser confirmado com o backend.

Escopo baseado no plano `ChatGPT/Olius/docs/plano-arquitetura-dad-qrcode.md` (seções 15 e 16) e nos requisitos DAD do PDF em `ChatGPT/Olius/references/`. Os campos B2B/B2C do DOCX pertencem aos formulários operacionais e não fazem parte deste incremento.

## Responsabilidades da listagem

A página `DriversPage` compõe a tela usando `useDrivers`, que gerencia consulta e estados de carregamento, resultado e erro. A comunicação HTTP continua em `driverService`.

| Componente          | Responsabilidade                                                  |
| ------------------- | ----------------------------------------------------------------- |
| `AppLayout`         | Estrutura visual e navegação da aplicação                         |
| `PageFeedback`      | Mensagens de carregamento, vazio, erro e página não encontrada    |
| `PageHeading`       | Título e descrição, compartilhados pela lista e pelos formulários |
| `DriverTable`       | Cabeçalho da tabela e coleção de linhas com chave por ID          |
| `DriverRow`         | Dados de um motorista e link para editar                          |
| `DriverStatusBadge` | Texto e aparência do status Ativo/Inativo                         |

Esses seis componentes têm funções distintas; os componentes de formulário também permanecem disponíveis. As interfaces da listagem estão em `src/types/driverList.ts`; as do cabeçalho estão em `src/types/page.ts`. Os componentes da tabela recebem dados via props e não acessam serviços.

## Recursos DAD na área de motoristas

- A listagem e a edição usam o hook genérico `useAbortableResource`, cujos tipos compartilhados foram movidos para `src/types/api.ts`. O `AbortSignal` chega ao `fetch`; trocar o ID ou sair da tela cancela a consulta. Cancelamentos não aparecem como erro de usuário.
- `DriversProvider` e `useDrivers` compartilham filtros, resultados e ações entre `DriverFilters` e `DriverListResults`. Consultas e regras de busca ficam no hook `useDriverDirectory`; componentes não acessam serviços.
- Busca local por nome, status e ordenação A–Z/Z–A, com contagem de resultados e estados distintos para lista sem cadastros e busca sem correspondências. Os filtros usam apenas os dados retornados pela API; não há motoristas demonstrativos. A busca ignora diferenças de maiúsculas e acentos e aceita até 120 caracteres.
- Somente status e ordenação são salvos em `olius:driver-list-preferences`, com `_versao: 1`. Dados incompatíveis são descartados; armazenamento bloqueado mantém preferências em memória. Nome pesquisado, nomes de motoristas, CPF, CNH e valores dos formulários não são armazenados.
- `useCallback` mantém o loader estável para que filtros locais não repitam consultas. `useMemo` concentra filtragem/ordenação quando dados ou filtros mudam, sem ordenar o array da API diretamente. A demonstração de desempenho no Profiler permanece pendente.
- O formulário mantém seus campos em um objeto `useState`. Um reducer com State/Action em unions controla edição, validação válida/inválida e campos visitados; qualquer alteração invalida o feedback anterior.
- As mensagens reais do serviço são exibidas no DOM. IDs vazios ou duplicados na resposta são rejeitados para preservar identificação de registros e chaves únicas.
- Filtros têm labels, controles nativos e foco visível. A tabela tem descrição textual e área de rolagem acessível por teclado. Os formulários preservam erros associados aos campos e foco no primeiro erro. A auditoria completa WCAG/leitor de tela continua pendente.

As rotas de motorista já usam lazy loading. Ainda permanecem pendentes autenticação/PrivateRoute com sessão real, integração do envio/persistência e consulta individual do motorista. Nenhum POST/PUT/PATCH foi adicionado. Publicação e histórico de commits são pendências globais; não foram realizados commits ou pushes neste incremento.

## Organização de CSS

Os estilos globais e tokens ficam em `src/styles`; páginas e componentes com regras próprias usam `styles.module.css`. Regras responsivas ficam junto do responsável. Os antigos `styles.css` e `b2b-home.css` da raiz foram substituídos. Consulte o [guia de estilos](src/styles/README.md) para estrutura, imports e formatação com dois espaços e uma propriedade por linha.
