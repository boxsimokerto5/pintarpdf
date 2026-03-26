import { useState, useEffect, ReactNode, ChangeEvent, useRef } from "react";
import { jsPDF } from "jspdf";
import * as pdfjsLib from 'pdfjs-dist';

// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { PDFDocument, rgb, degrees, StandardFonts, PageSizes } from 'pdf-lib';

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
};

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import { 
  Menu, 
  Moon, 
  Sun, 
  Bell, 
  Search, 
  ChevronRight, 
  LayoutGrid, 
  BookOpen, 
  History, 
  BellRing,
  X,
  FileText,
  Image as ImageIcon,
  Globe,
  Code,
  Table,
  Combine,
  Scissors,
  Minimize2,
  Layers,
  Trash2,
  Share2,
  RotateCw,
  Hash,
  Lock,
  Unlock,
  PenTool,
  ArrowRight,
  Download,
  Info,
  Printer,
  ChevronDown,
  ChevronUp,
  Upload,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  FileUp,
  Settings,
  User,
  Maximize2,
  Star,
  Zap,
  ShieldCheck,
  Crown,
  MoreVertical,
  Clock,
  Library,
  Folder,
  Share2 as ShareIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PDF_CATEGORIES } from "./constants";
import { PDFCategory, PDFTool } from "./types";

// Icon mapping for dynamic icons
const IconMap: Record<string, any> = {
  ArrowRight,
  Download,
  LayoutGrid,
  Lock,
  Image: ImageIcon,
  Globe,
  Code,
  FileText,
  Table,
  Combine,
  Scissors,
  Minimize2,
  Layers,
  Trash2,
  RotateCw,
  Hash,
  Unlock,
  PenTool,
  Printer,
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("isDarkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<PDFTool | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const [readerHistory, setReaderHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem("pdfReaderHistory");
    const parsed = saved ? JSON.parse(saved) : [];
    // Clear stale blob URLs as they don't survive reloads
    return parsed.map((item: any) => ({
      ...item,
      url: item.url?.startsWith('blob:') ? null : item.url
    }));
  });
  const [history, setHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem("pdfHistory");
    const parsed = saved ? JSON.parse(saved) : [];
    // Clear stale blob URLs as they don't survive reloads
    return parsed.map((item: any) => ({
      ...item,
      url: item.url?.startsWith('blob:') ? null : item.url
    }));
  });
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("pdfNotifications");
    return saved ? JSON.parse(saved) : [
      { id: 1, title: "Update Versi 2.1.0", message: "Kami telah menambahkan fitur PDF ke SVG!", date: "Baru saja", read: false },
      { id: 2, title: "Tips Keamanan", message: "Gunakan fitur Kunci PDF untuk dokumen sensitif Anda.", date: "2 jam yang lalu", read: false },
    ];
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("pdfHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("pdfReaderHistory", JSON.stringify(readerHistory));
  }, [readerHistory]);

  useEffect(() => {
    localStorage.setItem("pdfNotifications", JSON.stringify(notifications));
  }, [notifications]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleToolSelect = (tool: PDFTool) => {
    setSelectedTool(tool);
    setIsSidebarOpen(false);
    setSearchQuery("");
  };

  const addToHistory = (toolName: string, fileName?: string, url?: string, thumbnail?: string | null) => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      tool: toolName,
      fileName: fileName || "dokumen.pdf",
      date: new Date().toLocaleString("id-ID"),
      status: "Selesai",
      url,
      thumbnail
    };
    setHistory([newItem, ...history]);
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const filteredCategories = PDF_CATEGORIES.map(cat => ({
    ...cat,
    tools: cat.tools.filter(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.tools.length > 0);

  const renderContent = () => {
    if (selectedTool) {
      return (
        <ToolView 
          tool={selectedTool} 
          onBack={() => setSelectedTool(null)} 
          isDarkMode={isDarkMode} 
          onComplete={(fileName, url, thumb) => addToHistory(selectedTool.name, fileName, url, thumb)}
        />
      );
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <>
            {/* Search Bar */}
            <div className={`mt-6 p-4 rounded-3xl shadow-lg transition-all ${isDarkMode ? "bg-slate-800" : "bg-blue-600/10 backdrop-blur-sm"}`}>
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-slate-400" : "text-blue-500"}`} />
                <input 
                  type="text" 
                  placeholder="Cari alat PDF..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-2xl outline-none transition-all ${isDarkMode ? "bg-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500" : "bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400 shadow-inner"}`}
                />
              </div>
              
              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchQuery && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mt-4 rounded-2xl overflow-hidden border ${isDarkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-100 shadow-xl"}`}
                  >
                    {filteredCategories.length > 0 ? (
                      filteredCategories.flatMap(cat => cat.tools).map(tool => (
                        <button 
                          key={tool.id}
                          onClick={() => handleToolSelect(tool)}
                          className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${isDarkMode ? "hover:bg-slate-600" : "hover:bg-slate-50"}`}
                        >
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            {(() => {
                              const Icon = IconMap[tool.icon] || FileText;
                              return <Icon className="w-4 h-4 text-blue-500" />;
                            })()}
                          </div>
                          <span className="font-medium">{tool.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400">
                        Tidak ada alat yang ditemukan.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hero Banner */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-8 relative overflow-hidden rounded-[2rem] bg-blue-600 p-6 text-white shadow-xl shadow-blue-500/20 aspect-video flex flex-col justify-center"
            >
              <div className="relative z-10 max-w-[85%]">
                <h2 className="text-2xl font-bold leading-tight">Selamat Datang di PintarPDF</h2>
                <p className="mt-2 text-blue-100 text-xs leading-relaxed">
                  Solusi cerdas untuk semua kebutuhan dokumen PDF Anda.
                </p>
                <button 
                  onClick={() => setActiveTab("notifications")}
                  className="mt-4 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl font-bold text-sm transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  Lihat Info Terbaru <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              {/* Abstract background shapes */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-orange-500/20 rounded-full translate-y-1/2 translate-x-1/4 blur-xl"></div>
              <FileText className="absolute bottom-4 right-4 w-20 h-20 text-white/10 rotate-12" />
            </motion.div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-3 mt-8">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={`p-4 rounded-[2rem] flex flex-col items-center justify-center text-center transition-all ${isDarkMode ? "bg-slate-800" : "bg-white shadow-sm border border-slate-100"}`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-xl font-black">{history.length}+</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PROSES</p>
              </motion.div>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`p-4 rounded-[2rem] flex flex-col items-center justify-center text-center transition-all ${isDarkMode ? "bg-slate-800" : "bg-white shadow-sm border border-slate-100"}`}
              >
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center mb-2">
                  <Zap className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-xl font-black">{PDF_CATEGORIES.reduce((acc, cat) => acc + cat.tools.length, 0)}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ALAT</p>
              </motion.div>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`p-4 rounded-[2rem] flex flex-col items-center justify-center text-center transition-all ${isDarkMode ? "bg-slate-800" : "bg-white shadow-sm border border-slate-100"}`}
              >
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-xl font-black">100%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AMAN</p>
              </motion.div>
            </div>

            {/* Services Section */}
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <LayoutGrid className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-bold tracking-tight">Kategori</h3>
                </div>
              </div>

              {/* Horizontal Scrollable Categories */}
              <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar scroll-smooth">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold text-sm transition-all border ${
                    selectedCategory === null
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20"
                      : isDarkMode
                      ? "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                      : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  Semua
                </button>
                {PDF_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold text-sm transition-all border whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20"
                        : isDarkMode
                        ? "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                        : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50 shadow-sm"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                {(selectedCategory 
                  ? PDF_CATEGORIES.find(c => c.id === selectedCategory)?.tools || []
                  : PDF_CATEGORIES.flatMap(cat => cat.tools).slice(0, 10)
                ).map((tool, idx) => {
                  const colors = [
                    { bg: "bg-[#E0D7FF]", border: "border-[#D0C7FF]", text: "text-slate-800", icon: "text-[#5A4AD1]" }, // Purple
                    { bg: "bg-[#D1F5F2]", border: "border-[#C1E5E2]", text: "text-slate-800", icon: "text-[#00A3A3]" }, // Teal
                    { bg: "bg-[#FFF0E0]", border: "border-[#F0E0D0]", text: "text-slate-800", icon: "text-[#D17A00]" }, // Orange
                    { bg: "bg-[#E0EBFF]", border: "border-[#D0DBFF]", text: "text-slate-800", icon: "text-[#4A7AD1]" }, // Blue
                    { bg: "bg-[#FFE0E6]", border: "border-[#F0D0D6]", text: "text-slate-800", icon: "text-[#D14A61]" }, // Pink
                    { bg: "bg-[#E0F7E9]", border: "border-[#D0E7D9]", text: "text-slate-800", icon: "text-[#2D8A4E]" }, // Green
                  ];
                  const color = isDarkMode 
                    ? { bg: "bg-slate-800", border: "border-slate-700", text: "text-white", icon: "text-blue-400" }
                    : colors[idx % colors.length];

                  return (
                    <motion.button
                      key={tool.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleToolSelect(tool)}
                      className={`group flex items-center justify-between p-5 rounded-2xl transition-all transform hover:-translate-y-1 active:scale-95 border ${color.bg} ${color.border} ${isDarkMode ? "shadow-lg" : "shadow-sm"}`}
                    >
                      <div className="flex flex-col items-start text-left max-w-[60%]">
                        <span className={`text-sm font-bold leading-tight tracking-tight ${color.text}`}>{tool.name}</span>
                      </div>
                      <div className={`transition-all group-hover:scale-110 ${color.icon}`}>
                        {(() => {
                          const Icon = IconMap[tool.icon] || FileText;
                          return <Icon className="w-8 h-8" />;
                        })()}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Creation Section */}
            <div className="mt-10 mb-4">
              <div className="flex items-center gap-3 mb-6">
                <FileUp className="w-6 h-6 text-blue-500" />
                <h3 className="text-xl font-bold tracking-tight">Creation</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setActiveTab("history")}
                  className="group flex items-center gap-4 p-5 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-3xl shadow-lg shadow-orange-500/20 transform transition-all hover:scale-[1.02] active:scale-95"
                >
                  <div className="p-3 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-colors">
                    <History className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">RIWAYAT</p>
                    <p className="font-bold text-sm">Generated PDF</p>
                  </div>
                </button>
                <button 
                  onClick={() => alert("Fitur Favorit akan segera hadir!")}
                  className="group flex items-center gap-4 p-5 bg-gradient-to-br from-pink-400 to-pink-600 text-white rounded-3xl shadow-lg shadow-pink-500/20 transform transition-all hover:scale-[1.02] active:scale-95"
                >
                  <div className="p-3 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-colors">
                    <Star className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">KOLEKSI</p>
                    <p className="font-bold text-sm">Favourite</p>
                  </div>
                </button>
              </div>
            </div>

            {/* PWA Section */}
            {!window.matchMedia('(display-mode: standalone)').matches && (
              <div className="mb-10">
                <button 
                  onClick={showInstallButton ? handleInstallClick : () => alert("Silakan buka aplikasi di Tab Baru untuk menginstal.")}
                  className={`w-full group flex items-center gap-4 p-5 rounded-3xl shadow-lg transform transition-all hover:scale-[1.01] active:scale-95 border ${
                    showInstallButton 
                      ? "bg-gradient-to-br from-green-400 to-green-600 text-white border-green-300 shadow-green-500/20" 
                      : isDarkMode 
                        ? "bg-slate-800 border-slate-700 text-slate-400" 
                        : "bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-700"
                  }`}
                >
                  <div className={`p-3 rounded-2xl transition-colors ${showInstallButton ? "bg-white/20 group-hover:bg-white/30" : "bg-green-200 dark:bg-green-900/40"}`}>
                    <Download className={`w-6 h-6 ${!showInstallButton && !isDarkMode ? "text-green-600" : ""}`} />
                  </div>
                  <div className="text-left flex-1">
                    <p className={`text-[10px] font-bold opacity-80 uppercase tracking-widest ${!showInstallButton && !isDarkMode ? "text-green-600" : ""}`}>APLIKASI</p>
                    <p className="font-bold text-sm">
                      {showInstallButton ? "Instal PintarPDF Sekarang" : "Buka Tab Baru untuk Instal"}
                    </p>
                  </div>
                  <ChevronRight className={`w-5 h-5 opacity-50 ${!showInstallButton && !isDarkMode ? "text-green-600" : ""}`} />
                </button>
              </div>
            )}
          </>
        );
      case "reader":
        return <ReaderView isDarkMode={isDarkMode} history={history} readerHistory={readerHistory} setReaderHistory={setReaderHistory} />;
      case "history":
        return <HistoryView history={history} isDarkMode={isDarkMode} onOpenReader={() => setActiveTab("reader")} />;
      case "notifications":
        return <NotificationsView notifications={notifications} isDarkMode={isDarkMode} onMarkRead={markNotificationAsRead} onClear={clearNotifications} />;
      case "settings":
        return <SettingsView isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
      case "print":
        return <PrintView isDarkMode={isDarkMode} onSelectTool={handleToolSelect} />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-900"}`}>
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar / Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed left-0 top-0 bottom-0 w-72 z-50 shadow-2xl flex flex-col ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
          >
            <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-blue-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://picsum.photos/seed/pdf/100/100";
                    }}
                  />
                </div>
                <span className="text-xl font-bold tracking-tight">PintarPDF</span>
              </div>
              <button onClick={toggleSidebar} className="p-1 hover:bg-blue-700 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              <SidebarItem 
                icon={<LayoutGrid className="w-5 h-5" />} 
                label="Dashboard" 
                active={activeTab === "dashboard" && !selectedTool} 
                onClick={() => { setActiveTab("dashboard"); setSelectedTool(null); toggleSidebar(); }}
                isDarkMode={isDarkMode}
              />
              <SidebarItem 
                icon={<Bell className="w-5 h-5" />} 
                label="Pengumuman" 
                active={activeTab === "notifications"}
                onClick={() => { setActiveTab("notifications"); toggleSidebar(); }}
                isDarkMode={isDarkMode}
              />
              <SidebarItem 
                icon={<BookOpen className="w-5 h-5" />} 
                label="PDF Reader" 
                active={activeTab === "reader"}
                onClick={() => { setActiveTab("reader"); toggleSidebar(); }}
                isDarkMode={isDarkMode}
              />
              <SidebarItem 
                icon={<Printer className="w-5 h-5" />} 
                label="Cetak PDF" 
                active={selectedTool?.id === "cetak-pdf"}
                onClick={() => { 
                  const tool = PDF_CATEGORIES.flatMap(cat => cat.tools).find(t => t.id === "cetak-pdf");
                  if (tool) handleToolSelect(tool);
                  toggleSidebar(); 
                }}
                isDarkMode={isDarkMode}
              />
              <SidebarItem 
                icon={<Settings className="w-5 h-5" />} 
                label="Pengaturan" 
                active={activeTab === "settings"}
                onClick={() => { setActiveTab("settings"); toggleSidebar(); }}
                isDarkMode={isDarkMode}
              />

              {showInstallButton && (
                <SidebarItem 
                  icon={<Download className="w-5 h-5" />} 
                  label="Instal Aplikasi" 
                  active={false}
                  onClick={() => { handleInstallClick(); toggleSidebar(); }}
                  isDarkMode={isDarkMode}
                  className="bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-bold"
                />
              )}

              <div className="pt-6 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Layanan Kami
              </div>

              {PDF_CATEGORIES.map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <button 
                    onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
                  >
                    <div className="flex items-center gap-3">
                      {(() => {
                        const Icon = IconMap[cat.icon];
                        return <Icon className="w-5 h-5 text-blue-500" />;
                      })()}
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    {expandedCategory === cat.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  <AnimatePresence>
                    {expandedCategory === cat.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-11 space-y-1"
                      >
                        {cat.tools.map(tool => (
                          <button 
                            key={tool.id}
                            onClick={() => handleToolSelect(tool)}
                            className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-700" : "text-slate-600 hover:text-blue-600 hover:bg-slate-100"}`}
                          >
                            {tool.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-400 font-medium mb-1">VERSI APLIKASI</div>
              <div className="text-sm font-semibold">PintarPDF v2.1.0 (Local Mode)</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header / TopBar */}
      <header className={`sticky top-0 z-30 px-4 py-4 flex items-center justify-between transition-colors ${isDarkMode ? "bg-slate-900/80" : "bg-blue-600 text-white"} backdrop-blur-md`}>
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">PintarPDF</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-blue-600"></span>
          </button>
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white shadow-lg border-2 border-white/20">
            U
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24 max-w-2xl mx-auto px-4">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 px-6 py-3 border-t transition-colors ${isDarkMode ? "bg-slate-900/95 border-slate-800" : "bg-white/95 border-slate-100"} backdrop-blur-lg`}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <NavItem 
            icon={<LayoutGrid className="w-6 h-6" />} 
            label="DASHBOARD" 
            active={activeTab === "dashboard"} 
            onClick={() => { setActiveTab("dashboard"); setSelectedTool(null); }}
            isDarkMode={isDarkMode}
          />
          <NavItem 
            icon={<BookOpen className="w-6 h-6" />} 
            label="READER" 
            active={activeTab === "reader"} 
            onClick={() => { setActiveTab("reader"); setSelectedTool(null); }}
            isDarkMode={isDarkMode}
          />
          <NavItem 
            icon={<History className="w-6 h-6" />} 
            label="RIWAYAT" 
            active={activeTab === "history"} 
            onClick={() => { setActiveTab("history"); setSelectedTool(null); }}
            isDarkMode={isDarkMode}
          />
          <NavItem 
            icon={<BellRing className="w-6 h-6" />} 
            label="NOTIFIKASI" 
            active={activeTab === "notifications"} 
            onClick={() => { setActiveTab("notifications"); setSelectedTool(null); }}
            isDarkMode={isDarkMode}
          />
        </div>
      </nav>
    </div>
  );
}

function PDFCanvasPreview({ url, data, height, isDarkMode }: { url?: string, data?: Blob | Uint8Array | null, height: number, isDarkMode: boolean }) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let isMounted = true;
    const renderPage = async () => {
      if (!url && !data) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        
        let pdfData: Uint8Array;
        if (data) {
          pdfData = data instanceof Blob ? new Uint8Array(await data.arrayBuffer()) : data;
        } else if (url) {
          // Fetch the blob data first to avoid "Unexpected server response (0)"
          try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const arrayBuffer = await response.arrayBuffer();
            pdfData = new Uint8Array(arrayBuffer);
          } catch (fetchErr: any) {
            console.error("Fetch failed for PDF URL:", url, fetchErr);
            throw new Error(`Gagal mengambil data PDF: ${fetchErr.message || "Pastikan file masih tersedia."}`);
          }
        } else {
          return;
        }

        const loadingTask = pdfjsLib.getDocument({
          data: pdfData,
          cMapUrl: 'https://unpkg.com/pdfjs-dist@5.5.207/cmaps/',
          cMapPacked: true,
        });
        
        const pdf = await loadingTask.promise;
        if (!isMounted) return;
        
        if (pdf.numPages === 0) {
          throw new Error("PDF tidak memiliki halaman.");
        }
        
        setNumPages(pdf.numPages);

        const page = await pdf.getPage(currentPage);
        if (!isMounted) return;

        // Adaptive scale
        const initialViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(2, (window.innerWidth - 40) / initialViewport.width);
        const viewport = page.getViewport({ scale: scale || 1.5 });
        
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext: any = {
          canvasContext: context,
          viewport: viewport,
        };
        await page.render(renderContext).promise;
        if (isMounted) setLoading(false);
      } catch (error: any) {
        console.error("Error rendering PDF page:", error);
        if (isMounted) {
          setError(error.message || "Gagal memuat PDF. Pastikan file valid.");
          setLoading(false);
        }
      }
    };

    renderPage();
    return () => { isMounted = false; };
  }, [url, currentPage]);

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full p-4 overflow-auto bg-black/90">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-white text-xs font-bold animate-pulse">Memuat halaman...</p>
          </div>
        </div>
      )}

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
          <div className="p-4 bg-red-500/10 rounded-full">
            <X className="w-12 h-12 text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-white font-bold text-lg">Gagal Memuat PDF</h3>
            <p className="text-slate-400 text-sm max-w-xs">{error}</p>
          </div>
        </div>
      ) : (
        <div className={`shadow-2xl rounded-lg overflow-hidden border ${isDarkMode ? "border-slate-700" : "border-slate-200"} bg-white`}>
          <canvas ref={canvasRef} className="max-w-full h-auto" />
        </div>
      )}

      {!error && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-white shadow-2xl z-20">
          <button 
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Halaman</span>
            <span className="font-bold tabular-nums">{currentPage} <span className="text-slate-500">/</span> {numPages}</span>
          </div>
          <button 
            disabled={currentPage >= numPages}
            onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
            className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}

function ToolView({ tool, onBack, isDarkMode, onComplete }: { tool: PDFTool, onBack: () => void, isDarkMode: boolean, onComplete: (fileName?: string, url?: string, thumbnail?: string | null) => void }) {
  const [step, setStep] = useState<"upload" | "processing" | "result">("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultThumbnail, setResultThumbnail] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewHeight, setPreviewHeight] = useState(300);
  const [showPreview, setShowPreview] = useState(true);
  const [quality, setQuality] = useState<"high" | "medium" | "low">("medium");

  // Watermark states for "Kunci PDF"
  const [watermarkText, setWatermarkText] = useState("DILINDUNGI PINTARPDF");
  const [watermarkFontSize, setWatermarkFontSize] = useState(40);
  const [watermarkColor, setWatermarkColor] = useState("#000000");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  const [watermarkRotation, setWatermarkRotation] = useState(-45);
  const [watermarkFont, setWatermarkFont] = useState<keyof typeof StandardFonts>("HelveticaBold");

  // Print states for "Cetak PDF"
  const [printPages, setPrintPages] = useState<"all" | "range">("all");
  const [printPageRange, setPrintPageRange] = useState("");
  const [printOrientation, setPrintOrientation] = useState<"portrait" | "landscape">("portrait");
  const [printCopies, setPrintCopies] = useState(1);
  const [printColor, setPrintColor] = useState<"color" | "grayscale">("color");
  const [printPaperSize, setPrintPaperSize] = useState<"A4" | "Letter" | "Legal">("A4");
  const [printMargin, setPrintMargin] = useState<"none" | "small" | "normal">("normal");

  // Page Numbering states for "Tambah Nomor"
  const [pageNumberStart, setPageNumberStart] = useState(1);
  const [pageNumberFormat, setPageNumberFormat] = useState("Halaman {n}");
  const [pageNumberPosition, setPageNumberPosition] = useState<"bottom" | "top" | "bottom-right" | "bottom-left">("bottom");

  const parsePageRange = (range: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = range.split(',').map(p => p.trim());
    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map(p => p.trim());
        const start = parseInt(startStr);
        const end = parseInt(endStr);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
            pages.add(i - 1);
          }
        }
      } else {
        const page = parseInt(part);
        if (!isNaN(page) && page >= 1 && page <= maxPages) {
          pages.add(page - 1);
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  useEffect(() => {
    if (resultBlob) {
      const url = URL.createObjectURL(resultBlob);
      setResultUrl(url);
      // Generate thumbnail directly from blob to avoid fetch errors
      generatePDFThumbnail(resultBlob).then(setResultThumbnail);
      return () => URL.revokeObjectURL(url);
    } else {
      setResultUrl(null);
      setResultThumbnail(null);
    }
  }, [resultBlob]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      if (tool.id === "gabung-pdf") {
        setFiles(prev => [...prev, ...selectedFiles]);
      } else {
        setFiles([selectedFiles[0]]);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(selectedFiles[0] as Blob));
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      
      // If we removed the first file and there's a preview, update it
      if (index === 0 && previewUrl) {
        URL.revokeObjectURL(previewUrl);
        if (newFiles.length > 0 && newFiles[0].type === "application/pdf") {
          setPreviewUrl(URL.createObjectURL(newFiles[0]));
        } else {
          setPreviewUrl(null);
        }
      } else if (newFiles.length === 0 && previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      return newFiles;
    });
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleUpload = async () => {
    if (files.length === 0) return;
    setStep("processing");
    setProgress(0);
    setResultBlob(null); // Clear previous result
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          return 90;
        }
        return prev + 2;
      });
    }, 100);

    try {
      const firstFile = files[0];
      if (tool.id === "gambar-ke-pdf" && firstFile.type.startsWith("image/")) {
        const doc = new jsPDF();
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgData = e.target?.result as string;
          const img = new Image();
          img.onload = () => {
            const imgWidth = doc.internal.pageSize.getWidth();
            const imgHeight = (img.height * imgWidth) / img.width;
            doc.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
            const blob = doc.output('blob');
            setResultBlob(blob);
            clearInterval(interval);
            setProgress(100);
            setTimeout(() => {
              setStep("result");
              onComplete(firstFile.name);
            }, 500);
          };
          img.src = imgData;
        };
        reader.readAsDataURL(firstFile);
      } else if (firstFile.type === "application/pdf" || firstFile.name.toLowerCase().endsWith(".pdf") || tool.id === "gabung-pdf") {
        let blob: Blob | null = null;

        if (tool.id === "gabung-pdf") {
          const mergedPdf = await PDFDocument.create();
          for (const f of files) {
            const bytes = await f.arrayBuffer();
            const pdf = await PDFDocument.load(bytes);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
          }
          const pdfBytes = await mergedPdf.save({
            useObjectStreams: quality !== "high",
          });
          blob = new Blob([pdfBytes], { type: 'application/pdf' });
        } else {
          const arrayBuffer = await firstFile.arrayBuffer();
          if (tool.id === "pdf-ke-gambar" || tool.id === "pdf-ke-html" || tool.id === "pdf-ke-svg" || tool.id === "pdf-ke-word" || tool.id === "pdf-ke-excel") {
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 });

            if (tool.id === "pdf-ke-gambar") {
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              await (page as any).render({ canvasContext: context!, viewport }).promise;
              const dataUrl = canvas.toDataURL('image/png');
              const res = await fetch(dataUrl);
              blob = await res.blob();
            } else if (tool.id === "pdf-ke-html") {
              const textContent = await page.getTextContent();
              const text = textContent.items.map((item: any) => item.str).join(' ');
              const html = `<!DOCTYPE html><html><head><title>PintarPDF Export</title><style>body{font-family:sans-serif;padding:40px;line-height:1.6;}</style></head><body><h1>${firstFile.name}</h1><p>${text}</p></body></html>`;
              blob = new Blob([html], { type: 'text/html' });
            } else if (tool.id === "pdf-ke-svg") {
              const operatorList = await page.getOperatorList();
              const svgGfx = new (pdfjsLib as any).SVGGraphics(page.commonObjs, page.objs);
              const svgElement = await svgGfx.getSVG(operatorList, viewport);
              const svgString = new XMLSerializer().serializeToString(svgElement);
              blob = new Blob([svgString], { type: 'image/svg+xml' });
            } else if (tool.id === "pdf-ke-word") {
              const textContent = await page.getTextContent();
              const text = textContent.items.map((item: any) => item.str).join('\n');
              const wordHtml = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head><meta charset='utf-8'><title>Export</title></head>
                <body>${text.replace(/\n/g, '<br>')}</body>
                </html>
              `;
              blob = new Blob(['\ufeff', wordHtml], { type: 'application/msword' });
            } else if (tool.id === "pdf-ke-excel") {
              const textContent = await page.getTextContent();
              const text = textContent.items.map((item: any) => item.str).join(',');
              blob = new Blob([text], { type: 'application/vnd.ms-excel' });
            }
          } else {
            // PDF Manipulations using pdf-lib
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            
            if (tool.id === "pisah-pdf") {
              // Keep only first page
              const pageCount = pdfDoc.getPageCount();
              for (let i = pageCount - 1; i > 0; i--) {
                pdfDoc.removePage(i);
              }
            } else if (tool.id === "putar-pdf") {
              const pages = pdfDoc.getPages();
              pages.forEach(p => p.setRotation(degrees(90)));
            } else if (tool.id === "hapus-halaman") {
              if (pdfDoc.getPageCount() > 1) {
                pdfDoc.removePage(0);
              }
            } else if (tool.id === "tambah-nomor") {
              const pages = pdfDoc.getPages();
              const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
              pages.forEach((p, i) => {
                const pageNum = pageNumberStart + i;
                const text = pageNumberFormat
                  .replaceAll("{n}", pageNum.toString())
                  .replaceAll("{total}", pages.length.toString());
                
                const { width, height } = p.getSize();
                const fontSize = 10;
                const textWidth = font.widthOfTextAtSize(text, fontSize);
                
                let x = width / 2 - textWidth / 2;
                let y = 20;
                
                if (pageNumberPosition === "top") {
                  y = height - 30;
                } else if (pageNumberPosition === "bottom-right") {
                  x = width - textWidth - 30;
                } else if (pageNumberPosition === "bottom-left") {
                  x = 30;
                }
                
                p.drawText(text, {
                  x,
                  y,
                  size: fontSize,
                  font: font,
                  color: rgb(0.5, 0.5, 0.5),
                });
              });
            } else if (tool.id === "kunci-pdf") {
              const pages = pdfDoc.getPages();
              const font = await pdfDoc.embedFont(StandardFonts[watermarkFont]);
              const color = hexToRgb(watermarkColor);
              
              pages.forEach(p => {
                const { width, height } = p.getSize();
                const textWidth = font.widthOfTextAtSize(watermarkText, watermarkFontSize);
                const textHeight = font.heightAtSize(watermarkFontSize);
                
                p.drawText(watermarkText, {
                  x: width / 2 - textWidth / 2,
                  y: height / 2 - textHeight / 2,
                  size: watermarkFontSize,
                  font: font,
                  color: color,
                  opacity: watermarkOpacity,
                  rotate: degrees(watermarkRotation),
                });
              });
            } else if (tool.id === "tanda-tangan") {
              const pages = pdfDoc.getPages();
              const lastPage = pages[pages.length - 1];
              lastPage.drawText('Tertanda, User PintarPDF', {
                x: 50,
                y: 50,
                size: 12,
                color: rgb(0, 0, 0.8),
              });
            } else if (tool.id === "cetak-pdf") {
              // Handle page selection
              let finalPdf = await PDFDocument.create();
              const maxPages = pdfDoc.getPageCount();
              let selectedIndices: number[] = [];
              
              if (printPages === "range" && printPageRange) {
                selectedIndices = parsePageRange(printPageRange, maxPages);
                if (selectedIndices.length === 0) {
                  selectedIndices = pdfDoc.getPageIndices();
                }
              } else {
                selectedIndices = pdfDoc.getPageIndices();
              }

              // Handle copies
              for (let c = 0; c < printCopies; c++) {
                // We need to re-embed/re-copy for each copy to be safe
                for (const index of selectedIndices) {
                  const sourcePage = pdfDoc.getPage(index);
                  const { width: origWidth, height: origHeight } = sourcePage.getSize();
                  
                  // Determine target size
                  let targetSize = PageSizes.A4;
                  if (printPaperSize === "Letter") targetSize = PageSizes.Letter;
                  else if (printPaperSize === "Legal") targetSize = PageSizes.Legal;
                  
                  let [targetWidth, targetHeight] = targetSize;
                  
                  // Swap for landscape
                  if (printOrientation === "landscape") {
                    [targetWidth, targetHeight] = [targetHeight, targetWidth];
                  }
                  
                  const newPage = finalPdf.addPage([targetWidth, targetHeight]);
                  
                  // Embed the page
                  const embeddedPage = await finalPdf.embedPage(sourcePage);
                  
                  // Handle margins
                  let margin = 0;
                  if (printMargin === "small") margin = 10;
                  else if (printMargin === "normal") margin = 25;
                  
                  const availableWidth = targetWidth - (margin * 2);
                  const availableHeight = targetHeight - (margin * 2);
                  
                  // Calculate scale to fit (maintain aspect ratio)
                  const scale = Math.min(availableWidth / origWidth, availableHeight / origHeight);
                  const x = margin + (availableWidth - origWidth * scale) / 2;
                  const y = margin + (availableHeight - origHeight * scale) / 2;
                  
                  newPage.drawPage(embeddedPage, {
                    x,
                    y,
                    width: origWidth * scale,
                    height: origHeight * scale,
                  });

                  // Grayscale simulation (very basic: add a semi-transparent gray overlay if grayscale is selected)
                  // Note: This isn't true grayscale conversion of content, but a visual effect
                  if (printColor === "grayscale") {
                    newPage.drawRectangle({
                      x: 0,
                      y: 0,
                      width: targetWidth,
                      height: targetHeight,
                      color: rgb(0.5, 0.5, 0.5),
                      opacity: 0.1, // Very subtle, true grayscale is too complex for client-side without heavy libs
                    });
                  }
                }
              }
              
              const pdfBytes = await finalPdf.save({ useObjectStreams: quality !== "high" });
              blob = new Blob([pdfBytes], { type: 'application/pdf' });
            }
            
            if (!blob) {
              const pdfBytes = await pdfDoc.save({
                useObjectStreams: quality !== "high",
              });
              blob = new Blob([pdfBytes], { type: 'application/pdf' });
            }
          }
        }

        if (blob) {
          setResultBlob(blob);
          clearInterval(interval);
          setProgress(100);
          setTimeout(() => {
            setStep("result");
            onComplete(firstFile.name, resultUrl || undefined, resultThumbnail);
          }, 500);
        }
      } else if (tool.id === "word-ke-pdf" || tool.id === "excel-ke-pdf") {
        // Simulated conversion from text-based files to PDF
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const doc = new jsPDF();
          doc.setFontSize(12);
          doc.text(`Hasil Konversi ${tool.name}`, 20, 20);
          doc.text(`Nama File: ${firstFile.name}`, 20, 30);
          doc.text("Isi Dokumen (Pratinjau):", 20, 45);
          doc.setFontSize(10);
          doc.text(content.substring(0, 500) + "...", 20, 55, { maxWidth: 170 });
          const blob = doc.output('blob');
          setResultBlob(blob);
          clearInterval(interval);
          setProgress(100);
          setTimeout(() => {
            setStep("result");
            onComplete(firstFile.name, resultUrl || undefined, resultThumbnail);
          }, 500);
        };
        reader.readAsText(firstFile);
      } else {
        // Default report for other tools
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(37, 99, 235);
        doc.text("PintarPDF - Laporan Hasil Proses", 20, 30);
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 35, 190, 35);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Alat yang digunakan: ${tool.name}`, 20, 50);
        doc.text(`Nama File Asal: ${firstFile.name}`, 20, 60);
        doc.text(`Ukuran File: ${(firstFile.size / 1024 / 1024).toFixed(2)} MB`, 20, 70);
        doc.text(`Waktu Proses: ${new Date().toLocaleString()}`, 20, 80);
        doc.setFontSize(14);
        doc.text("Status: Berhasil", 20, 100);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const description = tool.description || "Proses dokumen telah selesai dilakukan dengan aman.";
        doc.text(description, 20, 115, { maxWidth: 170 });
        doc.text("Terima kasih telah menggunakan PintarPDF.", 20, 140);
        const blob = doc.output('blob');
        setResultBlob(blob);
        setTimeout(() => {
          setStep("result");
          onComplete(firstFile.name, resultUrl || undefined, resultThumbnail);
        }, 3500);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      let message = "Terjadi kesalahan saat memproses file.";
      if (error instanceof Error && error.message.includes("PDF")) {
        message = "File yang diunggah mungkin bukan PDF yang valid atau rusak.";
      }
      alert(message);
      setStep("upload");
    }
  };

  const Icon = IconMap[tool.icon] || FileText;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mt-6"
    >
      <button onClick={onBack} className="flex items-center gap-2 text-blue-500 font-bold mb-6 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Kembali
      </button>

      <div className={`p-8 rounded-[2.5rem] shadow-xl ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-[1.5rem]">
            <Icon className="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{tool.name}</h2>
            <p className="text-slate-400 text-sm">Proses dokumen Anda dengan cepat dan aman.</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <label 
                className={`border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer ${isDarkMode ? "border-slate-700 hover:border-blue-500 hover:bg-slate-700/50" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/50"}`}
              >
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                  multiple={tool.id === "gabung-pdf"}
                  accept={(() => {
                    if (tool.id.startsWith("pdf-ke-") || ["pisah-pdf", "kompres-pdf", "atur-halaman", "hapus-halaman", "putar-pdf", "tambah-nomor", "cetak-pdf", "kunci-pdf", "buka-kunci", "tanda-tangan"].includes(tool.id)) {
                      return ".pdf";
                    }
                    if (tool.id === "gambar-ke-pdf") {
                      return ".png,.jpg,.jpeg";
                    }
                    if (tool.id === "word-ke-pdf") {
                      return ".doc,.docx";
                    }
                    if (tool.id === "excel-ke-pdf") {
                      return ".xls,.xlsx";
                    }
                    if (tool.id === "gabung-pdf") {
                      return ".pdf";
                    }
                    return ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg";
                  })()}
                />
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Upload className="w-10 h-10 text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">Klik atau seret {tool.id === "gabung-pdf" ? "file-file" : "file"} ke sini</p>
                  <p className="text-slate-400 text-sm mt-1">Maksimal ukuran file: 50MB</p>
                </div>
              </label>

              {files.length > 0 && (
                <div className="space-y-6">
                  {/* File List for Merging */}
                  {tool.id === "gabung-pdf" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Daftar File ({files.length})</h4>
                        <button 
                          onClick={() => setFiles([])}
                          className="text-[10px] font-bold text-red-500 hover:underline uppercase"
                        >
                          Hapus Semua
                        </button>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                        {files.map((f, i) => (
                          <div key={i} className={`flex items-center justify-between p-3 rounded-2xl border ${isDarkMode ? "bg-slate-900/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <FileText className="w-4 h-4 text-blue-500" />
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-xs font-bold truncate">{f.name}</p>
                                <p className="text-[10px] text-slate-400">{(f.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <button onClick={() => removeFile(i)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quality Options */}
                  <div className={`p-6 rounded-3xl border-2 space-y-4 ${isDarkMode ? "bg-slate-900/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-blue-500" />
                      <h4 className="font-bold text-sm uppercase tracking-wider">Opsi Kualitas & Ukuran</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {(["low", "medium", "high"] as const).map((q) => (
                        <button
                          key={q}
                          onClick={() => setQuality(q)}
                          className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                            quality === q
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-transparent bg-white dark:bg-slate-800"
                          }`}
                        >
                          <span className={`text-[10px] font-black uppercase tracking-widest ${quality === q ? "text-blue-600" : "text-slate-400"}`}>
                            {q === "low" ? "Kecil" : q === "medium" ? "Optimal" : "Tinggi"}
                          </span>
                          <span className="text-[9px] text-slate-400 text-center leading-tight">
                            {q === "low" ? "Kualitas Rendah" : q === "medium" ? "Kualitas Sedang" : "Kualitas Asli"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PDF Preview Feature */}
                  {(files[0]?.type === "application/pdf" || files[0]?.name.toLowerCase().endsWith(".pdf")) && previewUrl && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Pratinjau Dokumen</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400">UKURAN</span>
                            <input 
                              type="range" 
                              min="200" 
                              max="800" 
                              step="50"
                              value={previewHeight} 
                              onChange={(e) => setPreviewHeight(parseInt(e.target.value))}
                              className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>
                          <button 
                            onClick={() => setShowPreview(!showPreview)}
                            className={`p-2 rounded-xl transition-all ${isDarkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-100 hover:bg-slate-200"}`}
                            title={showPreview ? "Sembunyikan Preview" : "Tampilkan Preview"}
                          >
                            {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {showPreview && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: previewHeight, opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className={`relative overflow-hidden rounded-3xl border-2 ${isDarkMode ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                          >
                            <PDFCanvasPreview 
                              url={previewUrl} 
                              height={previewHeight} 
                              isDarkMode={isDarkMode} 
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {tool.id === "kunci-pdf" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-6 rounded-3xl border-2 space-y-4 ${isDarkMode ? "bg-slate-900/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <PenTool className="w-5 h-5 text-blue-500" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">Pengaturan Watermark</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Teks Watermark</label>
                          <input 
                            type="text" 
                            value={watermarkText} 
                            onChange={(e) => setWatermarkText(e.target.value)}
                            placeholder="Masukkan teks watermark..."
                            className={`w-full p-3 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warna & Opasitas</label>
                          <div className="flex gap-3">
                            <div className="relative group">
                              <input 
                                type="color" 
                                value={watermarkColor} 
                                onChange={(e) => setWatermarkColor(e.target.value)}
                                className="h-11 w-11 rounded-xl cursor-pointer border-none bg-transparent"
                              />
                            </div>
                            <div className={`flex-1 flex items-center gap-3 px-4 rounded-xl border ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                              <span className="text-xs font-mono font-bold text-blue-500 min-w-[35px]">{Math.round(watermarkOpacity * 100)}%</span>
                              <input 
                                type="range" 
                                min="0.1" 
                                max="1" 
                                step="0.1"
                                value={watermarkOpacity} 
                                onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                                className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Font & Ukuran ({watermarkFontSize}px)</label>
                          <div className="flex gap-3">
                            <select 
                              value={watermarkFont}
                              onChange={(e) => setWatermarkFont(e.target.value as any)}
                              className={`flex-1 p-3 rounded-xl border text-sm outline-none ${isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                            >
                              <option value="HelveticaBold">Helvetica Bold</option>
                              <option value="Helvetica">Helvetica</option>
                              <option value="TimesRomanBold">Times Bold</option>
                              <option value="TimesRoman">Times</option>
                              <option value="CourierBold">Courier Bold</option>
                              <option value="Courier">Courier</option>
                            </select>
                            <div className={`flex items-center px-4 rounded-xl border ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                              <input 
                                type="range" 
                                min="10" 
                                max="150" 
                                value={watermarkFontSize} 
                                onChange={(e) => setWatermarkFontSize(parseInt(e.target.value))}
                                className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rotasi ({watermarkRotation}°)</label>
                          <div className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                            <RotateCw className={`w-4 h-4 text-blue-500 transition-transform`} style={{ transform: `rotate(${watermarkRotation}deg)` }} />
                            <input 
                              type="range" 
                              min="-180" 
                              max="180" 
                              value={watermarkRotation} 
                              onChange={(e) => setWatermarkRotation(parseInt(e.target.value))}
                              className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {tool.id === "cetak-pdf" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-6 rounded-3xl border-2 space-y-6 ${isDarkMode ? "bg-slate-900/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Printer className="w-5 h-5 text-blue-500" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">Pengaturan Cetak</h4>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Halaman</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => setPrintPages("all")}
                              className={`p-3 rounded-xl border-2 transition-all text-sm font-bold ${printPages === "all" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-transparent bg-white dark:bg-slate-800 text-slate-500"}`}
                            >
                              Semua Halaman
                            </button>
                            <button 
                              onClick={() => setPrintPages("range")}
                              className={`p-3 rounded-xl border-2 transition-all text-sm font-bold ${printPages === "range" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-transparent bg-white dark:bg-slate-800 text-slate-500"}`}
                            >
                              Rentang Kustom
                            </button>
                          </div>
                          {printPages === "range" && (
                            <input 
                              type="text" 
                              value={printPageRange}
                              onChange={(e) => setPrintPageRange(e.target.value)}
                              placeholder="Contoh: 1-3, 5, 8-10"
                              className={`w-full p-3 mt-2 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                            />
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ukuran Kertas</label>
                            <select 
                              value={printPaperSize}
                              onChange={(e) => setPrintPaperSize(e.target.value as any)}
                              className={`w-full p-3 rounded-xl border text-sm outline-none ${isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                            >
                              <option value="A4">A4 (210 x 297 mm)</option>
                              <option value="Letter">Letter (8.5 x 11 in)</option>
                              <option value="Legal">Legal (8.5 x 14 in)</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Margin</label>
                            <div className="flex gap-1">
                              {(["none", "small", "normal"] as const).map((m) => (
                                <button 
                                  key={m}
                                  onClick={() => setPrintMargin(m)}
                                  className={`flex-1 py-3 rounded-xl border-2 transition-all text-[10px] font-bold capitalize ${printMargin === m ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-transparent bg-white dark:bg-slate-800 text-slate-500"}`}
                                >
                                  {m === "none" ? "Tanpa" : m === "small" ? "Kecil" : "Normal"}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warna</label>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setPrintColor("color")}
                                className={`flex-1 p-3 rounded-xl border-2 transition-all text-xs font-bold ${printColor === "color" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-transparent bg-white dark:bg-slate-800 text-slate-500"}`}
                              >
                                Berwarna
                              </button>
                              <button 
                                onClick={() => setPrintColor("grayscale")}
                                className={`flex-1 p-3 rounded-xl border-2 transition-all text-xs font-bold ${printColor === "grayscale" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-transparent bg-white dark:bg-slate-800 text-slate-500"}`}
                              >
                                Abu-abu
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Orientasi</label>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setPrintOrientation("portrait")}
                                className={`flex-1 p-3 rounded-xl border-2 transition-all text-xs font-bold ${printOrientation === "portrait" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-transparent bg-white dark:bg-slate-800 text-slate-500"}`}
                              >
                                Potret
                              </button>
                              <button 
                                onClick={() => setPrintOrientation("landscape")}
                                className={`flex-1 p-3 rounded-xl border-2 transition-all text-xs font-bold ${printOrientation === "landscape" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-transparent bg-white dark:bg-slate-800 text-slate-500"}`}
                              >
                                Lanskap
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jumlah Salinan ({printCopies})</label>
                            <div className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                              <input 
                                type="range" 
                                min="1" 
                                max="10" 
                                value={printCopies} 
                                onChange={(e) => setPrintCopies(parseInt(e.target.value))}
                                className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {tool.id === "tambah-nomor" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-6 rounded-3xl border-2 space-y-6 ${isDarkMode ? "bg-slate-900/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="w-5 h-5 text-blue-500" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">Pengaturan Nomor Halaman</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mulai Dari</label>
                          <input 
                            type="number" 
                            min="1"
                            value={pageNumberStart} 
                            onChange={(e) => setPageNumberStart(parseInt(e.target.value) || 1)}
                            className={`w-full p-3 rounded-xl border text-sm outline-none ${isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Format (Gunakan {"{n}"} & {"{total}"})</label>
                          <input 
                            type="text" 
                            value={pageNumberFormat} 
                            onChange={(e) => setPageNumberFormat(e.target.value)}
                            placeholder="Contoh: Halaman {n} dari {total}"
                            className={`w-full p-3 rounded-xl border text-sm outline-none ${isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posisi Nomor</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {(["bottom", "top", "bottom-right", "bottom-left"] as const).map((pos) => (
                              <button 
                                key={pos}
                                onClick={() => setPageNumberPosition(pos)}
                                className={`p-3 rounded-xl border-2 transition-all text-[10px] font-bold capitalize ${pageNumberPosition === pos ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-transparent bg-white dark:bg-slate-800 text-slate-500"}`}
                              >
                                {pos.replace("-", " ")}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {tool.id === "gambar-ke-pdf" && files[0]?.type.startsWith("image/") && (
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img 
                        src={URL.createObjectURL(files[0])} 
                        alt="Preview" 
                        className="w-full h-full object-contain bg-slate-50 dark:bg-slate-900"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  {tool.id !== "gabung-pdf" && files[0] && (
                    <div className={`p-4 rounded-2xl flex items-center justify-between ${isDarkMode ? "bg-slate-700" : "bg-slate-100"}`}>
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-blue-500" />
                        <div className="flex flex-col">
                          <span className="font-medium text-sm truncate max-w-[200px]">{files[0].name}</span>
                          <span className="text-[10px] text-slate-400">{(files[0].size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      </div>
                      <button onClick={() => setFiles([])} className="p-1 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button 
                disabled={files.length === 0}
                onClick={handleUpload}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-95 shadow-lg ${files.length > 0 ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20" : "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700"}`}
              >
                {tool.id === "cetak-pdf" ? "Buka Pratinjau Cetak" : "Mulai Proses"}
              </button>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center justify-center gap-6"
            >
              <div className="relative">
                <Loader2 className="w-24 h-24 text-blue-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileUp className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold">Sedang Memproses...</h3>
                <p className="text-slate-400 mt-2">{progress}% Selesai</p>
              </div>
              <div className="w-full max-w-xs h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-blue-600"
                />
              </div>
            </motion.div>
          )}

          {step === "result" && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-8 flex flex-col items-center justify-center gap-8"
            >
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold">{tool.id === "cetak-pdf" ? "Pratinjau Cetak Siap" : "Berhasil!"}</h3>
                <p className="text-slate-400 mt-2">{tool.id === "cetak-pdf" ? "Silakan periksa pratinjau sebelum mencetak." : "File Anda telah berhasil diproses."}</p>
              </div>
              
              <div className={`w-full p-6 rounded-3xl border ${isDarkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="font-bold truncate max-w-[150px]">PintarPDF_{files[0]?.name || "Hasil"}</p>
                      <p className="text-xs text-slate-400">PDF • {(resultBlob ? (resultBlob.size / 1024 / 1024).toFixed(2) : "1.2")} MB</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (!resultBlob) return;
                      const url = window.URL.createObjectURL(resultBlob);
                      const a = document.createElement("a");
                      a.href = url;
                      
                      // Determine extension based on tool
                      let ext = "pdf";
                      if (tool.id === "pdf-ke-gambar") ext = "png";
                      else if (tool.id === "pdf-ke-html") ext = "html";
                      else if (tool.id === "pdf-ke-svg") ext = "svg";
                      else if (tool.id === "pdf-ke-word") ext = "doc";
                      else if (tool.id === "pdf-ke-excel") ext = "xls";
                      
                      a.download = `PintarPDF_${files[0]?.name.split('.')[0] || "dokumen"}.${ext}`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                    className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <Download className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Result Preview */}
              {resultBlob && (tool.id.includes("pdf") || tool.id.includes("ke-pdf")) && (
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-2 px-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Pratinjau Hasil</span>
                  </div>
                  <div className={`relative overflow-hidden rounded-3xl border-2 h-[300px] ${isDarkMode ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                    <PDFCanvasPreview 
                      url={resultUrl || ""} 
                      data={resultBlob}
                      height={300} 
                      isDarkMode={isDarkMode} 
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4 w-full">
                {tool.id === "cetak-pdf" && (
                  <button 
                    onClick={() => {
                      if (!resultUrl) return;
                      // Using window.open is more reliable for PDFs in iframes to avoid cross-origin print errors
                      const printWindow = window.open(resultUrl, "_blank");
                      if (!printWindow) {
                        alert("Silakan izinkan pop-up untuk mencetak dokumen.");
                      }
                    }}
                    className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    <Printer className="w-5 h-5" />
                    Cetak Sekarang
                  </button>
                )}
                <button 
                  onClick={() => {
                    setStep("upload");
                    setResultBlob(null);
                  }}
                  className={`flex-1 py-4 rounded-2xl font-bold border transition-colors ${isDarkMode ? "border-slate-700 hover:bg-slate-700" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  {tool.id === "cetak-pdf" ? "Ubah Pengaturan" : "Proses Lagi"}
                </button>
                <button 
                  onClick={onBack}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const generatePDFThumbnail = async (source: string | Blob | Uint8Array) => {
  if (!source) return null;
  try {
    let data: Uint8Array;
    if (source instanceof Blob) {
      data = new Uint8Array(await source.arrayBuffer());
    } else if (source instanceof Uint8Array) {
      data = source;
    } else {
      // If it's a string (URL)
      try {
        const response = await fetch(source);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        data = new Uint8Array(arrayBuffer);
      } catch (e) {
        console.warn("Could not fetch PDF for thumbnail:", source, e);
        return null; // Silently fail for thumbnails
      }
    }

    const loadingTask = pdfjsLib.getDocument({
      data,
      cMapUrl: 'https://unpkg.com/pdfjs-dist@5.5.207/cmaps/',
      cMapPacked: true,
    });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.3 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const renderContext: any = { canvasContext: context!, viewport };
    await page.render(renderContext).promise;
    const dataUrl = canvas.toDataURL();
    // Cleanup
    pdf.destroy();
    return dataUrl;
  } catch (err) {
    console.error("Error generating thumbnail:", err);
    return null;
  }
};

function ReaderView({ isDarkMode, history, readerHistory, setReaderHistory }: { isDarkMode: boolean, history: any[], readerHistory: any[], setReaderHistory: (h: any[]) => void }) {
  const [viewFile, setViewFile] = useState<{ name: string, url: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const syncHistory = async () => {
      if (history.length > readerHistory.length) {
        const newItemsFromHistory = history.filter(h => !readerHistory.find(lh => lh.id === h.id));
        if (newItemsFromHistory.length === 0) return;

        const newItems = await Promise.all(newItemsFromHistory.map(async (item: any) => {
          let thumbnail = item.thumbnail || null;
          if (!thumbnail && item.url) {
            thumbnail = await generatePDFThumbnail(item.url);
          }
          return {
            ...item,
            isFavorite: false,
            isFinished: false,
            isCollection: false,
            progress: 0,
            thumbnail
          };
        }));
        setReaderHistory([...newItems, ...readerHistory]);
      }
    };
    syncHistory();
  }, [history]);

  const handleShare = async (item: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.fileName,
          text: `Lihat file PDF ini: ${item.fileName}`,
          url: item.url || window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      alert("Fitur share tidak didukung di browser ini. URL: " + (item.url || "Tidak tersedia"));
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      const thumbnail = await generatePDFThumbnail(url);
      
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + " MB",
        date: new Date().toLocaleString("id-ID"),
        status: "Selesai",
        url,
        thumbnail,
        isFavorite: false,
        isFinished: false,
        isCollection: false,
        progress: 0
      };

      setReaderHistory([newItem, ...readerHistory]);
      setViewFile({ name: file.name, url });
    }
  };

  const handleFolderChange = async (e: any) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsScanning(true);
    const pdfFiles = Array.from(files as FileList).filter(f => f.name.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      alert("Tidak ditemukan file PDF di folder ini.");
      setIsScanning(false);
      return;
    }

    const newItems = await Promise.all(pdfFiles.map(async (file) => {
      const url = URL.createObjectURL(file);
      const thumbnail = await generatePDFThumbnail(url);
      return {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + " MB",
        date: new Date().toLocaleString("id-ID"),
        status: "Selesai",
        url,
        thumbnail,
        isFavorite: false,
        isFinished: false,
        isCollection: false,
        progress: 0
      };
    }));

    setReaderHistory([...newItems, ...readerHistory]);
    setIsScanning(false);
  };

  const toggleStatus = (id: string, field: 'isFavorite' | 'isFinished' | 'isCollection') => {
    setReaderHistory(readerHistory.map(item => 
      item.id === id ? { ...item, [field]: !item[field] } : item
    ));
  };

  const filteredHistory = readerHistory.filter(item => 
    item.fileName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (viewFile) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex flex-col bg-black"
      >
        <div className="p-4 flex items-center justify-between bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button onClick={() => setViewFile(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="font-bold text-sm truncate max-w-[200px]">{viewFile.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-800 rounded-full" onClick={() => alert("Fitur Pencarian dalam PDF akan segera hadir!")}><Search className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-slate-800 rounded-full" onClick={() => alert("Menu Opsi PDF")}><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <PDFCanvasPreview 
            url={viewFile.url} 
            height={window.innerHeight - 64} 
            isDarkMode={isDarkMode} 
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col min-h-screen -mx-4 -mt-4"
    >
      {/* Content */}
      <div className={`flex-1 p-4 space-y-4 ${isDarkMode ? "bg-[#0a1a1a]" : "bg-slate-50"}`}>
        {/* Search Bar inside content since header 2 is removed */}
        <div className="flex gap-3 mb-6">
          <div className={`flex-1 p-4 rounded-3xl shadow-lg ${isDarkMode ? "bg-slate-800" : "bg-white border border-slate-100"}`}>
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-slate-400" : "text-blue-500"}`} />
              <input 
                type="text" 
                placeholder="Cari di riwayat baca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-2xl outline-none transition-all ${isDarkMode ? "bg-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500" : "bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400"}`}
              />
            </div>
          </div>
          <label className={`p-4 rounded-3xl shadow-lg flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 ${isDarkMode ? "bg-slate-800 text-white" : "bg-white border border-slate-100 text-blue-600"}`}>
            {isScanning ? <Loader2 className="w-6 h-6 animate-spin" /> : <Folder className="w-6 h-6" />}
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFolderChange} 
              {...({ webkitdirectory: "", directory: "" } as any)} 
            />
          </label>
        </div>

        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-slate-800"}`}>Sedang dibaca</h3>
          <button onClick={() => alert("Menu Opsi")} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {filteredHistory.length > 0 ? (
          filteredHistory.map((item, i) => {
            const colors = [
              { bg: "bg-[#E0D7FF]", border: "border-[#D0C7FF]", text: "text-slate-800", accent: "bg-[#5A4AD1]" }, // Purple
              { bg: "bg-[#D1F5F2]", border: "border-[#C1E5E2]", text: "text-slate-800", accent: "bg-[#00A3A3]" }, // Teal
              { bg: "bg-[#FFF0E0]", border: "border-[#F0E0D0]", text: "text-slate-800", accent: "bg-[#D17A00]" }, // Orange
              { bg: "bg-[#E0EBFF]", border: "border-[#D0DBFF]", text: "text-slate-800", accent: "bg-[#4A7AD1]" }, // Blue
              { bg: "bg-[#FFE0E6]", border: "border-[#F0D0D6]", text: "text-slate-800", accent: "bg-[#D14A61]" }, // Pink
              { bg: "bg-[#E0F7E9]", border: "border-[#D0E7D9]", text: "text-slate-800", accent: "bg-[#2D8A4E]" }, // Green
            ];
            const color = isDarkMode 
              ? { bg: "bg-[#1a2a2a]", border: "border-slate-700", text: "text-white", accent: "bg-blue-500" }
              : colors[i % colors.length];

            return (
              <div 
                key={item.id}
                className={`group relative flex gap-4 p-4 rounded-3xl transition-all hover:scale-[1.01] cursor-pointer border ${color.bg} ${color.border} ${isDarkMode ? "shadow-lg" : "shadow-sm"}`}
                onClick={() => {
                  if (item.url) setViewFile({ name: item.fileName || "dokumen.pdf", url: item.url });
                  else alert("File ini tidak tersedia untuk pratinjau langsung. Silakan buka file PDF baru.");
                }}
              >
                {/* Thumbnail */}
                <div className="w-24 h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-white/50 dark:bg-slate-800 border border-white/20 shadow-sm">
                  <div className="w-full h-full flex items-center justify-center">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <FileText className={`w-10 h-10 ${isDarkMode ? "text-slate-400" : "text-slate-400/50"}`} />
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                  <div className="space-y-1">
                    <h3 className={`font-bold text-sm break-words leading-tight ${color.text}`}>{item.fileName}</h3>
                    <p className={`text-[10px] uppercase font-bold tracking-wider opacity-60 ${color.text}`}>PDF, {item.fileSize || "1.2 MB"}</p>
                  </div>

                  <div className="space-y-3 mt-auto">
                    {/* Progress Bar */}
                    <div className={`relative h-1.5 w-full rounded-full ${isDarkMode ? "bg-slate-700" : "bg-black/5"}`}>
                      <div 
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${item.isFinished ? "bg-green-500" : color.accent}`}
                        style={{ width: `${item.isFinished ? 100 : item.progress}%` }}
                      ></div>
                    </div>

                    {/* Actions */}
                    <div className={`flex items-center justify-between ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleStatus(item.id, 'isFavorite'); }}
                          className={`transition-all transform active:scale-125 ${item.isFavorite ? "text-yellow-500" : "hover:text-blue-500 opacity-40 hover:opacity-100"}`}
                        >
                          <Star className={`w-5 h-5 ${item.isFavorite ? "fill-current" : ""}`} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); alert("Waktu terakhir dibaca: " + item.date); }}
                          className="hover:text-blue-500 transition-all opacity-40 hover:opacity-100"
                        >
                          <Clock className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleStatus(item.id, 'isFinished'); }}
                          className={`transition-all transform active:scale-125 ${item.isFinished ? "text-green-500" : "hover:text-blue-500 opacity-40 hover:opacity-100"}`}
                        >
                          <CheckCircle2 className={`w-5 h-5 ${item.isFinished ? "fill-current" : ""}`} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleStatus(item.id, 'isCollection'); }}
                          className={`transition-all transform active:scale-125 ${item.isCollection ? "text-blue-500" : "hover:text-blue-500 opacity-40 hover:opacity-100"}`}
                        >
                          <Library className={`w-5 h-5 ${item.isCollection ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    <div className="relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.id ? null : item.id); }}
                        className="hover:text-blue-500 transition-all opacity-40 hover:opacity-100 p-1"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {activeMenu === item.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }} />
                          <div className="absolute right-0 bottom-full mb-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden">
                            <button 
                              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                              onClick={(e) => { e.stopPropagation(); handleShare(item); setActiveMenu(null); }}
                            >
                              <Share2 className="w-4 h-4" /> Share
                            </button>
                            <button 
                              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-red-500"
                              onClick={(e) => { e.stopPropagation(); setReaderHistory(readerHistory.filter(h => h.id !== item.id)); setActiveMenu(null); }}
                            >
                              <Trash2 className="w-4 h-4" /> Hapus
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
            <BookOpen className="w-16 h-16 opacity-20" />
            <p className="font-bold">Belum ada dokumen yang dibaca</p>
          </div>
        )}

        {/* Floating Action Button */}
        <label className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-blue-700 transition-all transform hover:scale-110 active:scale-95 cursor-pointer z-30">
          <Upload className="w-6 h-6" />
          <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
        </label>
      </div>
    </motion.div>
  );
}

function HistoryView({ history, isDarkMode, onOpenReader }: { history: any[], isDarkMode: boolean, onOpenReader: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 space-y-6"
    >
      <h2 className="text-2xl font-bold tracking-tight">Riwayat Aktivitas</h2>

      {history.length > 0 ? (
        <div className="space-y-3">
          {history.map(item => (
            <div key={item.id} className={`p-5 rounded-3xl flex items-center justify-between ${isDarkMode ? "bg-slate-800" : "bg-white shadow-sm border border-slate-100"}`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-bold">{item.tool}</p>
                  <p className="text-xs text-slate-500 font-medium">{item.fileName}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{item.date}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
                  {item.status}
                </span>
                <button 
                  onClick={onOpenReader}
                  className="text-[10px] font-bold text-blue-500 hover:underline"
                >
                  Lihat di Reader
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`p-12 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 ${isDarkMode ? "bg-slate-800" : "bg-white border border-slate-100 shadow-sm"}`}>
          <History className="w-16 h-16 text-slate-300" />
          <p className="text-slate-400 font-medium">Belum ada riwayat aktivitas.</p>
        </div>
      )}
    </motion.div>
  );
}

function NotificationsView({ notifications, isDarkMode, onMarkRead, onClear }: { notifications: any[], isDarkMode: boolean, onMarkRead: (id: number) => void, onClear: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Notifikasi</h2>
        {notifications.length > 0 && (
          <button onClick={onClear} className="text-xs font-bold text-red-500 hover:text-red-600">Hapus Semua</button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map(note => (
            <div 
              key={note.id} 
              onClick={() => onMarkRead(note.id)}
              className={`p-6 rounded-[2rem] relative overflow-hidden cursor-pointer transition-all ${isDarkMode ? "bg-slate-800" : "bg-white shadow-md border border-slate-50"} ${!note.read ? "ring-2 ring-blue-500/50" : "opacity-70"}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${note.read ? "bg-slate-100 dark:bg-slate-700" : "bg-blue-50 dark:bg-blue-900/30"}`}>
                  <BellRing className={`w-6 h-6 ${note.read ? "text-slate-400" : "text-blue-600"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-bold text-lg ${note.read ? "text-slate-500" : ""}`}>{note.title}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{note.date}</span>
                  </div>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                    {note.message}
                  </p>
                </div>
              </div>
              {!note.read && <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>}
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-400">Tidak ada notifikasi baru.</div>
        )}
      </div>
    </motion.div>
  );
}

function SettingsView({ isDarkMode, setIsDarkMode }: { isDarkMode: boolean, setIsDarkMode: (val: boolean) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 space-y-8"
    >
      <h2 className="text-2xl font-bold tracking-tight">Pengaturan</h2>

      {/* Mode Gelap/Terang */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tampilan</h3>
        <div className={`p-6 rounded-[2rem] space-y-6 ${isDarkMode ? "bg-slate-800" : "bg-white shadow-md"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-2xl">
                {isDarkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
              </div>
              <div>
                <p className="font-bold">Mode Gelap</p>
                <p className="text-xs text-slate-400">Aktifkan tema gelap aplikasi</p>
              </div>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-14 h-8 rounded-full transition-colors relative ${isDarkMode ? "bg-blue-600" : "bg-slate-200"}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isDarkMode ? "right-1" : "left-1"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Pengaturan Printer */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Printer</h3>
        <div className={`p-6 rounded-[2rem] space-y-6 ${isDarkMode ? "bg-slate-800" : "bg-white shadow-md"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-2xl">
                <Printer className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="font-bold">Konfigurasi Printer</p>
                <p className="text-xs text-slate-400">Kelola driver dan pencarian perangkat</p>
              </div>
            </div>
            <button 
              onClick={() => alert("Gunakan menu 'Cetak PDF' di Sidebar untuk mengatur printer secara detail.")}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Driver Default</span>
              <span className="font-bold text-blue-500">Universal PDF Driver</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PrintView({ isDarkMode, onSelectTool }: { isDarkMode: boolean, onSelectTool: (tool: PDFTool) => void }) {
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>("Universal PDF Driver");
  const [printers, setPrinters] = useState<any[]>([]);

  const DRIVERS = [
    { id: "canon", name: "Canon PIXMA Series", version: "v4.2.1" },
    { id: "epson", name: "Epson L-Series EcoTank", version: "v3.0.5" },
    { id: "hp", name: "HP LaserJet Pro", version: "v5.1.0" },
    { id: "brother", name: "Brother HL-Series", version: "v2.8.9" },
    { id: "universal", name: "Universal PDF Driver", version: "v1.0.0" },
  ];

  const handleSearchPrinters = () => {
    setIsSearching(true);
    setPrinters([]);
    
    // Simulate searching
    setTimeout(() => {
      setPrinters([
        { id: 1, name: "Canon G3010 Series", status: "Online", type: "Inkjet" },
        { id: 2, name: "HP LaserJet M15w", status: "Online", type: "Laser" },
        { id: 3, name: "Epson L3110", status: "Offline", type: "EcoTank" },
      ]);
      setIsSearching(false);
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 space-y-6 pb-20"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Cetak & Printer</h2>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
          Konfigurasi Driver
        </div>
      </div>

      {/* Printer Search Section */}
      <div className={`p-6 rounded-[2rem] border transition-all ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <Search className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h4 className="font-bold">Pencarian Printer</h4>
              <p className="text-xs text-slate-400">Cari perangkat di jaringan lokal</p>
            </div>
          </div>
          <button 
            onClick={handleSearchPrinters}
            disabled={isSearching}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isSearching ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20"}`}
          >
            {isSearching ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Mencari...
              </div>
            ) : "Cari Printer"}
          </button>
        </div>

        <div className="space-y-3">
          {isSearching ? (
            <div className="py-10 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <Printer className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-500" />
              </div>
              <p className="text-sm font-medium animate-pulse">Memindai jaringan lokal...</p>
            </div>
          ) : printers.length > 0 ? (
            printers.map((p) => (
              <button 
                key={p.id}
                onClick={() => setSelectedPrinter(p.name)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedPrinter === p.name ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : isDarkMode ? "border-slate-700 hover:bg-slate-700" : "border-slate-50 hover:bg-slate-50"}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${p.status === "Online" ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                    <Printer className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm">{p.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{p.type} • {p.status}</p>
                  </div>
                </div>
                {selectedPrinter === p.name && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
              </button>
            ))
          ) : (
            <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-2xl">
              <p className="text-sm text-slate-400">Belum ada printer yang ditemukan.</p>
            </div>
          )}
        </div>
      </div>

      {/* Driver Selection Section */}
      <div className={`p-6 rounded-[2rem] border transition-all ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
            <Settings className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h4 className="font-bold">Driver & Kompatibilitas</h4>
            <p className="text-xs text-slate-400">Pilih driver yang sesuai dengan perangkat</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {DRIVERS.map((d) => (
            <button 
              key={d.id}
              onClick={() => setSelectedDriver(d.name)}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedDriver === d.name ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20" : isDarkMode ? "border-slate-700 hover:bg-slate-700" : "border-slate-50 hover:bg-slate-50"}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${selectedDriver === d.name ? "bg-orange-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-400"}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">{d.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Driver Version: {d.version}</p>
                </div>
              </div>
              {selectedDriver === d.name && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Print Action */}
      <div className={`p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 ${isDarkMode ? "bg-blue-600/10 border border-blue-500/20" : "bg-blue-600 text-white shadow-xl shadow-blue-500/20"}`}>
        <Printer className={`w-16 h-16 ${isDarkMode ? "text-blue-500" : "text-white"}`} />
        <div className="text-center">
          <p className="text-lg font-bold">Siap Mencetak Dokumen?</p>
          <p className={`text-sm mt-1 ${isDarkMode ? "text-slate-400" : "text-blue-100"}`}>
            {selectedPrinter ? `Printer Terpilih: ${selectedPrinter}` : "Silakan pilih printer atau unggah file langsung."}
          </p>
        </div>
        <button 
          onClick={() => {
            const tool = PDF_CATEGORIES.flatMap(cat => cat.tools).find(t => t.id === "cetak-pdf");
            if (tool) onSelectTool(tool);
          }}
          className={`px-10 py-4 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-3 ${isDarkMode ? "bg-blue-600 text-white" : "bg-white text-blue-600 hover:bg-blue-50"}`}
        >
          <Upload className="w-5 h-5" /> Mulai Cetak Sekarang
        </button>
      </div>

      <div className={`p-6 rounded-[2rem] ${isDarkMode ? "bg-slate-800" : "bg-orange-50"}`}>
        <div className="flex items-start gap-4">
          <Info className="w-6 h-6 text-orange-500 mt-1" />
          <div>
            <h4 className="font-bold">Informasi Driver</h4>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Driver yang disematkan adalah profil konfigurasi yang mengoptimalkan margin, resolusi, dan profil warna untuk merek printer tertentu. Pastikan printer Anda terhubung ke jaringan Wi-Fi yang sama.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SidebarItem({ icon, label, active = false, onClick, isDarkMode, className = "" }: { icon: ReactNode, label: string, active?: boolean, onClick: () => void, isDarkMode: boolean, className?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
        active 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
          : isDarkMode 
            ? "text-slate-400 hover:bg-slate-700 hover:text-white" 
            : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
      } ${className}`}
    >
      {icon}
      <span className="font-bold tracking-tight">{label}</span>
    </button>
  );
}

function NavItem({ icon, label, active, onClick, isDarkMode }: { icon: ReactNode, label: string, active: boolean, onClick: () => void, isDarkMode: boolean }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-1 group relative"
    >
      <div className={`p-2 rounded-xl transition-all ${
        active 
          ? "text-blue-600 bg-blue-50 dark:bg-blue-600/20" 
          : "text-slate-400 group-hover:text-blue-500"
      }`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold tracking-widest transition-colors ${
        active ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"
      }`}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="activeNav"
          className="absolute -top-1 w-1 h-1 bg-blue-600 rounded-full"
        />
      )}
    </button>
  );
}
