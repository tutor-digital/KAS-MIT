import React, { useState } from 'react';
import { Student, Transaction, MONTHS, CURRENT_YEAR } from '../types';
import * as api from '../services/api';
import { Save, Calendar, Coins, UserCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface Props {
  students: Student[];
  onSuccess: (t: Transaction[]) => void;
}

const IncomeForm: React.FC<Props> = ({ students, onSuccess }) => {
  const [studentId, setStudentId] = useState('');
  const [amountPerMonth, setAmountPerMonth] = useState('15000'); 
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [isLoading, setIsLoading] = useState(false);

  const toggleMonth = (m: string) => {
    setSelectedMonths(prev => 
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !amountPerMonth || selectedMonths.length === 0) {
      alert("Harap pilih siswa dan minimal satu bulan pembayaran.");
      return;
    }

    setIsLoading(true);
    const student = students.find(s => s.id === studentId);
    
    const newTransactions: Transaction[] = selectedMonths.map(month => ({
      id: api.generateUUID(),
      type: 'INCOME',
      amount: parseInt(amountPerMonth),
      date: new Date().toISOString(),
      // Change: Description is now just "Iuran Kas - Month Year", name is handled via studentId
      description: `Iuran Kas - ${month} ${year}`,
      studentId,
      month,
      year
    }));

    try {
      await api.addTransactions(newTransactions);
      onSuccess(newTransactions);
      alert(`Berhasil! Pembayaran ${student?.name} tercatat untuk ${selectedMonths.length} bulan.`);
      setStudentId('');
      setSelectedMonths([]);
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan data.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-emerald-50 text-emerald-500 rounded-3xl mb-4">
          <Coins size={48} />
        </div>
        <h1 className="text-2xl font-kids font-bold text-slate-800">Catat Uang Masuk</h1>
        <p className="text-slate-500">Rekam pembayaran iuran bulanan dari wali murid.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-3xl">
             <Loader2 className="animate-spin text-emerald-500" size={48} />
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <UserCircle size={16} className="text-emerald-500" />
            Nama Siswa
          </label>
          <div className="relative">
            <select 
              value={studentId} 
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all appearance-none"
              required
            >
              <option value="" className="text-slate-400">-- Pilih Siswa --</option>
              {students.sort((a,b) => a.name.localeCompare(b.name)).map(s => (
                <option key={s.id} value={s.id} className="text-slate-800">{s.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
               <Calendar size={16} className="text-emerald-500" />
               Tahun
             </label>
             <input 
              type="number" 
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none"
            />
           </div>
           <div>
             <label className="block text-sm font-bold text-slate-700 mb-2">Jumlah per Bulan</label>
             <input 
               type="number" 
               value={amountPerMonth}
               onChange={(e) => setAmountPerMonth(e.target.value)}
               className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-xl font-bold text-emerald-600"
               required
             />
           </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">Pilih Bulan (Bisa pilih banyak)</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {MONTHS.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => toggleMonth(m)}
                className={`
                  px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1
                  ${selectedMonths.includes(m) 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-emerald-200'}
                `}
              >
                {selectedMonths.includes(m) && <CheckCircle2 size={12} />}
                {m.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {selectedMonths.length > 0 && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-500">Total Pembayaran:</span>
            <span className="text-xl font-bold text-emerald-600">Rp {(parseInt(amountPerMonth || '0') * selectedMonths.length).toLocaleString('id-ID')}</span>
          </div>
        )}

        <button 
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
          disabled={!studentId || selectedMonths.length === 0 || isLoading}
        >
          {isLoading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
          Simpan Pembayaran
        </button>
      </form>
    </div>
  );
};

export default IncomeForm;