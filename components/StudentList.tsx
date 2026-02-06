import React, { useState } from 'react';
import { Student, UserRole } from '../types';
import * as api from '../services/api';
import { UserPlus, Search, Trash2, Pencil, Eye, User, Loader2, Weight, Ruler, X, Save, Calendar, Baby } from 'lucide-react';
import StudentProfile from './StudentProfile';

interface Props {
  students: Student[];
  onRefresh: () => void;
  isAdmin: boolean;
  userRole?: UserRole;
}

const StudentList: React.FC<Props> = ({ students, onRefresh, isAdmin, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk Modal Tambah Siswa
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState<{
    name: string;
    nickname: string;
    gender: 'L' | 'P';
    birthDate: string;
    weight: string;
    height: string;
  }>({
    name: '',
    nickname: '',
    gender: 'L',
    birthDate: '',
    weight: '',
    height: ''
  });

  // State untuk Modal Lihat/Edit Profil
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  const getAvatar = (s: Student) => {
    if (s.photoUrl) return s.photoUrl;
    return `https://api.dicebear.com/7.x/micah/svg?seed=${s.name}&backgroundColor=bbf7d0`;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newData.name.trim()) {
      alert("Nama Lengkap wajib diisi!");
      return;
    }

    const finalNickname = newData.nickname.trim() || newData.name.split(' ')[0].toLowerCase();

    setIsLoading(true);
    try {
      const newStudent: Student = {
        id: api.generateUUID(),
        name: newData.name,
        nickname: finalNickname,
        gender: newData.gender,
        birthDate: newData.birthDate || undefined,
        weight: newData.weight ? parseFloat(newData.weight) : undefined,
        height: newData.height ? parseFloat(newData.height) : undefined,
        password: '123456',
        absentNumber: students.length > 0 ? Math.max(...students.map(s => s.absentNumber)) + 1 : 1
      };

      await api.addStudent(newStudent);
      onRefresh();
      setIsAdding(false);
      // Reset Form
      setNewData({
        name: '',
        nickname: '',
        gender: 'L',
        birthDate: '',
        weight: '',
        height: ''
      });
      alert(`Berhasil mendaftarkan siswa: ${newStudent.name}`);
    } catch (error) {
      alert("Gagal menambah siswa.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const initiateDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingStudentId(id);
  };

  const confirmDelete = async () => {
    if (!deletingStudentId) return;
    setIsLoading(true);
    try {
      await api.deleteStudent(deletingStudentId);
      onRefresh();
      setDeletingStudentId(null);
    } catch (error) {
      alert("Gagal menghapus siswa.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.nickname && s.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => a.absentNumber - b.absentNumber);

  const isTeacher = userRole === 'TEACHER';

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <User className="text-emerald-600" />
                Daftar Siswa ({filteredStudents.length})
            </h1>
            {isAdmin && (
                <button 
                    onClick={() => setIsAdding(true)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
                >
                    <UserPlus size={16} />
                    Registrasi Siswa
                </button>
            )}
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama siswa..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none shadow-sm"
          />
        </div>
      </div>

      {/* STUDENT LIST */}
      <div className="space-y-3">
        {filteredStudents.length === 0 ? (
             <div className="text-center py-10 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                <p>Tidak ada data siswa.</p>
             </div>
        ) : (
            filteredStudents.map((s, idx) => (
                <div 
                    key={s.id} 
                    onClick={() => (isAdmin || isTeacher) && setViewingStudent(s)}
                    className={`bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm transition-all relative overflow-hidden group ${isAdmin || isTeacher ? 'cursor-pointer hover:border-emerald-300 hover:shadow-md' : ''}`}
                >
                    {/* Gender Indicator Strip */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.gender === 'L' ? 'bg-blue-400' : 'bg-pink-400'}`}></div>

                    <div className="flex items-center gap-4 flex-1 pl-2">
                        <span className="text-xs font-bold text-slate-300 w-5 shrink-0 text-center">{idx + 1}</span>
                        <div className="relative">
                            <img src={getAvatar(s)} className="w-12 h-12 rounded-full bg-slate-50 object-cover shrink-0 border border-slate-100" />
                            {s.gender === 'L' ? (
                                <div className="absolute -bottom-1 -right-1 bg-blue-100 text-blue-600 rounded-full p-0.5 border border-white">
                                    <Baby size={10} />
                                </div>
                            ) : (
                                <div className="absolute -bottom-1 -right-1 bg-pink-100 text-pink-600 rounded-full p-0.5 border border-white">
                                    <Baby size={10} />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 text-sm truncate">{s.name}</h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                {s.nickname && (
                                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 border border-slate-200">
                                        @{s.nickname}
                                    </span>
                                )}
                                
                                {/* Badge Berat & Tinggi */}
                                {(s.weight && s.weight > 0) ? (
                                    <span className="text-[10px] bg-amber-50 px-2 py-0.5 rounded text-amber-600 border border-amber-100 font-bold flex items-center gap-1">
                                        <Weight size={10} /> {s.weight}kg
                                    </span>
                                ) : null}
                                
                                {(s.height && s.height > 0) ? (
                                    <span className="text-[10px] bg-violet-50 px-2 py-0.5 rounded text-violet-600 border border-violet-100 font-bold flex items-center gap-1">
                                        <Ruler size={10} /> {s.height}cm
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    
                    {/* ACTIONS */}
                    <div className="flex gap-2 ml-2">
                        {isAdmin && (
                            <button onClick={(e) => initiateDelete(s.id, e)} className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        )}
                        {(isAdmin || isTeacher) && (
                            <div className="text-slate-300">
                                <Eye size={20} />
                            </div>
                        )}
                    </div>
                </div>
            ))
        )}
      </div>

      {/* MODAL REGISTRASI SISWA BARU (FORM LENGKAP) */}
      {isAdding && (
          <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-lg h-[90vh] sm:h-auto rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><UserPlus size={20} /></div>
                          Registrasi Siswa
                      </h2>
                      <button onClick={() => setIsAdding(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-rose-100 hover:text-rose-500 transition-colors">
                          <X size={20} />
                      </button>
                  </div>

                  <form onSubmit={handleAddSubmit} className="space-y-4">
                      {/* Nama Lengkap */}
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-2">Nama Lengkap Siswa</label>
                          <input 
                              required
                              type="text"
                              value={newData.name}
                              onChange={e => setNewData({...newData, name: e.target.value})}
                              placeholder="Contoh: Muhammad Dzakir Khafadi"
                              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-700"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          {/* Nama Panggilan */}
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-2">Nama Panggilan</label>
                              <input 
                                  required
                                  type="text"
                                  value={newData.nickname}
                                  onChange={e => setNewData({...newData, nickname: e.target.value})}
                                  placeholder="Contoh: Khafa"
                                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                              />
                          </div>
                          
                          {/* Jenis Kelamin */}
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-2">Jenis Kelamin</label>
                              <select 
                                  value={newData.gender} 
                                  onChange={e => setNewData({...newData, gender: e.target.value as 'L'|'P'})}
                                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium appearance-none"
                              >
                                  <option value="L">Laki-laki</option>
                                  <option value="P">Perempuan</option>
                              </select>
                          </div>
                      </div>

                      {/* Tanggal Lahir */}
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-2">Tanggal Lahir</label>
                          <div className="relative">
                              <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />
                              <input 
                                  type="date"
                                  value={newData.birthDate}
                                  onChange={e => setNewData({...newData, birthDate: e.target.value})}
                                  className="w-full pl-11 pr-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                              />
                          </div>
                      </div>

                      {/* BB & TB */}
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-2">Berat (kg)</label>
                              <div className="relative">
                                  <Weight className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                  <input 
                                      type="number"
                                      value={newData.weight}
                                      onChange={e => setNewData({...newData, weight: e.target.value})}
                                      placeholder="0"
                                      className="w-full pl-11 pr-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                                  />
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-2">Tinggi (cm)</label>
                              <div className="relative">
                                  <Ruler className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                  <input 
                                      type="number"
                                      value={newData.height}
                                      onChange={e => setNewData({...newData, height: e.target.value})}
                                      placeholder="0"
                                      className="w-full pl-11 pr-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                                  />
                              </div>
                          </div>
                      </div>

                      <div className="pt-4">
                          <button 
                              type="submit" 
                              disabled={isLoading}
                              className="w-full bg-[#064e3b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95 transition-transform"
                          >
                              {isLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                              Simpan Data Siswa
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* DETAIL SISWA MODAL (VIEW / EDIT) */}
      {viewingStudent && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
              <div className="bg-slate-50 w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-y-auto animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 relative">
                  <div className="p-6">
                      <StudentProfile 
                          student={viewingStudent} 
                          onUpdate={() => {
                              onRefresh();
                              // Refresh object viewingStudent dengan data terbaru dari state students
                              // Karena students di parent sudah update, kita harus update local state modal juga
                              // Cara sederhana: tutup modal lalu user buka lagi, ATAU
                              // Kita biarkan tertutup agar user melihat list yang sudah update.
                              setViewingStudent(null); 
                          }}
                          isModal={true}
                          onClose={() => setViewingStudent(null)}
                          readOnly={isTeacher} // Guru cuma bisa lihat
                      />
                  </div>
              </div>
          </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingStudentId && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-white w-full max-w-xs rounded-[2rem] p-6 text-center shadow-xl scale-100 animate-in zoom-in-95">
                <h3 className="font-bold text-lg mb-2">Hapus Siswa?</h3>
                <p className="text-slate-500 text-sm mb-6">Semua data transaksi siswa ini juga akan terhapus permanen.</p>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setDeletingStudentId(null)} className="py-3 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200">Batal</button>
                    <button onClick={confirmDelete} className="py-3 bg-rose-500 rounded-xl font-bold text-white hover:bg-rose-600 shadow-lg shadow-rose-200">Hapus</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;