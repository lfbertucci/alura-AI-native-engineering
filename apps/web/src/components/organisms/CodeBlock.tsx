interface CodeBlockProps {
  code: string
}

export function CodeBlock({ code }: CodeBlockProps) {
  return (
    <section aria-label="Trecho de código">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
        Código
      </h3>
      <pre className="bg-code-bg rounded-lg p-4 overflow-x-auto">
        <code className="font-mono text-sm text-code-text whitespace-pre">{code}</code>
      </pre>
    </section>
  )
}
