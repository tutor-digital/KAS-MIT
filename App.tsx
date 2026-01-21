import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  MinusCircle, 
  BarChart3, 
  CheckCircle2, 
  BookOpen,
  Menu,
  X,
  ShieldCheck,
  User,
  Heart,
  Sparkles,
  Lock,
  KeyRound,
  LogIn,
  AlertCircle,
  LogOut,
  Loader2,
  Smartphone,
  Share,
  PlusSquare,
  HelpCircle
} from 'lucide-react';
import { Student, Transaction, ViewType, UserRole } from './types';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import IncomeForm from './components/IncomeForm';
import ExpenseForm from './components/ExpenseForm';
import Reports from './components/Reports';
import MonthlyChecklist from './components/MonthlyChecklist';
import * as api from './services/api';

const SESSION_KEY = 'kas_mit_user_role';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  
  // Auth States with Persistence
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem(SESSION_KEY);
    return (savedRole as UserRole) || 'PARENT';
  });
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Save Role Changes
  useEffect(() => {
    localStorage.setItem(SESSION_KEY, userRole);
  }, [userRole]);

  // Handle PWA Install Prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Kita tidak menggunakan showInstallBtn boolean lagi, 
      // karena kita ingin tombol selalu ada (sebagai trigger install atau trigger bantuan)
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Jika browser mendukung install otomatis (Android/Chrome Desktop)
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Jika browser tidak mendukung install otomatis (iOS / Safari / Sudah Terinstall)
      // Tampilkan Modal Bantuan
      setShowInstallHelp(true);
    }
  };

  // Load Data from Supabase
  const fetchData = async () => {
    try {
      const [studentsData, transactionsData] = await Promise.all([
        api.getStudents(),
        api.getTransactions()
      ]);
      setStudents(studentsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Failed to load data from Supabase", error);
      alert("Gagal memuat data dari server. Cek koneksi internet anda.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers to update local state after successful API calls (Optimistic update or Refetch)
  const refreshData = () => fetchData();

  const handleTransactionAdded = (newTransactions: Transaction | Transaction[]) => {
    const items = Array.isArray(newTransactions) ? newTransactions : [newTransactions];
    setTransactions(prev => [...items, ...prev]);
    setCurrentView('DASHBOARD');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin@123') {
      setUserRole('ADMIN');
      setCurrentView('DASHBOARD');
      setShowLoginModal(false);
      setLoginError('');
      setUsername('');
      setPassword('');
    } else {
      setLoginError('Ups! Username atau Password salah ya.');
    }
  };

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari akun Bendahara?")) {
      setUserRole('PARENT');
      setCurrentView('DASHBOARD');
    }
  };

  const openLoginModal = () => {
    if (userRole === 'ADMIN') return; // Sudah admin
    setLoginError('');
    setUsername('');
    setPassword('');
    setShowLoginModal(true);
  };

  const navItems = [
    { id: 'DASHBOARD', label: 'Halaman Utama', icon: LayoutDashboard, roles: ['ADMIN', 'PARENT'] },
    { id: 'STUDENTS', label: 'Daftar Murid', icon: Users, roles: ['ADMIN', 'PARENT'] },
    { id: 'INCOME', label: 'Bayar Iuran', icon: PlusCircle, roles: ['ADMIN'] },
    { id: 'EXPENSE', label: 'Catat Jajan/Alat', icon: MinusCircle, roles: ['ADMIN'] },
    { id: 'REPORTS', label: 'Tabungan Kelas', icon: BarChart3, roles: ['ADMIN', 'PARENT'] },
    { id: 'CHECKLIST', label: 'Siapa Sudah Bayar?', icon: CheckCircle2, roles: ['ADMIN', 'PARENT'] },
  ];

  const renderContent = () => {
    const isAdmin = userRole === 'ADMIN';

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-96 gap-4 text-slate-400 animate-pulse">
          <Loader2 size={48} className="animate-spin text-blue-500" />
          <p className="font-bold">Sedang mengambil data terbaru...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'DASHBOARD': return <Dashboard transactions={transactions} students={students} />;
      case 'STUDENTS': return <StudentList students={students} onRefresh={refreshData} isAdmin={isAdmin} />;
      case 'INCOME': return isAdmin ? <IncomeForm students={students} onSuccess={handleTransactionAdded} /> : <Dashboard transactions={transactions} students={students} />;
      case 'EXPENSE': return isAdmin ? <ExpenseForm onSuccess={handleTransactionAdded} /> : <Dashboard transactions={transactions} students={students} />;
      case 'REPORTS': return <Reports transactions={transactions} students={students} onRefresh={refreshData} userRole={userRole} />;
      case 'CHECKLIST': return <MonthlyChecklist transactions={transactions} students={students} />;
      default: return <Dashboard transactions={transactions} students={students} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-kids bg-transparent">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b-4 border-yellow-400 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-2 rounded-xl text-white shadow-sm">
            <BookOpen size={20} />
          </div>
          <span className="font-bold text-slate-800 text-lg uppercase tracking-tight">KAS MIT</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600 bg-slate-50 rounded-lg">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-0 z-40 md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        w-72 bg-white border-r-4 border-yellow-200 flex flex-col h-screen shadow-xl md:shadow-none
      `}>
        <div className="p-8 hidden md:flex items-center gap-3">
          <div className="bg-blue-500 p-3 rounded-2xl text-white shadow-lg -rotate-6 transform hover:rotate-0 transition-transform">
            <BookOpen size={32} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-2xl leading-none tracking-tighter">KAS MIT</span>
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1 bg-blue-50 px-2 py-0.5 rounded-full inline-block">MIT MA</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
          {navItems.filter(item => item.roles.includes(userRole)).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id as ViewType);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all duration-200 border-2
                ${currentView === item.id 
                  ? 'bg-blue-500 text-white border-blue-600 shadow-lg shadow-blue-200 transform -translate-y-1' 
                  : 'text-slate-500 border-transparent hover:bg-yellow-50 hover:text-orange-600 hover:border-yellow-200'}
              `}
            >
              <item.icon size={22} strokeWidth={2.5} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Install App Button & Role Switcher */}
        <div className="px-4 pb-4 space-y-3">
          {/* Tombol Install selalu muncul */}
          <button 
            onClick={handleInstallClick}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
          >
            <Smartphone size={18} />
            Install Aplikasi
          </button>

          <div className="p-6 bg-slate-50/80 rounded-[2rem] border-2 border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-colors ${userRole === 'ADMIN' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                {userRole === 'ADMIN' ? <ShieldCheck size={28} /> : <User size={28} />}
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm">
                  {userRole === 'ADMIN' ? 'Bendahara Kelas' : 'Wali Murid'}
                </p>
                <p className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                  <Sparkles size={10} className="text-yellow-500" /> Mode Akses
                </p>
              </div>
            </div>
            
            {userRole === 'ADMIN' ? (
              <button 
                onClick={handleLogout}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-bold border border-rose-600 shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 text-xs"
              >
                <LogOut size={16} />
                LOGOUT BENDAHARA
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={openLoginModal}
                  className="text-[11px] py-2.5 rounded-xl font-bold border-2 bg-white text-slate-400 border-slate-200 transition-all active:scale-95 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200"
                >
                  BENDAHARA
                </button>
                <button 
                  className="text-[11px] py-2.5 rounded-xl font-bold border-2 bg-orange-500 text-white border-orange-600 shadow-md transition-all cursor-default"
                >
                  WALI MURID
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pb-6 flex items-center justify-center gap-1 text-rose-400">
          <Heart size={14} fill="currentColor" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Kas MIT {new Date().getFullYear()}</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-300 relative">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-blue-50">
                <Lock size={36} />
              </div>
              <h2 className="text-2xl font-kids font-bold text-slate-800">Login Bendahara</h2>
              <p className="text-slate-500 text-sm">Masukkan username & password rahasia ya!</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2 pl-2">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-medium"
                    placeholder="Contoh: admin"
                    autoFocus
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2 pl-2">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-medium"
                    placeholder="********"
                  />
                </div>
              </div>

              {loginError && (
                <div className="flex items-center gap-2 text-rose-500 bg-rose-50 p-3 rounded-xl text-sm font-bold animate-in slide-in-from-top-2">
                  <AlertCircle size={16} />
                  {loginError}
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 mt-4 active:scale-95"
              >
                <LogIn size={20} />
                Masuk Sekarang
              </button>
            </form>
          </div>
        </div>
      )}

      {/* INSTALL HELP MODAL (PANDUAN INSTALL MANUAL) */}
      {showInstallHelp && (
        <div 
          className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setShowInstallHelp(false)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-300 relative"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowInstallHelp(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
               <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone size={32} />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">Cara Install Aplikasi</h3>
               <p className="text-slate-500 text-sm">Aplikasi ini bisa dipasang di HP tanpa download dari PlayStore loh!</p>
            </div>

            <div className="space-y-4">
               {/* iOS Instruction */}
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex gap-4 items-start">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 shrink-0">
                    <Share size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Pengguna iPhone (iOS)</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      1. Tekan tombol <strong>Share</strong> di Safari (bawah tengah).<br/>
                      2. Geser ke bawah, pilih <strong>"Add to Home Screen"</strong>.<br/>
                      3. Tekan <strong>Add</strong> di pojok kanan atas.
                    </p>
                  </div>
               </div>

               {/* Android Instruction */}
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex gap-4 items-start">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 shrink-0">
                    <Menu size={20} className="text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Pengguna Android (Chrome)</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      1. Tekan tombol <strong>Menu (titik tiga)</strong> di pojok kanan atas.<br/>
                      2. Pilih <strong>"Install App"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
                    </p>
                  </div>
               </div>
            </div>

            <button 
              onClick={() => setShowInstallHelp(false)}
              className="w-full mt-6 bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;