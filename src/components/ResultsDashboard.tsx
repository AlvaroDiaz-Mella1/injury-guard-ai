import { ShieldCheck, ShieldAlert, HeartPulse, Activity, RotateCcw, FileBarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AnalysisResult {
  probabilidad_lesion: string;
  probabilidad_sano: string;
  estado_principal: string;
}

interface ResultsDashboardProps {
  result: AnalysisResult | null;
  onReset: () => void;
}

export function ResultsDashboard({ result, onReset }: ResultsDashboardProps) {
  if (!result) return <EmptyState />;
  return <ResultsView result={result} onReset={onReset} />;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground/70">
        <FileBarChart2 className="h-7 w-7" strokeWidth={1.6} />
      </div>
      <p className="max-w-sm text-base font-medium text-muted-foreground">
        Sube tus datos y descubre el estado de forma y el riesgo de lesión de tus jugadores
      </p>
    </div>
  );
}

function ResultsView({ result, onReset }: { result: AnalysisResult; onReset: () => void }) {
  const pctLesion = parseInt(result.probabilidad_lesion, 10);
  const pctSano = parseInt(result.probabilidad_sano, 10);
  const isHealthy = pctSano >= pctLesion;

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Resultados del análisis</h3>
          <p className="text-sm text-muted-foreground">Predicción generada por el modelo de IA</p>
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Nuevo análisis
        </Button>
      </div>

      {/* Tarjeta principal: estado dominante */}
      <Card className="overflow-hidden border-0 shadow-[var(--shadow-elevated)]">
        <div
          className={cn(
            "p-6 text-white",
            isHealthy
              ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
              : "bg-gradient-to-br from-red-500 to-red-600",
          )}
        >
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider opacity-80">
            {isHealthy ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <ShieldAlert className="h-4 w-4" />
            )}
            {isHealthy ? "Estado del jugador" : "Alerta de riesgo"}
          </div>

          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-6xl font-bold leading-none tracking-tight">
                {isHealthy ? result.probabilidad_sano : result.probabilidad_lesion}
              </p>
              <p className="mt-2 text-sm opacity-90">
                {isHealthy ? "Probabilidad de estar sano" : "Probabilidad de lesión"}
              </p>
            </div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur-sm">
              {isHealthy ? "Bajo riesgo" : "Alto riesgo"}
            </span>
          </div>
        </div>
      </Card>

      {/* Métricas secundarias */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border/70 shadow-[var(--shadow-card)]">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <HeartPulse className="h-4 w-4 text-emerald-500" />
              Probabilidad sano
            </div>
            <p className="mt-3 text-4xl font-bold text-emerald-600">{result.probabilidad_sano}</p>
            <p className="mt-1 text-xs text-muted-foreground">Sin lesión estimada</p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-[var(--shadow-card)]">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Activity className="h-4 w-4 text-red-500" />
              Probabilidad lesión
            </div>
            <p className="mt-3 text-4xl font-bold text-red-500">{result.probabilidad_lesion}</p>
            <p className="mt-1 text-xs text-muted-foreground">Riesgo estimado</p>
          </CardContent>
        </Card>
      </div>

      {/* Diagnóstico textual */}
      <Card className="border-border/70">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                isHealthy
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-red-100 text-red-600",
              )}
            >
              {isHealthy ? (
                <ShieldCheck className="h-4 w-4" />
              ) : (
                <ShieldAlert className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Diagnóstico principal</p>
              <p className="mt-1 text-sm text-muted-foreground">{result.estado_principal}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
