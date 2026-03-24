// ─── Iconos por tipo de archivo ───────────────────────────────────────────────

const FILE_ICON: Record<string, string> = {
  pdf: "/icons/pdf.png",
  word: "/icons/word.png",
  excel: "/icons/excel.png",
  powerpoint: "/icons/powerpoint.png",
};

export function getFileIconUrl(type: string): string | null {
  if (type.includes("pdf")) return FILE_ICON.pdf;
  if (type.includes("word") || type.includes("wordprocessingml"))
    return FILE_ICON.word;
  if (type.includes("excel") || type.includes("spreadsheet"))
    return FILE_ICON.excel;
  if (type.includes("powerpoint") || type.includes("presentation"))
    return FILE_ICON.powerpoint;
  return null;
}

// ─── Nombre legible del tipo de archivo ──────────────────────────────────────

export function getFileType(type: string): string {
  if (type.includes("pdf")) return "PDF";
  if (type.includes("word") || type.includes("wordprocessingml")) return "Word";
  if (type.includes("excel") || type.includes("spreadsheet")) return "Excel";
  if (type.includes("text")) return "Texto";
  if (type.startsWith("image")) return "Imagen";
  return type.split("/")[1]?.toUpperCase() || "Archivo";
}

// ─── Formato de fecha legible ─────────────────────────────────────────────────

export function formatDate(date: string): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Tamaño legible ───────────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
