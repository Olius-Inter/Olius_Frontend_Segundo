import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const project = process.cwd()
const root = path.resolve('src')
const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
    )
const sourceFiles = walk(root)
const files = [...sourceFiles, ...walk(path.resolve('styles'))]
const graph = new Map()
const errors = []
const relative = (file) => path.relative(project, file).replaceAll('\\', '/')
for (const file of sourceFiles) {
  if (!/\.(ts|tsx)$/.test(file)) errors.push('Extensão fora do padrão em src: ' + relative(file))
  if (/^src\/(components|pages)\//.test(relative(file)) && path.basename(file) !== 'index.tsx')
    errors.push('Componente/página deve ter pasta própria com index.tsx: ' + relative(file))
}
for (const folder of ['components', 'pages', 'types', 'services', 'utils']) {
  if (!fs.existsSync(path.join(root, folder)))
    errors.push('Pasta obrigatória ausente: src/' + folder)
}

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8')
  const specs = []
  if (file.endsWith('.css')) {
    for (const match of text.matchAll(/(?:@import\s+|\bfrom\s+)['"]([^'"]+)['"]/g))
      specs.push(match[1])
  } else {
    const source = ts.createSourceFile(
      file,
      text,
      ts.ScriptTarget.Latest,
      true,
      file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    )
    const collect = (node) => {
      if (ts.isInterfaceDeclaration(node) && !/^src\/types\//.test(relative(file)))
        errors.push('Interface deve ficar em src/types: ' + relative(file))
      if (
        ts.isJsxOpeningElement(node) &&
        node.tagName.getText(source) === 'label' &&
        !node.attributes.properties.some(
          (attribute) =>
            ts.isJsxAttribute(attribute) && attribute.name.getText(source) === 'htmlFor',
        )
      )
        errors.push('Label deve ter htmlFor explícito: ' + relative(file))
      if (
        (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
        ['input', 'select', 'textarea'].includes(node.tagName.getText(source)) &&
        !node.attributes.properties.some(
          (attribute) =>
            ts.isJsxSpreadAttribute(attribute) ||
            (ts.isJsxAttribute(attribute) && attribute.name.getText(source) === 'id'),
        )
      )
        errors.push(
          'Controle deve ter id explícito ou atributos tipados por spread: ' + relative(file),
        )
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      )
        specs.push(node.moduleSpecifier.text)
      if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments[0] &&
        ts.isStringLiteral(node.arguments[0])
      )
        specs.push(node.arguments[0].text)
      if (
        /^src\/(components|pages)\//.test(relative(file)) &&
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'fetch'
      )
        errors.push('HTTP deve ficar em src/services: ' + relative(file))
      ts.forEachChild(node, collect)
    }
    collect(source)
  }
  const links = []
  for (const spec of specs) {
    if (!spec.startsWith('.')) continue
    const base = path.resolve(path.dirname(file), spec)
    const target = [
      base,
      base + '.ts',
      base + '.tsx',
      path.join(base, 'index.ts'),
      path.join(base, 'index.tsx'),
    ].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile())
    if (!target) {
      errors.push('Import inexistente: ' + relative(file) + ' → ' + spec)
      continue
    }
    if (
      /^src\/(components|pages)\//.test(relative(file)) &&
      /^src\/services\//.test(relative(target))
    )
      errors.push(
        'Componentes e páginas devem acessar serviços pelos hooks: ' +
          relative(file) +
          ' → ' +
          relative(target),
      )
    if (/^src\/types\//.test(relative(file)) && !/^src\/types\//.test(relative(target)))
      errors.push(
        'Tipos não devem depender da implementação: ' + relative(file) + ' → ' + relative(target),
      )
    if (
      /^src\/services\//.test(relative(file)) &&
      /^src\/(components|pages|contexts|hooks|modules|app)\//.test(relative(target))
    )
      errors.push('Serviço depende da interface: ' + relative(file) + ' → ' + relative(target))
    links.push(target)
  }
  graph.set(file, links)
}
const done = new Set()
const stack = []
function visit(file) {
  if (stack.includes(file)) {
    errors.push('Ciclo: ' + [...stack.slice(stack.indexOf(file)), file].map(relative).join(' → '))
    return
  }
  if (done.has(file)) return
  stack.push(file)
  for (const next of graph.get(file) || []) visit(next)
  stack.pop()
  done.add(file)
}
for (const file of files) visit(file)
if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else
  console.log(
    'Arquitetura DAD: estrutura, extensões, imports e dependências válidos; sem ciclos em ' +
      files.length +
      ' arquivos.',
  )
