type LogoProps = {
  compact?: boolean;
};

export function Logo({ compact = false }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`grid place-items-center rounded-[14px] bg-violet-gradient font-bold text-white shadow-violet ${
          compact ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm"
        }`}
      >
        AI
      </div>
      {!compact ? (
        <div>
          <p className="text-lg font-semibold text-slate-50">Agentic AI</p>
          <p className="text-xs text-slate-500">Multi-agent workspace</p>
        </div>
      ) : null}
    </div>
  );
}
