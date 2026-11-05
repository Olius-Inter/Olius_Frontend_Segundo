# Arquitetura do frontend

Organização revisada em 31/10/2026 para atender à localização literal exigida nas páginas 6 a 8 do
PDF de requisitos por disciplina. Esta alteração substitui a distribuição anterior em
app/features/shared; preserva os fluxos, rotas e contratos.

## Estrutura

```text
src/
  app/             # Rotas, composição das integrações e mocks locais
  components/      # Cada componente em Nome/index.tsx
  pages/           # Cada página em Nome/index.tsx
  contexts/        # Providers e contextos
  hooks/           # Hooks por domínio e recursos compartilhados
  services/        # Transporte HTTP, serviços e portas por domínio
  types/           # Interfaces e tipos por domínio
  utils/           # Validação, sanitização, formatação e regras puras
  reducers/        # Reducers tipados por domínio
  data/            # Configuração e dados por domínio
  modules/         # Entradas públicas existentes para composição entre domínios
  main.tsx
styles/
  components/      # CSS Modules com o mesmo nome do componente
  pages/           # CSS Modules com o mesmo nome da página
tests/             # Testes Node fora de src
docs/              # Documentação vigente e subpasta historico
```

`modules/` contém apenas as entradas públicas de composição já existentes. Não substitui
componentes, páginas, serviços, tipos ou validações por reexportações: essas implementações ficam
efetivamente nas pastas exigidas.

## Limites

- Componentes e páginas apresentam a interface; hooks coordenam consultas e ações.
- Comunicação externa fica em `src/services/`, organizada por recurso/domínio.
- Serviços não importam componentes, páginas, contextos, hooks ou composição app.
- Tipos ficam em `src/types/` e não dependem das implementações.
- `app/providers/configureGateways.ts` conecta os adaptadores. Mocks permanecem isolados em
  `app/mocks`, carregados somente no modo local autorizado.
- Rotas continuam sob demanda com React.lazy e Suspense. Mover arquivos não habilita endpoints nem
  funcionalidades históricas.
- O backend de IA será entregue por outro time; sua interface e portas são preservadas.

## Extensões e estilos

Somente `.ts` e `.tsx` ficam dentro de `src/`. Os CSS Modules ficam em `styles/`, na raiz do
projeto, para cumprir também a leitura literal de "todos os arquivos" do PDF. O componente importa
seu módulo por caminho relativo. Os testes TypeScript ficam em `tests/`; não há JavaScript de
autoria manual em `src/`.

## Verificações

```sh
npm run architecture:check
npm run format:check
npm run test:admin
npm run build
```

O verificador confere extensões, pastas exigidas, index.tsx, resolução de imports, dependências dos
serviços/tipos, ausência de fetch em componentes/páginas e ciclos. Os testes existentes validam
autenticação/transporte, validação administrativa e transições de solicitações. Integração real com
a Core e auditoria integral de acessibilidade continuam dependendo dos ambientes e verificações
específicos.
