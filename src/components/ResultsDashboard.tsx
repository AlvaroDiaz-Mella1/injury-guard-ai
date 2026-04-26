import { ShieldCheck, Activity, TrendingUp, HeartPulse, RotateCcw, FileBarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResultsDashboardProps {
  hasResults: boolean;
  onReset: () => void;
}

export function ResultsDashboard({ hasResults, onReset }: ResultsDashboardProps) {
  if (!hasResults) {
    return <EmptyState />;
  }
  return <ResultsView onReset={onReset} />;
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

function ResultsView({ onReset }: { onReset: () => void }) {
  // NOTE: Conecta aquí los valores reales devueltos por tu modelo de IA.
  // Por ahora se muestran valores neutros ("-" / "0%") preparados para inyección.
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Resultados del análisis</h3>
          <p className="text-sm text-muted-foreground">
            Predicción generada por el modelo de IA
          </p>
        </div>
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Nuevo Análisis
        </Button>
      </div>

      {/* Tarjeta principal: Riesgo Global */}
      <Card className="overflow-hidden border-border/70 shadow-[var(--shadow-elevated)]">
        <div className="bg-gradient-to-br from-primary to-primary-glow p-6 text-primary-foreground">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-80">
            <ShieldCheck className="h-4 w-4" />
            Riesgo de Lesión Global
          </div>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              {/* TODO: reemplaza "0%" con el valor de riesgo global del modelo */}
              <p className="text-5xl font-bold leading-none tracking-tight">0%</p>
              <p className="mt-2 text-sm opacity-80">
                {/* TODO: nivel cualitativo (Bajo / Moderado / Alto) según umbrales */}
                Nivel: —
              </p>
            </div>
            <div className="rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur-sm">
              Confianza: —
            </div>
          </div>
        </div>
      </Card>

      {/* Métricas secundarias - estructura preparada para conectar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          icon={<Activity className="h-4 w-4" />}
          label="Estado de forma"
          value="-"
          hint="Índice agregado"
        />
        <MetricCard
          icon={<HeartPulse className="h-4 w-4" />}
          label="Carga acumulada"
          value="-"
          hint="Últimos 7 días"
        />
        <MetricCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Tendencia"
          value="-"
          hint="Variación semanal"
        />
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">
            Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {/* TODO: Inyecta aquí las recomendaciones generadas por el modelo */}
            Las recomendaciones aparecerán aquí una vez conectado el modelo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="border-border/70 shadow-[var(--shadow-card)]">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span className="text-primary">{icon}</span>
          {label}
        </div>
        <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
