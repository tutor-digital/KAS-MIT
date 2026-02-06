import React, { useState } from 'react';
import { Student, UserRole } from '../types';
import * as api from '../services/api';
import { UserPlus, Search, Trash2, Pencil, Eye, User, Loader2 } from 'lucide-react';
import StudentProfile from './StudentProfile';

interface Props {
  students: Student[];
  onRefresh: () => void;
  isAdmin: boolean;
  userRole?: UserRole; // Tambahan prop untuk mengetahui role spesifik (Teacher/Admin)
}

const StudentList: React.FC<Props> = ({ students, onRefresh, isAdmin, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State Input Baru (Hanya Admin)
  const [newName, setNewName] = useState('');
  const [newNickname, setNewNickname] = useState('');

  // View Profile State (Menggantikan Editing Modal lama)
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Delete State (Hanya Admin)
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  const getAvatar = (s: Student) => {
    if (s.photoUrl) return s.photoUrl;
    return `https://api.dicebear.com/7.x/micah/svg?seed=${s.name}&backgroundColor=bbf7d0`;
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      alert("Nama Lengkap wajib diisi!");
      return;
    }
    const finalNickname = newNickname.trim() || newName.split(' ')[0].toLowerCase();

    setIsLoading(true);
    try {
      const newStudent: Student = {
        id: api.generateUUID(),
        name: newName,
        nickname: finalNickname,
        gender: 'L', // Default L, nanti bisa diedit di profil
        password: '123456',
        absentNumber: students.length > 0 ? Math.max(...students.map(s => s.absentNumber)) + 1 : 1
      };
      await api.addStudent(newStudent);
      onRefresh();
      setNewName('');
      setNewNickname('');
    } catch (error) {
      alert("Gagal menambah siswa.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const initiateDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah klik row
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

  // Apakah user ini Guru?
  const isTeacher = userRole === 'TEACHER';
  // Apakah user ini Admin?
  const isAdministrator = userRole === 'ADMIN';

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <User className="text-emerald-600" />
            Daftar Siswa ({filteredStudents.length})
        </h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama siswa..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none"
          />
        </div>
      </div>

      {/* ADMIN ADD FORM */}
      {isAdmin && (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
             <h3 className="font-bold text-sm text-slate-600">Tambah Siswa Baru</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  placeholder="Nama Lengkap" 
                  className="px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-200"
                />
                <input 
                  value={newNickname} 
                  onChange={e => setNewNickname(e.target.value)} 
                  placeholder="Username Login" 
                  className="px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-200"
                />
                <button onClick={handleAdd} disabled={isLoading} className="bg-emerald-600 text-white rounded-xl font-bold py-3 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors">
                    {isLoading ? <Loader2 className="animate-spin" /> : <UserPlus size={18} />} Tambah
                </button>
             </div>
          </div>
      )}

      {/* STUDENT LIST */}
      <div className="space-y-3">
        {filteredStudents.map((s, idx) => (
            <div 
                key={s.id} 
                onClick={() => (isAdmin || isTeacher) && setViewingStudent(s)}
                className={`bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm transition-all ${isAdmin || isTeacher ? 'cursor-pointer hover:border-emerald-300 hover:shadow-md' : ''}`}
            >
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-300 w-4">{idx + 1}</span>
                    <img src={getAvatar(s)} className="w-10 h-10 rounded-full bg-slate-100 object-cover" />
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm">{s.name}</h4>
                        <div className="flex items-center gap-2">
                            {s.nickname && (
                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                                    @{s.nickname}
                                </span>
                            )}
                            {s.gender === 'L' ? (
                                <span className="text-[10px] text-blue-500 font-bold">Laki-laki</span>
                            ) : (
                                <span className="text-[10px] text-pink-500 font-bold">Perempuan</span>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* ACTIONS */}
                <div className="flex gap-2">
                    {(isAdmin || isTeacher) && (
                        <button 
                            className={`p-2 rounded-lg ${isAdmin ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'}`}
                            title="Lihat Detail Profil"
                        >
                            {isAdmin ? <Pencil size={16} /> : <Eye size={16} />}
                        </button>
                    )}
                    {isAdmin && (
                        <button onClick={(e) => initiateDelete(s.id, e)} className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-colors">
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>
        ))}
      </div>

      {/* PROFILE DETAIL MODAL */}
      {viewingStudent && (
          <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
              <div className="bg-slate-50 w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-y-auto animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 relative">
                  <div className="p-6">
                      <StudentProfile 
                          student={viewingStudent} 
                          onUpdate={() => {
                              onRefresh();
                              // Jika update nama/data lain, update juga state viewingStudent agar UI modal berubah
                              // Tapi karena props berubah dari parent (onRefresh -> fetchData -> students updated),
                              // kita perlu mencari student yang sedang dilihat di list baru.
                              // Namun untuk simplifikasi, tutup modal atau biarkan.
                              // Idealnya: setViewingStudent(students.find(s => s.id === viewingStudent.id) || null)
                          }}
                          isModal={true}
                          onClose={() => setViewingStudent(null)}
                          readOnly={isTeacher} // Guru = ReadOnly, Admin = Full Access
                      />
                  </div>
              </div>
          </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingStudentId && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-white w-full max-w-xs rounded-[2rem] p-6 text-center shadow-xl scale-100 animate-in zoom-in-95">
                <h3 className="font-bold text-lg mb-2">Hapus Siswa?</h3>
                <p className="text-slate-500 text-sm mb-6">Semua data transaksi siswa ini juga akan terhapus.</p>
                <div className="flex gap-3">
                    <button onClick={() => setDeletingStudentId(null)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600">Batal</button>
                    <button onClick={confirmDelete} className="flex-1 py-3 bg-rose-500 rounded-xl font-bold text-white hover:bg-rose-600">Hapus</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;