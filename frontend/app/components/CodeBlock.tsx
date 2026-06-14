type CodeBlockProps = {
  language: string;
  lines: string[];
};

export function CodeBlock({ language, lines }: CodeBlockProps) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0D1117] shadow-2xl shadow-black/20">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.035] px-4 py-3">
        <button className="rounded-full border border-violet-400/30 px-3 py-1 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/15">
          Copy
        </button>
        <span className="text-xs font-medium text-slate-500">{language}</span>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-7 text-slate-300">
        <code>
          {lines.map((line, index) => (
            <span className="block" key={`${line}-${index}`}>
              <span className="mr-4 select-none text-slate-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              {line}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
