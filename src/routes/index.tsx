import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { UploadArea, type UploadStatus } from "@/components/UploadArea";
import { ResultsDashboard, type AnalysisResult } from "@/components/ResultsDashboard";

export const Route = createFileRoute("/")({
  component: Index,
});

const API_URL = "http://localhost:8002/api/analyze";

function Index() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFileSelected = (selected: File) => {
    setFile(selected);
    setStatus("uploaded");
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setStatus("analyzing");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(API_URL, { method: "POST", body: formData });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail ?? `Error ${res.status}`);
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
      setStatus("idle");
      toast.success("Análisis completado", { description: data.estado_principal });
    } catch (err) {
      setStatus("uploaded");
      toast.error("Error al conectar con el servidor", {
        description:
          err instanceof Error
            ? err.message
            : "Comprueba que el backend está activo en localhost:8002",
      });
    }
  };

  const handleReset = () => {
    setFile(null);
    setStatus("idle");
    setResult(null);
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

          <ResultsDashboard result={result} onReset={handleReset} />
        </section>
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        AI Injury Predictor · Análisis predictivo de lesiones en futbolistas
      </footer>
    </div>
  );
}
