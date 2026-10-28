import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const root = path.resolve('src')
const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
    )
const files = walk(root).filter((file) => /\.(ts|tsx|css)$/.test(file))
const graph = new Map()
const errors = []
const owner = (file) => file.match(/^features\/([^/]+)/)?.[1]
const relative = (file) => path.relative(root, file).replaceAll('\\', '/')

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
    const from = relative(file),
      to = relative(target)
    if (from.startsWith('shared/') && !to.startsWith('shared/')) errors.push(from + ' → ' + to)
    if (from.startsWith('features/') && to.startsWith('app/')) errors.push(from + ' → ' + to)
    if (
      owner(from) &&
      owner(to) &&
      owner(from) !== owner(to) &&
      !/^features\/[^/]+\/(index|api|contracts)\.ts$/.test(to)
    )
      errors.push('Import interno entre módulos: ' + from + ' → ' + to)
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
    'Arquitetura: imports válidos, limites respeitados e nenhum ciclo em ' +
      files.length +
      ' arquivos TS/TSX/CSS.',
  )
