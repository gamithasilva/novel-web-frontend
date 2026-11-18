export const Spinner = ({ label }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-20">
    <div className="flex gap-2">
      {[0.3, 0.15, 0].map((d) => (
        <span
          key={d}
          className="w-2.5 h-2.5 rounded-full animate-bounce"
          style={{ background: "var(--fg)", animationDelay: `-${d}s` }}
        />
      ))}
    </div>
    {label && <p className="muted text-sm">{label}</p>}
  </div>
)
