import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { UploadArea, type UploadStatus } from "@/components/UploadArea";
import { ResultsDashboard } from "@/components/ResultsDashboard";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  // ===== Estado central de la aplicación =====
  // Estos useState están aislados para que puedas conectarlos fácilmente
  // a tu backend / modelo real. Reemplaza los setTimeout por las llamadas reales.
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [hasResults, setHasResults] = useState(false);

  // 1) Selección de archivo (drag & drop o picker)
  const handleFileSelected = (selected: File) => {
    setFile(selected);
    setStatus("uploaded");
    // TODO: aquí podrías validar el contenido del CSV antes del análisis.
  };

  // 2) Lanzar análisis (simulado). Sustituye por la llamada real a tu API.
  const handleAnalyze = async () => {
    if (!file) return;
    setStatus("analyzing");

    // ===== INYECTAR LÓGICA DE BACKEND AQUÍ =====
    // const formData = new FormData();
    // formData.append("file", file);
    // const res = await fetch("/api/predict", { method: "POST", body: formData });
    // const data = await res.json();
    // setPredictionResult(data); // <- guarda los resultados en estado y úsalos en ResultsDashboard
    // ===========================================

    // Simulación visual del análisis
    await new Promise((r) => setTimeout(r, 2200));

    setHasResults(true);
    setStatus("idle");
    toast.success("Archivo analizado correctamente", {
      description: "Los resultados están disponibles abajo.",
    });
  };

  // 3) Reset completo (botón "Nuevo Análisis" o quitar archivo)
  const handleReset = () => {
    setFile(null);
    setStatus("idle");
    setHasResults(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 sm:py-14">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Predicción de lesiones impulsada por IA
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sube los datos del jugador en formato CSV y obtén un análisis instantáneo
            del riesgo de lesión y estado de forma.
          </p>
        </div>

        <section className="space-y-8">
          <UploadArea
            status={status}
            fileName={file?.name ?? null}
            onFileSelected={handleFileSelected}
            onAnalyze={handleAnalyze}
            onReset={handleReset}
          />

          <ResultsDashboard hasResults={hasResults} onReset={handleReset} />
        </section>
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        AI Injury Predictor · Interfaz preparada para integración con modelo de IA
      </footer>
    </div>
  );
}
