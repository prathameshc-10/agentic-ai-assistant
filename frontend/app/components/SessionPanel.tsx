import { agentAccent } from "../data/agentic-ui";
import type { AgentStat, UploadedDocument } from "../types/agentic-ui";

type SessionPanelProps = {
  documents: UploadedDocument[];
  isUploading?: boolean;
  onUploadDocument: (file: File) => Promise<void> | void;
  stats: AgentStat[];
  uploadStatus?: string | null;
};

export function SessionPanel({
  documents,
  isUploading = false,
  onUploadDocument,
  stats,
  uploadStatus,
}: SessionPanelProps) {
  const total = stats.reduce((sum, item) => sum + item.count, 0);

  return (
    <aside className="glass-panel h-full w-[280px] shrink-0 p-6 max-xl:hidden">
      <h2 className="text-xl font-semibold text-slate-50">Session Info</h2>

      <section className="mt-7">
        <p className="section-label">Agent breakdown</p>
        <div className="mt-4 flex items-center justify-center">
          <div className="donut-chart">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[#16213E] text-center">
              <span className="text-xl font-bold text-slate-50">{total}</span>
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3" key={stat.agent}>
              <p className={`text-xs font-semibold agent-text-${agentAccent[stat.agent]}`}>
                {stat.label}
              </p>
              <p className="mt-1 text-xl font-bold text-slate-50">{stat.count}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <p className="section-label">Documents</p>
        <div className="mt-4 space-y-3">
          {documents.map((document) => (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3" key={document.id}>
              <div className="flex items-start gap-3">
                <span className="rounded-lg bg-amber-400/15 px-2 py-1 text-[10px] font-bold text-amber-300">
                  DOC
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-100">{document.name}</p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    {document.size}
                    {document.status === "indexed" ? " indexed" : " uploading"}
                  </p>
                </div>
                <button className="text-sm text-slate-500 transition hover:text-slate-200">X</button>
              </div>
              {document.status === "uploading" ? (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-violet-gradient"
                    style={{ width: `${document.progress ?? 0}%` }}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <label className="mt-6 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-violet-300/30 bg-violet-500/[0.055] text-center transition hover:bg-violet-500/10">
        <input
          accept=".pdf,.txt"
          className="hidden"
          disabled={isUploading}
          onChange={async (event) => {
            const file = event.target.files?.[0];

            if (file) {
              await onUploadDocument(file);
              event.target.value = "";
            }
          }}
          type="file"
        />
        <span className="text-2xl text-violet-200">+</span>
        <span className="mt-2 text-sm font-semibold text-slate-100">
          {isUploading ? "Uploading..." : "Upload Document"}
        </span>
        <span className="mt-1 px-5 text-xs leading-5 text-slate-600">
          {uploadStatus ?? "Drop PDF or TXT here"}
        </span>
      </label>
    </aside>
  );
}
