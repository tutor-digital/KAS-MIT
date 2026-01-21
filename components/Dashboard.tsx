import React, { useMemo } from 'react';
import { Transaction, Student, MONTHS } from '../types';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Clock, PlusCircle, MinusCircle, BookOpen, Sparkles, Quote, Pin, Users, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  transactions: Transaction[];
  students: Student[];
}

const Dashboard: React.FC<Props> = ({ transactions, students }) => {
  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      balance: income - expense
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    const last6Months = MONTHS.slice(-6);
    return last6Months.map(m => {
      const amount = transactions
        .filter(t => t.type === 'INCOME' && t.month === m)
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: m.substring(0, 3), amount };
    });
  }, [transactions]);

  // Hitung status pembayaran bulan ini
  const paymentStatus = useMemo(() => {
    const currentMonth = MONTHS[new Date().getMonth()];
    const currentYear = new Date().getFullYear();
    const paidCount = transactions.filter(t => 
      t.type === 'INCOME' && t.month === currentMonth && t.year === currentYear
    ).length; // Asumsi 1 transaksi income per siswa per bulan
    const totalStudents = students.length;
    const percentage = totalStudents > 0 ? Math.round((paidCount / totalStudents) * 100) : 0;
    
    return { currentMonth, paidCount, totalStudents, percentage };
  }, [transactions, students]);

  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const QUOTES = [
    "Pendidikan adalah senjata paling mematikan di dunia, karena dengan pendidikan Anda dapat mengubah dunia. - Nelson Mandela",
    "Makin banyak yang kamu baca, makin banyak hal yang kamu ketahui. - Dr. Seuss",
    "Gantungkan cita-citamu setinggi langit! Bermimpilah setinggi langit. - Ir. Soekarno",
    "Kegagalan hanya terjadi bila kita menyerah. - B.J. Habibie",
    "Ilmu itu ada dua: ilmu yang memberi manfaat dan ilmu yang sekedar dihafal."
  ];

  const randomQuote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-kids font-bold text-slate-800">Selamat Datang di KAS MIT! 👋</h1>
          <p className="text-slate-500">Sistem Informasi Keuangan Kelas yang Transparan dan Terpercaya.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border shadow-sm">
          <Clock size={16} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-600">{new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Papan Motivasi */}
          <div className="lg:col-span-2 relative group">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
                <Pin className="text-red-500 fill-red-500 drop-shadow-md" size={32} />
            </div>
            <div className="h-full bg-[#fff7d1] rounded-bl-3xl rounded-br-3xl rounded-tl-lg rounded-tr-lg p-6 shadow-xl shadow-yellow-200/50 relative overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-300 border-t-8 border-yellow-200/50 flex flex-col justify-center">
              <Quote className="absolute top-4 left-4 text-yellow-500/20 w-24 h-24" />
              <div className="relative z-10 text-center">
                  <h3 className="text-xl font-kids font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
                    <Sparkles className="text-yellow-500" />
                    Kata Mutiara Hari Ini
                  </h3>
                  <p className="text-slate-600 font-medium italic text-lg leading-relaxed">
                    "{randomQuote}"
                  </p>
              </div>
            </div>
          </div>

          {/* Status Pembayaran Widget (Baru) */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                   <PieChart className="text-indigo-200" size={24} />
                   <h3 className="font-bold font-kids text-lg">Iuran Bulan {paymentStatus.currentMonth}</h3>
                </div>
                
                <div className="flex items-end gap-2 mb-2">
                   <span className="text-4xl font-bold font-kids">{paymentStatus.paidCount}</span>
                   <span className="text-indigo-200 mb-1">/ {paymentStatus.totalStudents} Siswa</span>
                </div>
                
                <div className="w-full bg-black/20 rounded-full h-3 mb-2">
                   <div 
                     className="bg-yellow-400 h-3 rounded-full transition-all duration-1000" 
                     style={{ width: `${paymentStatus.percentage}%` }}
                   ></div>
                </div>
                <p className="text-xs text-indigo-100 font-medium">
                  {paymentStatus.percentage}% siswa sudah lunas bulan ini.
                  {paymentStatus.percentage === 100 ? ' Luar biasa!' : ' Semangat!'}
                </p>
             </div>
             <Users className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32 rotate-12" />
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
            <Wallet size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Saldo Saat Ini</p>
            <h3 className="text-xl font-bold text-slate-800 font-kids">{formatCurrency(stats.balance)}</h3>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
            <ArrowUpCircle size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Masuk</p>
            <h3 className="text-xl font-bold text-slate-800 font-kids">{formatCurrency(stats.income)}</h3>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 border-l-4 border-l-rose-500">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
            <ArrowDownCircle size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Keluar</p>
            <h3 className="text-xl font-bold text-slate-800 font-kids">{formatCurrency(stats.expense)}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><PlusCircle size={18}/></span>
            Statistik Iuran (6 Bln Terakhir)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#2563eb' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><Clock size={18}/></span>
              Aktivitas Terbaru
            </h3>
          </div>
          <div className="flex-1 space-y-4">
            {recentTransactions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                <p className="text-sm">Belum ada aktivitas tercatat.</p>
              </div>
            ) : (
              recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {t.type === 'INCOME' ? <PlusCircle size={18} /> : <MinusCircle size={18} />}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-slate-700 leading-tight truncate">
                        {t.type === 'INCOME' ? `Iuran: ${students.find(s => s.id === t.studentId)?.name || 'Siswa'}` : t.description}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold tracking-wider">{new Date(t.date).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold whitespace-nowrap ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-900 rounded-3xl p-8 relative overflow-hidden flex items-center justify-between shadow-xl shadow-blue-200">
        <div className="relative z-10 max-w-md">
          <h2 className="text-2xl font-kids font-bold text-white mb-2">Transparansi KAS MIT</h2>
          <p className="text-blue-200 text-sm mb-6 leading-relaxed">Dana kas dikelola sepenuhnya untuk keperluan operasional kelas dan kesejahteraan siswa MIT.</p>
          <div className="flex gap-4">
            <div className="flex -space-x-2 overflow-hidden">
               {/* Menggunakan style Notionists yang lebih bersih dan ramah */}
               {[1,2,3,4,5].map(i => (
                 <img key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-blue-900 bg-white" src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i+100}`} alt="avatar" />
               ))}
            </div>
            <div className="text-white text-[10px] font-medium flex flex-col justify-center">
              <span className="block font-bold">Didukung oleh</span>
              <span className="text-blue-400 font-bold uppercase tracking-widest">Wali Murid MIT</span>
            </div>
          </div>
        </div>
        {/* Gambar alat tulis sekolah yang colorful */}
        <img src="https://images.unsplash.com/photo-1459356979461-da51bde24549?q=80&w=400&auto=format&fit=crop" className="hidden lg:block absolute right-0 top-0 bottom-0 opacity-20 w-1/2 object-cover" alt="School Supplies" />
        <div className="bg-white/5 p-4 rounded-full backdrop-blur-sm hidden md:block border border-white/10">
           <BookOpen className="text-white w-12 h-12" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;