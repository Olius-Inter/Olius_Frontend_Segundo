# Olius — portal administrativo

Portal React/TypeScript para contas **ADMIN** da empresa operadora. O portal trabalha com empresas
B2B e seu contexto de PEV; esse cadastro não concede acesso administrativo automaticamente.

## Executar

```sh
npm install
npm run dev
```

Copie `.env.example` para `.env.local`, configure `VITE_API_BASE_URL` e reinicie o Vite. Na
integração real, é necessária uma conta ADMIN ativa previamente provisionada pela Core; não há
credencial padrão nem ligação direta ao PostgreSQL. Para conferir as telas sem API, use somente a
demonstração local descrita abaixo.

## Áreas

| Área          | Conteúdo                                                                  |
| ------------- | ------------------------------------------------------------------------- |
| Visão geral   | Pendências, visitas de hoje/restantes no mês e evolução no período        |
| Operação      | Solicitações, calendário com múltiplas visitas e histórico de coletas B2B |
| Motorista     | Consulta, cadastro e edição de motoristas                                 |
| Relatórios    | Gráficos do período completo, diretamente na lateral                      |
| Configurações | Perfil, senha, aparência, acessibilidade e cartões de planos              |
| Notificações  | Categorias, paginação, leitura e contagem global no sino                  |
| Administração | Contas e auditoria                                                        |

Login/renovação/logout, perfil, consulta de usuário por UUID, ativação/inativação utilizam os
endpoints verificados da Core. Disponibilidade em produção não foi confirmada. Os demais módulos
exibem **Integração pendente** até receberem adaptadores de endpoints existentes; não mostram dados
fictícios nem confirmam persistência simulada na execução real. A demonstração local optativa
utiliza adaptadores separados, dados fictícios e alterações temporárias em memória.

## Estrutura

- `src/components/` e `src/pages/`: pastas próprias com `index.tsx`.
- `src/types/`, `src/services/` e `src/utils/`: tipos, APIs e validações por domínio.
- `src/hooks/`, `src/contexts/` e `src/reducers/`: estado e coordenação.
- `src/app/`: rotas, composição e mocks locais existentes.
- `styles/`: CSS global e CSS Modules fora de src.
- `tests/`: testes existentes fora de src.
- `dist/assets/js/` e `dist/assets/css/`: build minificado, gerado automaticamente.
- Prettier e EditorConfig com indentação de 2 espaços.

## Validar

```sh
npm run architecture:check
npm run build
npm run format:check
npm run test:admin
```

Não há script de lint configurado. Os testes locais usam fixtures de protocolo, sem cadastrar contas
reais nem acessar o banco.

## Acesso de demonstração local

Por solicitação do usuário, VITE_LOCAL_ADMIN_DEMO=true em .env.local habilita um login fictício
somente em localhost/127.0.0.1: admin@olius.test / OliusTeste123!. A sessão vive apenas na memória e
não gera JWT, conta real nem gravações. Todas as chamadas à Core ficam bloqueadas nesse modo. Para
integrar a API, definir a flag como false, configurar VITE_API_BASE_URL e reiniciar/recompilar o
Vite.

## Atualização da interface

Agenda, planos, notificações e configurações seguem o pedido mais recente. Os endpoints de edição de
perfil/senha e as operações dos novos módulos ainda dependem do backend.

## Fluxos atuais

Detalhes abrem em popups sobre a tabela. Cadastro/edição e ações concluídas retornam à listagem;
falhas mantêm o formulário aberto. Ranking foi removido e avisos de demonstração foram ocultados. Os
dados locais continuam temporários e separados dos dados reais.

Relatórios usam uma porta analítica dedicada; a integração com o backend e o Databricks permanece
pendente.

## Convites de administradores

A criação direta com senha foi substituída por convite em Administração → Contas. A página pública é
/convites/aceitar. O aceite projeta somente token e password; confirmação permanece no frontend. A
lista inclui Reenviar/Revogar conforme as permissões do registro. O banco já define prazo de 24
horas e revogação do convite anterior no reenvio; endpoints da Core e envio real de e-mail ainda são
pendentes.
