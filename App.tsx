import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  CheckCircle2, 
  LogOut,
  Loader2,
  Smartphone,
  User,
  LogIn,
  AlertCircle,
  Home,
  Wallet,
  Bell,
  ShieldCheck,
  GraduationCap,
  Cake,
  Baby,
  ArrowRight
} from 'lucide-react';
import { Student, Transaction, ViewType, UserRole } from './types';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import IncomeForm from './components/IncomeForm';
import ExpenseForm from './components/ExpenseForm';
import Reports from './components/Reports';
import MonthlyChecklist from './components/MonthlyChecklist';
import StudentProfile from './components/StudentProfile';
import * as api from './services/api';
import { supabase } from './lib/supabaseClient';

const SESSION_KEY = 'kas_mit_user_role';
const LOGGED_STUDENT_KEY = 'kas_mit_student_id';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [isLoading, setIsLoading] = useState(true);
  
  // PWA Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Auth States
  const [userRole, setUserRole] = useState<UserRole>('PARENT');
  const [loggedInStudent, setLoggedInStudent] = useState<Student | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(true); // Default show login
  
  // Login Form Inputs
  const [loginNickname, setLoginNickname] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Initial Data Load
  const fetchData = async () => {
    try {
      const [studentsData, transactionsData] = await Promise.all([
        api.getStudents(),
        api.getTransactions()
      ]);
      setStudents(studentsData);
      setTransactions(transactionsData);
      
      // Check Persisted Session
      const savedRole = localStorage.getItem(SESSION_KEY);
      const savedStudentId = localStorage.getItem(LOGGED_STUDENT_KEY);
      
      if (savedRole === 'ADMIN') {
        setUserRole('ADMIN');
        setShowLoginModal(false);
      } else if (savedRole === 'TEACHER') {
        setUserRole('TEACHER');
        setShowLoginModal(false);
        setCurrentView('STUDENTS');
      } else if (savedRole === 'PARENT' && savedStudentId) {
        const student = studentsData.find(s => s.id === savedStudentId);
        if (student) {
          setUserRole('PARENT');
          setLoggedInStudent(student);
          setShowLoginModal(false);
        }
      }
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const channel = supabase
      .channel('public:transactions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, (payload) => {
        const newTrans = payload.new as any;
        
        const formattedTrans: Transaction = {
          id: newTrans.id,
          type: newTrans.type,
          amount: newTrans.amount,
          date: newTrans.date,
          description: newTrans.description,
          studentId: newTrans.student_id,
          month: newTrans.month,
          year: newTrans.year,
          attachment: newTrans.attachment
        };
        setTransactions(prev => [formattedTrans, ...prev]);

        if (Notification.permission === 'granted') {
           const title = newTrans.type === 'INCOME' ? '💰 Uang Kas Masuk' : '💸 Pengeluaran Baru';
           const body = newTrans.type === 'INCOME' 
             ? `Ada pembayaran masuk sebesar Rp ${newTrans.amount.toLocaleString('id-ID')}`
             : `Pengeluaran: ${newTrans.description} (Rp ${newTrans.amount.toLocaleString('id-ID')})`;
           
           new Notification(title, {
             body: body,
             icon: 'https://api.dicebear.com/9.x/micah/png?seed=FinanceKid&backgroundColor=064e3b',
             tag: 'kas-mit-notif'
           });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    }
  };

  const handleTransactionAdded = (newTransactions: Transaction | Transaction[]) => {
    const items = Array.isArray(newTransactions) ? newTransactions : [newTransactions];
    setTransactions(prev => {
        const ids = new Set(prev.map(t => t.id));
        const uniqueNew = items.filter(t => !ids.has(t.id));
        return [...uniqueNew, ...prev];
    });
    setCurrentView('DASHBOARD');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const lowerNick = loginNickname.toLowerCase().trim();

    if (lowerNick === 'admin' && loginPassword === 'admin@123') {
      setUserRole('ADMIN');
      setLoggedInStudent(null);
      localStorage.setItem(SESSION_KEY, 'ADMIN');
      localStorage.removeItem(LOGGED_STUDENT_KEY);
      setShowLoginModal(false);
      setCurrentView('DASHBOARD');
      return;
    }

    if (lowerNick === 'walikelas' && loginPassword === 'guru123') {
      setUserRole('TEACHER');
      setLoggedInStudent(null);
      localStorage.setItem(SESSION_KEY, 'TEACHER');
      localStorage.removeItem(LOGGED_STUDENT_KEY);
      setShowLoginModal(false);
      setCurrentView('STUDENTS'); 
      return;
    }

    const student = students.find(s => 
      s.nickname?.toLowerCase() === lowerNick
    );

    if (student) {
      if (loginPassword === (student.password || '123456')) {
        setUserRole('PARENT');
        setLoggedInStudent(student);
        localStorage.setItem(SESSION_KEY, 'PARENT');
        localStorage.setItem(LOGGED_STUDENT_KEY, student.id);
        setShowLoginModal(false);
        setCurrentView('DASHBOARD');
      } else {
        setLoginError('Password salah. Default: 123456');
      }
    } else {
      setLoginError('Nama Panggilan tidak ditemukan.');
    }
  };

  const handleLogout = () => {
    if (confirm("Yakin ingin keluar aplikasi?")) {
      setUserRole('PARENT');
      setLoggedInStudent(null);
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(LOGGED_STUDENT_KEY);
      setLoginNickname('');
      setLoginPassword('');
      setShowLoginModal(true);
      setCurrentView('DASHBOARD');
    }
  };

  const renderContent = () => {
    const isAdmin = userRole === 'ADMIN';
    const isTeacher = userRole === 'TEACHER';

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-screen gap-4 text-emerald-100 bg-[#064e3b]">
          <Loader2 size={48} className="animate-spin text-lime-400" />
          <p className="font-bold">Menyiapkan Dompet...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'DASHBOARD': 
        if (isTeacher) return <StudentList students={students} onRefresh={fetchData} isAdmin={isAdmin} userRole={userRole} />;
        return <Dashboard transactions={transactions} students={students} userRole={userRole} loggedInStudent={loggedInStudent} onChangeView={setCurrentView} />;
      case 'STUDENTS': return <StudentList students={students} onRefresh={fetchData} isAdmin={isAdmin} userRole={userRole} />;
      case 'INCOME': return isAdmin ? <IncomeForm students={students} onSuccess={handleTransactionAdded} /> : <Dashboard transactions={transactions} students={students} userRole={userRole} loggedInStudent={loggedInStudent} onChangeView={setCurrentView} />;
      case 'EXPENSE': return isAdmin ? <ExpenseForm onSuccess={handleTransactionAdded} /> : <Dashboard transactions={transactions} students={students} userRole={userRole} loggedInStudent={loggedInStudent} onChangeView={setCurrentView} />;
      case 'REPORTS': 
         if (isTeacher) return <StudentList students={students} onRefresh={fetchData} isAdmin={isAdmin} userRole={userRole} />;
         return <Reports transactions={transactions} students={students} onRefresh={fetchData} userRole={userRole} />;
      case 'CHECKLIST': 
         if (isTeacher) return <StudentList students={students} onRefresh={fetchData} isAdmin={isAdmin} userRole={userRole} />;
         return <MonthlyChecklist transactions={transactions} students={students} />;
      case 'PROFILE': 
        if (isAdmin || isTeacher) {
            // DATA STATISTIK UNTUK PROFIL KELAS
            const boyCount = students.filter(s => s.gender === 'L').length;
            const girlCount = students.filter(s => s.gender === 'P').length;
            
            // Cek Ulang Tahun Bulan Ini
            const currentMonth = new Date().getMonth(); // 0-11
            const birthdayStudents = students.filter(s => {
                if (!s.birthDate) return false;
                const bd = new Date(s.birthDate);
                return bd.getMonth() === currentMonth;
            });

            return (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-40">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm text-center mt-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-[#064e3b] z-0"></div>
                        <div className="relative z-10 -mt-4">
                            <div className="w-24 h-24 rounded-full bg-lime-400 border-4 border-white shadow-xl mx-auto flex items-center justify-center mb-4 text-[#064e3b]">
                                {isAdmin ? <ShieldCheck size={40} /> : <GraduationCap size={40} />}
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">{isAdmin ? 'Administrator' : 'Wali Kelas'}</h2>
                            <p className="text-slate-500 text-sm font-medium">Profil & Statistik Kelas</p>
                        </div>
                    </div>
                    
                    {/* STATISTIK RINGKAS */}
                    <div className="grid grid-cols-3 gap-3">
                         <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2">
                                <Users size={16} />
                            </div>
                            <span className="text-2xl font-bold text-slate-800">{students.length}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Total Siswa</span>
                         </div>
                         <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center mb-2">
                                <Baby size={16} />
                            </div>
                            <span className="text-2xl font-bold text-slate-800">{boyCount}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Laki-Laki</span>
                         </div>
                         <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mb-2">
                                <Baby size={16} />
                            </div>
                            <span className="text-2xl font-bold text-slate-800">{girlCount}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Perempuan</span>
                         </div>
                    </div>

                    {/* BIRTHDAY SECTION */}
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                         <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <Cake className="text-rose-400" size={20} />
                            Ulang Tahun Bulan Ini
                         </h3>
                         
                         {birthdayStudents.length > 0 ? (
                            <div className="space-y-3">
                                {birthdayStudents.map(s => {
                                    const bd = new Date(s.birthDate!);
                                    return (
                                        <div key={s.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="w-10 h-10 rounded-full bg-white border border-slate-100 overflow-hidden">
                                                <img src={s.photoUrl || `https://api.dicebear.com/7.x/micah/svg?seed=${s.name}`} alt={s.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">{s.name}</p>
                                                <p className="text-xs text-rose-500 font-bold flex items-center gap-1">
                                                    <Cake size={10} /> {bd.getDate()} {new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(bd)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                         ) : (
                             <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                 Tidak ada siswa yang berulang tahun bulan ini.
                             </div>
                         )}
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => setCurrentView('STUDENTS')}>
                        <div className="flex items-center gap-3">
                             <div className="p-2 bg-white rounded-xl text-blue-500">
                                <Users size={20} />
                             </div>
                             <div>
                                <p className="font-bold text-blue-800 text-sm">Kelola Data Siswa</p>
                                <p className="text-xs text-blue-600">Lihat daftar lengkap & edit</p>
                             </div>
                        </div>
                        <ArrowRight size={18} className="text-blue-400" />
                    </div>

                    <button 
                        onClick={handleLogout}
                        className="w-full bg-rose-50 text-rose-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border border-rose-100 hover:bg-rose-100 active:scale-95 transition-transform"
                    >
                        <LogOut size={20} />
                        Keluar Akun
                    </button>
                </div>
            );
        }
        if (loggedInStudent) {
            return <StudentProfile student={loggedInStudent} onUpdate={fetchData} onLogout={handleLogout} />;
        }
        return <Dashboard transactions={transactions} students={students} userRole={userRole} loggedInStudent={loggedInStudent} onChangeView={setCurrentView} />;
      default: return <Dashboard transactions={transactions} students={students} userRole={userRole} loggedInStudent={loggedInStudent} onChangeView={setCurrentView} />;
    }
  };

  // Header Component
  const Header = () => {
    let roleLabel = 'Tamu';
    if (userRole === 'ADMIN') roleLabel = 'Bendahara';
    if (userRole === 'TEACHER') roleLabel = 'Wali Kelas';
    if (userRole === 'PARENT') roleLabel = 'Wali Murid';

    let nameLabel = 'Tamu';
    if (userRole === 'ADMIN') nameLabel = 'Admin Kelas';
    if (userRole === 'TEACHER') nameLabel = 'Ibu/Bapak Guru';
    if (loggedInStudent) nameLabel = loggedInStudent.name;

    return (
    <div className="bg-[#064e3b] px-6 pt-8 pb-32 rounded-b-[2.5rem] shadow-2xl relative z-0">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-lime-400 border-2 border-white flex items-center justify-center overflow-hidden">
             {loggedInStudent ? (
                 loggedInStudent.photoUrl ? (
                    <img src={loggedInStudent.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                    <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${loggedInStudent.name}`} alt="Avatar" />
                 )
             ) : (
                 userRole === 'TEACHER' ? <GraduationCap className="text-[#064e3b]" /> : <User className="text-[#064e3b]" />
             )}
          </div>
          <div>
             <p className="text-emerald-100 text-xs font-medium">Halo, {roleLabel}</p>
             <h2 className="text-white text-lg font-bold">
               {nameLabel}
             </h2>
          </div>
        </div>
        <div className="flex gap-2">
            {deferredPrompt && (
                <button onClick={handleInstallClick} className="p-2 bg-emerald-800/50 text-emerald-100 rounded-full hover:bg-emerald-700 backdrop-blur-sm">
                    <Smartphone size={20} />
                </button>
            )}
            <button 
                onClick={() => Notification.requestPermission()}
                className="p-2 bg-emerald-800/50 text-emerald-100 rounded-full hover:bg-emerald-700 backdrop-blur-sm relative"
            >
                <Bell size={20} />
            </button>
        </div>
      </div>
    </div>
  )};

  const BottomNav = () => {
    if (userRole === 'TEACHER') {
      return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#022c22] text-gray-400 p-2 rounded-full shadow-2xl flex justify-around items-center px-6 z-50 backdrop-blur-md bg-opacity-95 border border-emerald-800/50">
           <button 
            onClick={() => setCurrentView('STUDENTS')}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${currentView === 'STUDENTS' ? 'text-lime-400 -translate-y-1' : 'hover:text-white'}`}
          >
            <Users size={24} />
            <span className="text-[10px] font-bold">Data Siswa</span>
          </button>

          <button 
            onClick={() => setCurrentView('PROFILE')}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${currentView === 'PROFILE' ? 'text-lime-400 -translate-y-1' : 'hover:text-white'}`}
          >
            <User size={24} fill={currentView === 'PROFILE' ? "currentColor" : "none"} />
            <span className="text-[10px] font-bold">Profil Kelas</span>
          </button>
        </div>
      );
    }

    return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#022c22] text-gray-400 p-2 rounded-full shadow-2xl flex justify-between items-center px-6 z-50 backdrop-blur-md bg-opacity-95 border border-emerald-800/50">
      <button 
        onClick={() => setCurrentView('DASHBOARD')}
        className={`flex flex-col items-center gap-1 p-2 transition-all ${currentView === 'DASHBOARD' ? 'text-lime-400 -translate-y-1' : 'hover:text-white'}`}
      >
        <Home size={24} fill={currentView === 'DASHBOARD' ? "currentColor" : "none"} />
        <span className="text-[10px] font-bold">Beranda</span>
      </button>

      <button 
        onClick={() => setCurrentView('CHECKLIST')}
        className={`flex flex-col items-center gap-1 p-2 transition-all ${currentView === 'CHECKLIST' ? 'text-lime-400 -translate-y-1' : 'hover:text-white'}`}
      >
        <CheckCircle2 size={24} />
        <span className="text-[10px] font-bold">Ceklis</span>
      </button>

      <div className="relative -top-6">
        <button 
            onClick={() => setCurrentView('REPORTS')}
            className="w-14 h-14 bg-lime-400 rounded-full flex items-center justify-center text-[#064e3b] shadow-lg shadow-lime-400/30 border-4 border-[#022c22] transform transition-transform active:scale-95"
        >
            <BarChart3 size={24} strokeWidth={2.5} />
        </button>
      </div>

      <button 
        onClick={() => setCurrentView('STUDENTS')}
        className={`flex flex-col items-center gap-1 p-2 transition-all ${currentView === 'STUDENTS' ? 'text-lime-400 -translate-y-1' : 'hover:text-white'}`}
      >
        <Users size={24} />
        <span className="text-[10px] font-bold">Siswa</span>
      </button>

      <button 
        onClick={() => setCurrentView('PROFILE')}
        className={`flex flex-col items-center gap-1 p-2 transition-all ${currentView === 'PROFILE' ? 'text-lime-400 -translate-y-1' : 'hover:text-white'}`}
      >
        <User size={24} fill={currentView === 'PROFILE' ? "currentColor" : "none"} />
        <span className="text-[10px] font-bold">Profil</span>
      </button>
    </div>
  )};

  if (showLoginModal) {
    return (
      <div className="min-h-screen bg-[#064e3b] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
             <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-lime-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-lime-400 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-lg shadow-lime-400/20">
                    <Wallet size={40} className="text-[#064e3b]" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">KAS MIT</h1>
                <p className="text-emerald-200 text-sm">Masuk untuk melihat data anak</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-emerald-200 uppercase mb-2 ml-2">Username / Nama Panggilan</label>
                    <input 
                        type="text" 
                        value={loginNickname}
                        onChange={(e) => setLoginNickname(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-[#022c22]/50 border border-emerald-700/50 text-white placeholder-emerald-600 focus:outline-none focus:border-lime-400 transition-all font-bold text-lg"
                        placeholder="Contoh: Budi / walikelas"
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-emerald-200 uppercase mb-2 ml-2">Password / PIN</label>
                    <input 
                        type="password" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-[#022c22]/50 border border-emerald-700/50 text-white placeholder-emerald-600 focus:outline-none focus:border-lime-400 transition-all font-bold text-lg"
                        placeholder="******"
                    />
                    <p className="text-[10px] text-emerald-400 mt-2 ml-2 italic">*Siswa Default: 123456</p>
                </div>

                {loginError && (
                    <div className="flex items-center gap-2 text-rose-300 bg-rose-900/50 p-3 rounded-xl text-sm font-bold border border-rose-500/30">
                        <AlertCircle size={16} />
                        {loginError}
                    </div>
                )}

                <button 
                    type="submit"
                    className="w-full bg-lime-400 hover:bg-lime-300 text-[#064e3b] py-4 rounded-2xl font-bold text-lg shadow-lg shadow-lime-400/20 transition-transform active:scale-95 flex items-center justify-center gap-2 mt-4"
                >
                    <LogIn size={20} />
                    Masuk Sekarang
                </button>
            </form>
        </div>
        
        <p className="text-emerald-800/60 mt-8 font-bold text-xs uppercase tracking-widest">Aplikasi Keuangan Sekolah</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative pb-24">
       <div className="absolute top-0 inset-x-0 h-64 bg-[#064e3b] z-0 rounded-b-[40px]"></div>
       
       <div className="relative z-10 max-w-md mx-auto min-h-screen bg-slate-50 shadow-2xl overflow-hidden md:rounded-[40px] md:my-4 md:h-[calc(100vh-2rem)] md:overflow-y-auto no-scrollbar">
          <Header />
          
          <main className="px-4 -mt-24 relative z-20 pb-24">
            {renderContent()}
          </main>

          <BottomNav />
       </div>
    </div>
  );
};

export default App;