# Build e publicação

```sh
npm run build
npm run preview
```

O primeiro comando verifica TypeScript e gera a aplicação estática. O segundo serve o resultado
localmente para conferência; não é um servidor de produção.

## Saída gerada

```text
dist/
  index.html
  assets/
    js/           # Entradas e chunks JavaScript com hash
    css/          # CSS extraído com hash
  ...             # Arquivos copiados de public, preservando seus caminhos
```

`vite.config.ts` controla os nomes e diretórios. O build ajusta as referências entre HTML, JS, CSS e
assets. Não mover arquivos manualmente dentro de dist.

## Minificação

JS e CSS continuam minificados para produção: espaços, indentação e outros elementos desnecessários
são reduzidos para diminuir o tamanho dos arquivos. Isso pode deixar cada arquivo em uma linha. O
código-fonte permanece legível e formatado; a saída gerada é recriada no próximo build.

Separar JS e CSS é uma convenção de organização, sem ganho de desempenho por si só. Os hashes e o
carregamento sob demanda das páginas são mantidos.

O PDF proíbe `.js`/`.jsx` dentro de `src/`; isso não proíbe JavaScript compilado em `dist/`,
necessário para execução no navegador. CSS e testes também ficam fora de src para atender à redação
literal sobre extensões.

## Referências

- [Opções de build do Vite](https://v8.vite.dev/config/build-options).
- [Minificação na MDN](https://developer.mozilla.org/en-US/docs/Glossary/Minification).
- [Publicação de site estático](https://vite.dev/guide/static-deploy).

`dist/` permanece ignorado no Git e no Prettier. A entrega é o código e sua configuração
reproduzível; este trabalho não publica o site nem cria commits.

## Render

Publicar como Static Site, com `npm ci && npm run build` e diretório `dist`. O arquivo `render.yaml`
também permite criar o serviço por Blueprint. Para React Router, configurar rewrite `/*` para
`/index.html`. Definir `VITE_API_BASE_URL` com a origem HTTPS da API, sem `/api/v1`, e
`VITE_LOCAL_ADMIN_DEMO=false`. Variáveis VITE são públicas e entram no build; recompilar após
alterar. Não armazenar segredos nelas.

Na API, incluir a origem exata do frontend em `OLIUS_ALLOWED_ORIGINS`. Se frontend e API estiverem
em sites diferentes, configurar `OLIUS_COOKIE_SAME_SITE=None` e manter cookies seguros em HTTPS.
Browsers que bloqueiam cookies de terceiros podem exigir domínios próprios sob o mesmo domínio
principal. Validar login, renovação e logout no navegador.

Comandos dev/build/preview chamam os arquivos Node diretamente para evitar falhas dos wrappers .cmd
do npm em caminhos Windows com caracteres especiais.

## Código e configuração portáveis

Scripts e testes de autoria do projeto usam TypeScript. O executor resolve ferramentas pelas
dependências instaladas, sem caminhos absolutos da máquina. Dependências e a saída compilada do Vite
contêm JavaScript necessário ao navegador; node_modules e dist continuam ignorados no Git. O
Blueprint solicita VITE_API_BASE_URL na criação do serviço; não fixa o endereço da infraestrutura.
.env.local permanece ignorado, e .env.example contém apenas nomes e valores públicos genéricos.
