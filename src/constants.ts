import { PDFCategory } from "./types";

export const PDF_CATEGORIES: PDFCategory[] = [
  {
    id: "konversi-dari-pdf",
    name: "Konversi dari PDF",
    icon: "ArrowRight",
    toolsCount: 5,
    tools: [
      { id: "pdf-ke-gambar", name: "PDF ke Gambar", icon: "Image", category: "konversi-dari-pdf" },
      { id: "pdf-ke-html", name: "PDF ke HTML", icon: "Globe", category: "konversi-dari-pdf" },
      { id: "pdf-ke-svg", name: "PDF ke SVG", icon: "Code", category: "konversi-dari-pdf" },
      { id: "pdf-ke-word", name: "PDF ke Word", icon: "FileText", category: "konversi-dari-pdf" },
      { id: "pdf-ke-excel", name: "PDF ke Excel", icon: "Table", category: "konversi-dari-pdf" },
    ],
  },
  {
    id: "konversi-ke-pdf",
    name: "Konversi ke PDF",
    icon: "Download",
    toolsCount: 3,
    tools: [
      { id: "gambar-ke-pdf", name: "Gambar ke PDF", icon: "Image", category: "konversi-ke-pdf" },
      { id: "word-ke-pdf", name: "Word ke PDF", icon: "FileText", category: "konversi-ke-pdf" },
      { id: "excel-ke-pdf", name: "Excel ke PDF", icon: "Table", category: "konversi-ke-pdf" },
    ],
  },
  {
    id: "edit-atur",
    name: "Edit & Atur",
    icon: "LayoutGrid",
    toolsCount: 7,
    tools: [
      { id: "gabung-pdf", name: "Gabung PDF", icon: "Combine", category: "edit-atur" },
      { id: "pisah-pdf", name: "Pisah PDF", icon: "Scissors", category: "edit-atur" },
      { id: "kompres-pdf", name: "Kompres PDF", icon: "Minimize2", category: "edit-atur" },
      { id: "atur-halaman", name: "Atur Halaman", icon: "Layers", category: "edit-atur" },
      { id: "hapus-halaman", name: "Hapus Halaman", icon: "Trash2", category: "edit-atur" },
      { id: "putar-pdf", name: "Putar PDF", icon: "RotateCw", category: "edit-atur" },
      { id: "tambah-nomor", name: "Tambah Nomor", icon: "Hash", category: "edit-atur" },
      { id: "cetak-pdf", name: "Cetak PDF", icon: "Printer", category: "edit-atur" },
    ],
  },
  {
    id: "optimasi-keamanan",
    name: "Optimasi & Keamanan",
    icon: "Lock",
    toolsCount: 3,
    tools: [
      { id: "kunci-pdf", name: "Kunci PDF", icon: "Lock", category: "optimasi-keamanan" },
      { id: "buka-kunci", name: "Buka Kunci", icon: "Unlock", category: "optimasi-keamanan" },
      { id: "tanda-tangan", name: "Tanda Tangan", icon: "PenTool", category: "optimasi-keamanan" },
    ],
  },
];
