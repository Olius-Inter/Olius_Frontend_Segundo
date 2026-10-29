# Fluxos de listagem e relatórios — atualização de 26/10/2026

Pedido direto do usuário posterior a `ajustes-portal-admin-2026-10-26.md`. Este documento prevalece sobre as orientações anteriores para os pontos abaixo.

- Remover a seção de Ranking, seus acessos, rotas, filtros e arquivos exclusivos. Não restaurá-la com base nas referências históricas.
- Visualizações de registros abrem em popup sobre a listagem. A tabela mantém filtros e paginação. Links antigos de detalhe e avisos apontam para essa experiência.
- Após cadastro/edição e outras mutações de registros concluídas com sucesso, retornar à listagem correspondente e atualizá-la. Erros de validação ou de API mantêm o formulário aberto. Ações concorrentes aguardam confirmação da versão atual. Contas ainda não possuem listagem global homologada: a tabela mostra somente contas consultadas na sessão, sem presumir um endpoint de listagem.
- Não criar exclusão física sem contrato autorizado. Inativar/anular continua preservando os vínculos de negócio e, após sucesso, retorna à listagem.
- Popups com largura limitada ao conteúdo e à viewport, formulário ocupando a largura disponível, rolagem interna, título acessível, fechamento por Escape, foco inicial e retorno de foco. Omitir seções de histórico sem eventos, evitando cartões vazios.
- Remover faixas, etiquetas e avisos de demonstração da interface. Os mocks locais permanecem isolados, temporários e documentados; as chamadas reais continuam bloqueadas no modo local. A remoção do aviso não autoriza simular persistência no servidor.
- Relatórios passam a ter porta analítica própria para receber dados do Databricks através do backend. Não confundir essa preparação com uma conexão já disponível. Ler `docs/databricks-reports.md` antes de integrar.

As demais decisões de perfil ADMIN, uma única operadora, formulários validados, serviços tipados, CSS Modules, hooks separados, interfaces em `src/types/`, indentação de 2 espaços e ausência de commits continuam vigentes.

## Layout fixo — complemento do pedido

Menu lateral e cabeçalho permanecem visíveis. O shell ocupa a altura da viewport e somente o conteúdo principal possui rolagem; a lateral tem rolagem própria quando a altura disponível não comporta todos os itens. No celular, as barras superiores permanecem visíveis e o menu abre sobre o conteúdo. Trocar de página reinicia a rolagem principal; abrir ou fechar um popup conserva a posição da tabela.
