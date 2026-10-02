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
