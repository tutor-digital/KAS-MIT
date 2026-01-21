import React, { useState, useMemo } from 'react';
import { Transaction, Student, UserRole } from '../types';
import * as api from '../services/api';
import { FileText, TrendingUp, TrendingDown, Filter, User, Eye, X, PieChart, Receipt, Calendar, ArrowUpRight, Pencil, Trash2, Save, Loader2, AlertTriangle } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  students: Student[];
  onRefresh: () => void;
  userRole: UserRole;
}

const Reports: React.FC<Props> = ({ transactions, students, onRefresh, userRole }) => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'EXPENSE'>('GENERAL');
  const [filterStudent, setFilterStudent] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [showImage, setShowImage] = useState<string | null>(null);
  
  // Edit & Delete State
  const [isLoading, setIsLoading] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  
  // Edit Form State
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');

  const isAdmin = userRole === 'ADMIN';

  // --- GENERAL DATA CALCULATION ---
  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const matchStudent = filterStudent === 'ALL' || t.studentId === filterStudent;
      const matchType = filterType === 'ALL' || t.type === filterType;
      return matchStudent && matchType;
    });
  }, [transactions, filterStudent, filterType]);

  const summary = useMemo(() => {
    const inc = filteredData.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const exp = filteredData.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    return { income: inc, expense: exp, balance: inc - exp };
  }, [filteredData]);

  // --- EXPENSE SPECIFIC DATA ---
  const expenseData = useMemo(() => {
    return transactions
      .filter(t => t.type === 'EXPENSE')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const expenseStats = useMemo(() => {
    const total = expenseData.reduce((sum, t) => sum + t.amount, 0);
    const count = expenseData.length;
    const max = expenseData.length > 0 ? Math.max(...expenseData.map(t => t.amount)) : 0;
    return { total, count, max };
  }, [expenseData]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  // --- ACTIONS ---

  const initiateDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    setDeletingTransactionId(id);
  };

  const confirmDelete = async () => {
    if (!deletingTransactionId) return;
    setIsLoading(true);
    try {
      await api.deleteTransaction(deletingTransactionId);
      onRefresh();
      setDeletingTransactionId(null);
    } catch (error) {
      alert("Gagal menghapus data. Pastikan koneksi internet stabil.");
      console.error("Delete Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (t: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    setEditingTransaction(t);
    setEditDesc(t.description);
    setEditAmount(t.amount.toString());
    setEditDate(t.date.split('T')[0]); // Ensure format YYYY-MM-DD
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction) return;
    setIsLoading(true);
    try {
      const updatedTransaction: Transaction = {
        ...editingTransaction,
        description: editDesc,
        amount: parseInt(editAmount),
        date: new Date(editDate).toISOString()
      };
      await api.updateTransaction(updatedTransaction);
      onRefresh();
      setEditingTransaction(null);
    } catch (error) {
      alert("Gagal mengupdate data.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Loading Overlay */}
      {isLoading && (
         <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="animate-spin text-blue-500" size={48} />
         </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-kids font-bold text-slate-800 flex items-center gap-3">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><FileText size={24}/></div>
             Laporan Keuangan MIT
          </h1>
          <p className="text-slate-500">Rekapitulasi seluruh dana masuk dan keluar kelas MIT.</p>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl w-full md:w-fit">
        <button
          onClick={() => setActiveTab('GENERAL')}
          className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'GENERAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <PieChart size={16} />
          Rekapitulasi Umum
        </button>
        <button
          onClick={() => setActiveTab('EXPENSE')}
          className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'EXPENSE' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Receipt size={16} />
          Detail Pengeluaran
        </button>
      </div>

      {activeTab === 'GENERAL' ? (
        // --- GENERAL VIEW ---
        <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Pemasukan</p>
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
                 <TrendingUp size={20} />
                 {formatCurrency(summary.income)}
              </div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Pengeluaran</p>
              <div className="flex items-center gap-2 text-rose-600 font-bold text-lg">
                 <TrendingDown size={20} />
                 {formatCurrency(summary.expense)}
              </div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Sisa Dana Kas</p>
              <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
                 <TrendingUp size={20} />
                 {formatCurrency(summary.balance)}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <Filter size={16} /> Filter:
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <select 
                value={filterStudent}
                onChange={(e) => setFilterStudent(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/10 bg-white"
              >
                <option value="ALL">Semua Siswa</option>
                {students.sort((a,b)=>a.name.localeCompare(b.name)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="min-w-[150px]">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/10 bg-white"
              >
                <option value="ALL">Semua Transaksi</option>
                <option value="INCOME">Hanya Masuk</option>
                <option value="EXPENSE">Hanya Keluar</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Deskripsi Kegiatan</th>
                    <th className="px-6 py-4">Tipe</th>
                    <th className="px-6 py-4">Jumlah</th>
                    <th className="px-6 py-4 text-center">Bukti</th>
                    {isAdmin && <th className="px-6 py-4 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} className="px-6 py-10 text-center text-slate-400 italic">Belum ada data tersedia.</td>
                    </tr>
                  ) : (
                    filteredData.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                          {new Date(t.date).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700 leading-tight">
                                {t.type === 'INCOME' && t.month && t.year 
                                    ? `Iuran Kas - ${t.month} ${t.year}` 
                                    : t.description}
                            </span>
                            {t.studentId && (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <User size={10} /> {students.find(s => s.id === t.studentId)?.name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {t.type === 'INCOME' ? 'Masuk' : 'Keluar'}
                          </span>
                        </td>
                        <td className={`px-6 py-4 font-bold whitespace-nowrap ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {t.attachment ? (
                            <button 
                              onClick={() => setShowImage(t.attachment || null)}
                              className="p-1.5 bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-500 rounded-lg transition-all"
                            >
                              <Eye size={16} />
                            </button>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 text-right">
                             <div className="flex items-center justify-end gap-1">
                                <button onClick={(e) => openEditModal(t, e)} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                                  <Pencil size={16} />
                                </button>
                                <button onClick={(e) => initiateDelete(t.id, e)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Hapus">
                                  <Trash2 size={16} />
                                </button>
                             </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        // --- EXPENSE DETAIL VIEW ---
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
           {/* Expense Stats */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-rose-500 rounded-3xl p-6 text-white shadow-lg shadow-rose-200 relative overflow-hidden">
               <Receipt className="absolute -right-4 -bottom-4 text-rose-400/50 w-32 h-32 -rotate-12" />
               <p className="text-rose-100 text-xs font-bold uppercase tracking-wider mb-1">Total Pengeluaran</p>
               <h3 className="text-2xl font-bold font-kids">{formatCurrency(expenseStats.total)}</h3>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
               <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-orange-50 text-orange-500 rounded-lg"><ArrowUpRight size={18}/></div>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pengeluaran Terbesar</p>
               </div>
               <h3 className="text-xl font-bold text-slate-800 font-kids">{formatCurrency(expenseStats.max)}</h3>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
               <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-purple-50 text-purple-500 rounded-lg"><Receipt size={18}/></div>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Jumlah Transaksi</p>
               </div>
               <h3 className="text-xl font-bold text-slate-800 font-kids">{expenseStats.count} <span className="text-sm font-normal text-slate-400">kali</span></h3>
            </div>
           </div>

           {/* Expense List Timeline Style */}
           <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-rose-500 rounded-full"></span>
                Rincian Penggunaan Dana
              </h3>
              
              <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[19px] before:w-0.5 before:bg-slate-100">
                {expenseData.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">Belum ada data pengeluaran.</div>
                ) : (
                  expenseData.map((t, idx) => (
                    <div key={t.id} className="relative pl-12">
                      <div className="absolute left-0 top-1.5 w-10 h-10 bg-white border-4 border-rose-50 rounded-full flex items-center justify-center z-10">
                        <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-rose-200 hover:shadow-md transition-all group relative">
                         {isAdmin && (
                            <div className="absolute top-4 right-4 flex gap-1 bg-white/80 p-1 rounded-lg backdrop-blur-sm z-20">
                              <button onClick={(e) => openEditModal(t, e)} className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                                <Pencil size={14} />
                              </button>
                              <button onClick={(e) => initiateDelete(t.id, e)} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-md">
                                <Trash2 size={14} />
                              </button>
                            </div>
                         )}

                         <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                               <div className="flex items-center gap-2 mb-2">
                                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                    <Calendar size={12} />
                                    {new Date(t.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                  </span>
                               </div>
                               <h4 className="text-lg font-bold text-slate-800 mb-1">{t.description}</h4>
                               <p className="text-rose-600 font-bold text-xl">{formatCurrency(t.amount)}</p>
                            </div>
                            
                            {t.attachment && (
                              <div className="shrink-0">
                                <div 
                                  className="w-full md:w-32 h-32 rounded-xl bg-white border border-slate-200 p-1 cursor-pointer overflow-hidden relative group-hover:scale-105 transition-transform"
                                  onClick={() => setShowImage(t.attachment || null)}
                                >
                                  <img src={t.attachment} alt="Bukti" className="w-full h-full object-cover rounded-lg" />
                                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Eye className="text-white drop-shadow-md" size={24} />
                                  </div>
                                </div>
                                <p className="text-[10px] text-center text-slate-400 mt-1 font-medium">Klik untuk perbesar</p>
                              </div>
                            )}
                         </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
           </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingTransaction && (
         <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Pencil size={20} className="text-blue-500"/> Edit Transaksi
                </h3>
                <button onClick={() => setEditingTransaction(null)} className="p-2 text-slate-400 hover:text-rose-500 rounded-full hover:bg-rose-50 transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tanggal Transaksi</label>
                    <input 
                      type="date" 
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Deskripsi / Keterangan</label>
                    <input 
                      type="text" 
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Jumlah Nominal (Rp)</label>
                    <input 
                      type="number" 
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                    />
                 </div>

                 <button 
                  onClick={handleSaveEdit}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100 mt-2 disabled:opacity-50"
                 >
                   {isLoading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
                   Simpan Perubahan
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* DELETE MODAL - MAKIN WAH */}
      {deletingTransactionId && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-rose-500"></div>
              
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <AlertTriangle size={32} />
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 font-kids mb-2">Hapus Transaksi?</h3>
                <p className="text-slate-500 text-sm">
                  Data yang dihapus tidak bisa dikembalikan lagi loh. Yakin mau lanjut?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => setDeletingTransactionId(null)}
                   className="py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                 >
                   Batal
                 </button>
                 <button 
                   onClick={confirmDelete}
                   disabled={isLoading}
                   className="py-3 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                 >
                   {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Ya, Hapus'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* IMAGE MODAL */}
      {showImage && (
        <div 
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowImage(null)}
        >
          <div className="max-w-3xl w-full bg-white rounded-3xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full text-slate-800 transition-all z-10" onClick={() => setShowImage(null)}>
              <X size={20} />
            </button>
            <div className="p-2 bg-slate-100">
              <img src={showImage} alt="Lampiran" className="w-full max-h-[70vh] object-contain mx-auto rounded-2xl" />
            </div>
            <div className="p-6 text-center bg-white">
              <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2">
                <Receipt className="text-rose-500" size={20} />
                Bukti Transaksi Sah
              </h3>
              <p className="text-xs text-slate-500 mt-1">Dokumen ini adalah bukti resmi penggunaan uang kas kelas.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;