import React, { useMemo } from 'react';
import { Transaction, Student, UserRole, ViewType } from '../types';
import { ArrowUpRight, ArrowDownLeft, Wallet, Send, Plus, Receipt, User } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  students: Student[];
  userRole: UserRole;
  loggedInStudent: Student | null;
  onChangeView: (view: ViewType) => void;
}

const Dashboard: React.FC<Props> = ({ transactions, students, userRole, loggedInStudent, onChangeView }) => {
  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      balance: income - expense
    };
  }, [transactions]);

  // Personal Stats for Logged In Student
  const personalStats = useMemo(() => {
    if (!loggedInStudent) return null;
    const myTransactions = transactions.filter(t => t.type === 'INCOME' && t.studentId === loggedInStudent.id);
    const totalPaid = myTransactions.reduce((sum, t) => sum + t.amount, 0);
    const lastPayment = myTransactions[0];
    return { totalPaid, lastPayment };
  }, [loggedInStudent, transactions]);

  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* WALLET CARD */}
      <div className="bg-[#05402a] rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl -ml-5 -mb-5"></div>

        <div className="relative z-10 text-center">
            <p className="text-emerald-200/80 text-sm font-medium mb-2">Total Saldo Kas</p>
            <h2 className="text-4xl font-bold font-kids tracking-tight mb-8 text-white">
                {formatCurrency(stats.balance)}
            </h2>

            <div className="flex gap-3 justify-center">
                {userRole === 'ADMIN' && (
                    <>
                        <button onClick={() => onChangeView('INCOME')} className="bg-lime-400 text-[#05402a] px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-lime-400/20 active:scale-95 transition-transform flex-1 justify-center">
                            <Plus size={18} strokeWidth={3} />
                            Terima
                        </button>
                        <button onClick={() => onChangeView('EXPENSE')} className="bg-[#0f553a] text-lime-200 border border-lime-400/30 px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 active:scale-95 transition-transform flex-1 justify-center">
                            <ArrowUpRight size={18} strokeWidth={3} />
                            Kirim
                        </button>
                    </>
                )}
                
                {userRole === 'PARENT' && (
                    <div className="bg-[#0f553a] border border-emerald-700/50 rounded-2xl p-3 w-full flex items-center justify-between px-6">
                        <div className="text-left">
                            <p className="text-[10px] text-emerald-300 uppercase font-bold">Iuran {loggedInStudent?.nickname}</p>
                            <p className="font-bold text-lg text-lime-400">{formatCurrency(personalStats?.totalPaid || 0)}</p>
                        </div>
                        <Wallet className="text-emerald-500/50" />
                    </div>
                )}
                
                {userRole === 'TEACHER' && (
                    <div className="bg-[#0f553a] border border-emerald-700/50 rounded-2xl p-3 w-full flex items-center justify-between px-6">
                        <div className="text-left">
                            <p className="text-[10px] text-emerald-300 uppercase font-bold">Total Pemasukan</p>
                            <p className="font-bold text-lg text-lime-400">{formatCurrency(stats.income)}</p>
                        </div>
                        <Wallet className="text-emerald-500/50" />
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* QUICK MENU */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-4 px-2">Menu Cepat</h3>
        <div className="flex justify-between gap-2">
            {[
                { label: 'Siswa', icon: <User size={20} />, action: 'STUDENTS', color: 'bg-blue-50 text-blue-600' },
                { label: 'Ceklis', icon: <Receipt size={20} />, action: 'CHECKLIST', color: 'bg-purple-50 text-purple-600' },
                { label: 'Laporan', icon: <ArrowDownLeft size={20} />, action: 'REPORTS', color: 'bg-orange-50 text-orange-600' },
                { label: 'Profil', icon: <Send size={20} />, action: 'PROFILE', color: 'bg-emerald-50 text-emerald-600' },
            ].map((item, idx) => (
                <button 
                    key={idx} 
                    onClick={() => onChangeView(item.action as ViewType)}
                    className="flex flex-col items-center gap-2 flex-1"
                >
                    <div className={`w-14 h-14 ${item.color} rounded-[1.2rem] flex items-center justify-center shadow-sm`}>
                        {item.icon}
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">{item.label}</span>
                </button>
            ))}
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div>
        <div className="flex justify-between items-center px-4 mb-3">
            <h3 className="text-lg font-bold text-slate-800">Transaksi Terbaru</h3>
            <button onClick={() => onChangeView('REPORTS')} className="text-xs font-bold text-lime-600 hover:underline">Lihat Semua</button>
        </div>

        <div className="space-y-3">
            {recentTransactions.map((t) => (
                <div key={t.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'INCOME' ? 'bg-lime-100 text-lime-700' : 'bg-rose-100 text-rose-600'}`}>
                            {t.type === 'INCOME' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-sm">{t.type === 'INCOME' ? 'Uang Masuk' : t.description}</p>
                            <p className="text-[10px] text-slate-400 font-medium">
                                {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • 
                                {t.type === 'INCOME' ? (students.find(s=>s.id===t.studentId)?.name || 'Siswa') : 'Belanja'}
                            </p>
                        </div>
                    </div>
                    <span className={`font-bold text-sm ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;