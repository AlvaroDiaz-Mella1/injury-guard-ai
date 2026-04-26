import { Activity } from "lucide-react";

export function Header() {
  return (
    <header className="w-full border-b border-border/60 bg-card/50 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-glow)]">
            <Activity className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              AI Injury Predictor
            </h1>
            <p className="text-xs text-muted-foreground">
              Análisis predictivo para futbolistas
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          Modelo IA listo
        </div>
      </div>
    </header>
  );
}
