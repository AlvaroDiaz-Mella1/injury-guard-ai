import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { UploadCloud, FileCheck2, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type UploadStatus = "idle" | "uploaded" | "analyzing";

interface UploadAreaProps {
  status: UploadStatus;
  fileName: string | null;
  onFileSelected: (file: File) => void;
  onAnalyze: () => void;
  onReset: () => void;
}

export function UploadArea({
  status,
  fileName,
  onFileSelected,
  onAnalyze,
  onReset,
}: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    // TODO: Validación más estricta del CSV en el backend si es necesario.
    if (!file.name.toLowerCase().endsWith(".csv")) {
      return;
    }
    onFileSelected(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (status !== "idle") return;
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (status !== "idle") return;
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 border-dashed bg-card/70 p-10 transition-all duration-300",
        "shadow-[var(--shadow-card)]",
        status === "idle" && isDragging
          ? "border-primary bg-accent/40 scale-[1.01]"
          : "border-border hover:border-primary/40",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={onChange}
      />

      {status === "idle" && (
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary-glow/10 text-primary">
            <UploadCloud className="h-8 w-8" strokeWidth={1.8} />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-foreground">
              Sube tu archivo .csv con los datos del jugador
            </h2>
            <p className="text-sm text-muted-foreground">
              Arrastra y suelta tu archivo aquí, o selecciónalo manualmente.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => inputRef.current?.click()}
            className="border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
          >
            Seleccionar archivo
          </Button>
          <p className="text-xs text-muted-foreground/80">Formato admitido: .csv</p>
        </div>
      )}

      {status === "uploaded" && fileName && (
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success">
            <FileCheck2 className="h-8 w-8" strokeWidth={1.8} />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-foreground">Archivo listo para analizar</h2>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm">
              <span className="font-mono text-xs text-foreground">{fileName}</span>
              <button
                onClick={onReset}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Quitar archivo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <Button
            size="lg"
            onClick={onAnalyze}
            className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-95"
          >
            <Sparkles className="h-4 w-4" />
            Analizar Patrones
          </Button>
        </div>
      )}

      {status === "analyzing" && (
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Loader2 className="h-8 w-8 animate-spin" strokeWidth={1.8} />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-foreground">Analizando archivo con IA…</h2>
            <p className="text-sm text-muted-foreground">
              Procesando patrones biomecánicos y métricas de carga
            </p>
          </div>
          <div className="h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-[indeterminate_1.6s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-primary to-primary-glow" />
          </div>
          <style>{`
            @keyframes indeterminate {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(220%); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
