import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const entries: Record<string, { packageName: string; entry: string }> = {
  vite: { packageName: 'vite', entry: 'bin/vite.js' },
  typescript: { packageName: 'typescript', entry: 'bin/tsc' },
  prettier: { packageName: 'prettier', entry: 'bin/prettier.cjs' },
}
const [name, ...args] = process.argv.slice(2)
const tool = entries[name]
if (!tool) throw new Error('Ferramenta não reconhecida.')
const packageFile = require.resolve(`${tool.packageName}/package.json`)
const result = spawnSync(process.execPath, [join(dirname(packageFile), tool.entry), ...args], {
  stdio: 'inherit',
  windowsHide: true,
})
if (result.error) throw result.error
process.exitCode = result.status ?? 1
