export interface PDFTool {
  id: string;
  name: string;
  icon: string;
  category: string;
  description?: string;
}

export interface PDFCategory {
  id: string;
  name: string;
  icon: string;
  toolsCount: number;
  tools: PDFTool[];
}
