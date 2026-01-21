
import React, { useState } from 'react';
import { Transaction, Student, MONTHS, CURRENT_YEAR } from '../types';
import { Check, X, Info, Search, CalendarDays, ChevronDown } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  students: Student[];
}

const MonthlyChecklist: React.FC<Props> = ({ transactions, students }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const currentMonthIdx = new Date().getMonth();
  const currentYearNow = new Date().getFullYear();

  const years = [currentYearNow - 1, currentYearNow, currentYearNow + 1, currentYearNow + 2];

  const isPaid = (studentId: string, month: string) => {
    return transactions.some(t => 
      t.type === 'INCOME' && 
      t.studentId === studentId && 
      t.month === month && 
      t.year === selectedYear
    );
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-kids font-bold text-slate-800 flex items-center gap-3">
             <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl"><CalendarDays size={24}/></div>
             Ceklis Uang Kas
          </h1>
          <p className="text-slate-500">Pantau status iuran siswa MIT per tahun ajaran.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
             <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none font-bold text-slate-700 min-w-[140px]"
             >
               {years.map(y => <option key={y} value={y}>Tahun {y}</option>)}
             </select>
             <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari siswa..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full md:w-64"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3 border border-blue-100">
        <Info className="text-blue-500 mt-0.5 shrink-0" size={20} />
        <div>
           <p className="text-sm font-bold text-blue-900">Data Tahun {selectedYear}:</p>
           <p className="text-xs text-blue-700">Tanda centang (<span className="text-emerald-600 font-bold">✓</span>) berarti sudah lunas untuk bulan tersebut.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-5 border-r sticky left-0 bg-slate-50 z-10 w-48">Nama Siswa MIT</th>
                {MONTHS.map((m, idx) => (
                  <th key={m} className={`px-2 py-5 text-center ${idx === currentMonthIdx && selectedYear === currentYearNow ? 'bg-orange-50 text-orange-500' : ''}`}>
                    {m.substring(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-6 py-10 text-center text-slate-400 italic">Data tidak ditemukan</td>
                </tr>
              ) : (
                filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700 border-r sticky left-0 bg-white z-10">
                      <span className="truncate block max-w-[180px]">{s.name}</span>
                    </td>
                    {MONTHS.map((m, idx) => {
                      const paid = isPaid(s.id, m);
                      const isThisMonth = idx === currentMonthIdx && selectedYear === currentYearNow;
                      return (
                        <td key={m} className={`px-2 py-4 text-center ${isThisMonth ? 'bg-orange-50/20' : ''}`}>
                          <div className="flex items-center justify-center">
                            {paid ? (
                              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Check size={16} strokeWidth={3} />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-200 flex items-center justify-center">
                                <X size={12} />
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyChecklist;
