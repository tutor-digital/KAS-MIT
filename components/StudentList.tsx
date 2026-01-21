import React, { useState } from 'react';
import { Student } from '../types';
import * as api from '../services/api';
import { UserPlus, Search, Trash2, GraduationCap, Pencil, X, Save, Loader2, AlertTriangle } from 'lucide-react';

interface Props {
  students: Student[];
  onRefresh: () => void;
  isAdmin: boolean;
}

const StudentList: React.FC<Props> = ({ students, onRefresh, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'L' | 'P'>('L');
  const [isLoading, setIsLoading] = useState(false);
  
  // Edit State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editName, setEditName] = useState('');
  const [editGender, setEditGender] = useState<'L' | 'P'>('L');

  // Delete State
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  // Avatar Assets - Menggunakan Style "Micah" yang seperti ilustrasi buku cerita anak
  const getAvatar = (name: string, gender: 'L' | 'P') => {
    // Kita gunakan nama sebagai seed agar setiap anak punya wajah uniknya sendiri
    const seed = name.trim().replace(/\s/g, '') || 'student';
    // Background color: Biru pastel untuk L, Pink/Peach pastel untuk P
    const bgColor = gender === 'L' ? 'd1d4f9' : 'ffdfbf'; 
    return `https://api.dicebear.com/7.x/micah/svg?seed=${seed}&backgroundColor=${bgColor}&baseColor=f9c9b6&mouth=pucker,smile,smirk,laughing&hair=fonze,full,mrT,pixie,turban`;
  };

  const handleAdd = async () => {
    if (!newStudentName.trim()) {
      alert("Mohon isi nama siswa terlebih dahulu.");
      return;
    }
    setIsLoading(true);
    try {
      const newStudent: Student = {
        id: api.generateUUID(),
        name: newStudentName,
        gender: newStudentGender,
        absentNumber: students.length > 0 ? Math.max(...students.map(s => s.absentNumber)) + 1 : 1
      };
      await api.addStudent(newStudent);
      onRefresh();
      setNewStudentName('');
      setNewStudentGender('L');
    } catch (error) {
      alert("Gagal menambah siswa.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const initiateDelete = (id: string) => {
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
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setEditName(student.name);
    setEditGender(student.gender);
  };

  const handleSaveEdit = async () => {
    if (!editingStudent || !editName.trim()) return;
    setIsLoading(true);
    try {
      const updatedStudent: Student = {
        ...editingStudent,
        name: editName,
        gender: editGender
      };
      await api.updateStudent(updatedStudent);
      onRefresh();
      setEditingStudent(null);
    } catch (error) {
      alert("Gagal update data siswa.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.absentNumber - b.absentNumber);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-kids font-bold text-slate-800 flex items-center gap-3">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><GraduationCap size={24}/></div>
             Data Siswa MIT
          </h1>
          <p className="text-slate-500">Daftar siswa yang terdaftar dalam program kas mandiri MIT.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama siswa..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full md:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        )}
        
        {isAdmin && (
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 bg-slate-50/50">
            <div className="flex-1 flex gap-3">
              <input 
                type="text" 
                placeholder="Masukkan Nama Siswa Baru" 
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <select
                value={newStudentGender}
                onChange={(e) => setNewStudentGender(e.target.value as 'L' | 'P')}
                className="w-32 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <button 
              type="button"
              onClick={handleAdd}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
              Tambah Siswa
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Jenis Kelamin</th>
                {isAdmin && <th className="px-6 py-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} className="px-6 py-10 text-center text-slate-400">
                    <p>Tidak ada data siswa ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-slate-400 font-bold">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      <div className="flex items-center gap-3">
                        <img 
                            src={getAvatar(s.name, s.gender)} 
                            className="w-10 h-10 rounded-full bg-slate-50 border-2 border-white shadow-sm hover:scale-110 transition-transform" 
                            alt="" 
                        />
                        {s.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.gender === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                        {s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                            onClick={() => openEditModal(s)}
                            className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit Data"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => initiateDelete(s.id)}
                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Hapus Data"
                          >
                            <Trash2 size={18} />
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

      {/* EDIT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Edit Data Siswa</h3>
                <button onClick={() => setEditingStudent(null)} className="p-2 text-slate-400 hover:text-rose-500 rounded-full hover:bg-rose-50 transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nama Siswa</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Jenis Kelamin</label>
                    <div className="flex gap-4">
                       <label className={`flex-1 cursor-pointer border-2 rounded-2xl p-3 flex items-center justify-center gap-2 transition-all ${editGender === 'L' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400 hover:border-blue-200'}`}>
                          <input type="radio" name="gender" className="hidden" checked={editGender === 'L'} onChange={() => setEditGender('L')} />
                          <span className="font-bold">Laki-laki</span>
                       </label>
                       <label className={`flex-1 cursor-pointer border-2 rounded-2xl p-3 flex items-center justify-center gap-2 transition-all ${editGender === 'P' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-100 text-slate-400 hover:border-pink-200'}`}>
                          <input type="radio" name="gender" className="hidden" checked={editGender === 'P'} onChange={() => setEditGender('P')} />
                          <span className="font-bold">Perempuan</span>
                       </label>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3 pt-4">
                    <img src={getAvatar(editName || 'Preview', editGender)} alt="Preview" className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200" />
                    <div className="text-xs text-slate-400">
                       Preview Avatar <br/>
                       <span className="font-bold text-slate-600">{editGender === 'L' ? 'Gaya Laki-laki' : 'Gaya Perempuan'}</span>
                    </div>
                 </div>

                 <button 
                  onClick={handleSaveEdit}
                  disabled={isLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-100 mt-2 disabled:opacity-50"
                 >
                   {isLoading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
                   Simpan Perubahan
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deletingStudentId && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-rose-500"></div>
              
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <AlertTriangle size={32} />
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 font-kids mb-2">Hapus Data Siswa?</h3>
                <p className="text-slate-500 text-sm">
                  Semua riwayat pembayaran siswa ini juga akan terhapus. Yakin?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => setDeletingStudentId(null)}
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
    </div>
  );
};

export default StudentList;