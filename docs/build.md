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
