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
