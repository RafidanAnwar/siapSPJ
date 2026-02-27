import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  BarChart3,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  User,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Dashboard from "./components/Dashboard";
import SPJForm from "./components/SPJForm";
import SPJList from "./components/SPJList";
import Reports from "./components/Reports";
import SDD from "./components/SDD";
import { cn } from "./lib/utils";

type Role = "ADMIN" | "BENDAHARA_PENGELUARAN" | "BENDAHARA_PENERIMAAN" | "VERIFIKATOR";

interface UserData {
  username: string;
  role: Role;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "BENDAHARA_PENGELUARAN", "BENDAHARA_PENERIMAAN", "VERIFIKATOR"] },
  { id: "input", label: "Input SPJ Baru", icon: PlusCircle, roles: ["ADMIN", "BENDAHARA_PENGELUARAN", "BENDAHARA_PENERIMAAN"] },
  { id: "list", label: "Data SPJ", icon: FileText, roles: ["ADMIN", "BENDAHARA_PENGELUARAN", "BENDAHARA_PENERIMAAN", "VERIFIKATOR"] },
  { id: "reports", label: "Laporan", icon: BarChart3, roles: ["ADMIN", "BENDAHARA_PENGELUARAN", "BENDAHARA_PENERIMAAN", "VERIFIKATOR"] },
  { id: "sdd", label: "System Design", icon: ShieldCheck, roles: ["ADMIN"] },
];

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isPublicMode, setIsPublicMode] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "public") {
      setIsPublicMode(true);
    }
  }, []);

  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const { username, password } = loginForm;

    if (username === "admin" && password === "admin123") {
      setUser({ username: "Admin", role: "ADMIN" });
    } else if (username === "bendahara_pengeluaran" && password === "ben123") {
      setUser({ username: "Bendahara Pengeluaran", role: "BENDAHARA_PENGELUARAN" });
    } else if (username === "bendahara_penerimaan" && password === "ben123") {
      setUser({ username: "Bendahara Penerimaan", role: "BENDAHARA_PENERIMAAN" });
    } else if (username === "verifikator" && password === "cek123") {
      setUser({ username: "Verifikator SPJ", role: "VERIFIKATOR" });
    } else {
      setError("Username atau password salah");
    }
  }, [loginForm]);

  const handleSuccessSubmit = useCallback(() => setIsSubmitted(true), []);

  const filteredMenu = useMemo(() => {
    if (!user) return [];
    return menuItems.filter(item => item.roles.includes(user.role));
  }, [user]);

  if (isPublicMode) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-md border border-slate-100 p-1">
                <img
                  src="/logo_kemnaker.png"
                  alt="Logo Kemnaker"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">SIAP-SPJ</h1>
                <p className="text-sm text-slate-500">Kementerian Ketenagakerjaan RI</p>
              </div>
            </div>
          </div>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-12 rounded-3xl shadow-xl border border-slate-200 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Data Berhasil Dikirim!</h2>
              <p className="text-slate-500 max-w-md mx-auto">
                Terima kasih. Data pertanggungjawaban Anda telah masuk ke sistem SIAP-SPJ dan akan segera diverifikasi oleh Bendahara.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                Input Data Baru
              </button>
            </motion.div>
          ) : (
            <SPJForm onSuccess={handleSuccessSubmit} />
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-slate-100 p-2">
              <img
                src="/logo_kemnaker.png"
                alt="Logo Kemnaker"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">SIAP-SPJ</h1>
            <p className="text-slate-500 mt-2 italic font-serif">Kementerian Ketenagakerjaan RI</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Masukkan username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Masukkan password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98]"
            >
              Masuk ke Sistem
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Aktualisasi Pranata Keuangan APBN</p>
          </div>
        </motion.div>
      </div>
    );
  }



  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20"
      >
        <div className="p-6 flex items-center gap-4 border-b border-slate-800">
          <div className="min-w-[44px] h-11 bg-white rounded-xl flex items-center justify-center shadow-lg p-1">
            <img
              src="/logo_kemnaker.png"
              alt="Logo Kemnaker"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          {isSidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl text-white tracking-tight"
            >
              SIAP-SPJ
            </motion.span>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-xl transition-all group",
                activeTab === item.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className={cn("w-6 h-6", activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-white")} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className={cn("flex items-center gap-4 p-3", !isSidebarOpen && "justify-center")}>
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
              <User className="w-5 h-5 text-slate-300" />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user.username}</p>
                <p className="text-xs text-slate-500 truncate uppercase tracking-tighter">{user.role.replace("_", " ")}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setUser(null)}
            className={cn(
              "w-full flex items-center gap-4 p-3 mt-2 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all group",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut className="w-6 h-6 text-slate-400 group-hover:text-red-400" />
            {isSidebarOpen && <span className="font-medium">Keluar</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="text-xs text-slate-500">SIAP-SPJ v1.0.0</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "dashboard" && <Dashboard />}
              {activeTab === "input" && <SPJForm onSuccess={() => setActiveTab("list")} />}
              {activeTab === "list" && <SPJList />}
              {activeTab === "reports" && <Reports />}
              {activeTab === "sdd" && <SDD />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
