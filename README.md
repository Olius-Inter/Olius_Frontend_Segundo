# Olius Frontend — segundo ano

Frontend web do Olius, desenvolvido com Vite, React e TypeScript.

## Executar

```powershell
npm install
npm run dev
```

O servidor exibirá a URL local no terminal. Para configurar a API, copie `.env.example` para `.env.local` e ajuste `VITE_API_BASE_URL`.

## Navegação

A página inicial está em `/` e a área de motoristas em `/motoristas`. Endereços desconhecidos mostram uma página de não encontrado. A camada de serviço está preparada para consultar `GET /api/v1/drivers`, retornando uma lista de motoristas com `id`, `name`, `cpf`, `cnh` e `status` (`ACTIVE` ou `INACTIVE`). A tela ainda não está conectada ao serviço.

O layout usa o logo Olius e mantém as páginas responsivas para desktop e telas menores.
