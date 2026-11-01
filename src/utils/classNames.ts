/** Maps conditional class names to their CSS Module exports. */
export function mapClassNames(value: string, styles: Readonly<Record<string, string>>): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => styles[name] ?? name)
    .join(' ')
}
