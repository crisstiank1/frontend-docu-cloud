export interface ShareSummaryItem {
  shareId: string;
  recipientEmail: string | null;
  permission: "READ" | "WRITE";
  hasPassword: boolean;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
}

export interface SharedByMeDocument {
  documentId: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  shares: ShareSummaryItem[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
