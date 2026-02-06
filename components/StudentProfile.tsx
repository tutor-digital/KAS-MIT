import React, { useState, useRef, useEffect } from 'react';
import { Student } from '../types';
import * as api from '../services/api';
import { Ruler, Weight, Calendar, Save, LogOut, Lock, Loader2, Camera, User, X, ArrowLeft } from 'lucide-react';

interface Props {
  student: Student;
  onUpdate: () => void;
  onLogout?: () => void; // Optional karena tidak dipakai saat mode Modal
  readOnly?: boolean;    // Mode Hanya Lihat (Untuk Guru)
  isModal?: boolean;     // Apakah ini tampil sebagai modal/popup?
  onClose?: () => void;  // Fungsi tutup modal
}

const StudentProfile: React.FC<Props> = ({ 
  student, 
  onUpdate, 
  onLogout, 
  readOnly = false,
  isModal = false,
  onClose
}) => {
  const [birthDate, setBirthDate] = useState(student.birthDate || '');
  const [weight, setWeight] = useState(student.weight?.toString() || '');
  const [height, setHeight] = useState(student.height?.toString() || '');
  const [nickname, setNickname] = useState(student.nickname || '');
  const [password, setPassword] = useState(student.password || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Reset state jika student berubah (misal di modal ganti-ganti siswa)
  useEffect(() => {
    setBirthDate(student.birthDate || '');
    setWeight(student.weight?.toString() || '');
    setHeight(student.height?.toString() || '');
    setNickname(student.nickname || '');
    setPassword(student.password || '');
  }, [student]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await api.uploadAttachment(file);
        if (url) {
           const updatedStudent = { ...student, photoUrl: url };
           await api.updateStudent(updatedStudent);
           onUpdate();
        }
      } catch (error) {
        alert("Gagal upload foto");
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (readOnly) return;
    setIsLoading(true);
    try {
      const updatedStudent: Student = {
        ...student,
        nickname: nickname,
        birthDate: birthDate,
        weight: parseFloat(weight),
        height: parseFloat(height),
        password: password
      };
      await api.updateStudent(updatedStudent);
      onUpdate();
      alert("Data anak berhasil diperbarui!");
      if (isModal && onClose) onClose();
    } catch (error) {
      alert("Gagal update data.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = `w-full pl-12 pr-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-emerald-200 text-slate-700 font-bold ${readOnly ? 'bg-slate-200 cursor-not-allowed text-slate-500' : 'bg-slate-50'}`;

  // Use pb-40 instead of pb-20 to ensure it clears the fixed bottom nav
  return (
    <div className={`space-y-6 animate-in slide-in-from-right-4 duration-500 ${!isModal ? 'pb-40' : ''}`}>
      
      {/* Jika Modal, tampilkan tombol Back/Close */}
      {isModal && (
        <div className="flex items-center justify-between mb-4">
             <button onClick={onClose} className="flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-600">
                <ArrowLeft size={20} /> Kembali
             </button>
             {readOnly && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-lg font-bold">Read Only</span>}
        </div>
      )}

      <div className={`bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm text-center relative overflow-visible ${!isModal ? 'mt-10' : 'mt-4'}`}>
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-lime-200 to-emerald-100 z-0 rounded-t-[2.5rem]"></div>
        
        <div className="relative z-10 -mt-16">
            <div className="relative inline-block">
                <div 
                    onClick={() => !readOnly && fileInputRef.current?.click()}
                    className={`w-28 h-28 rounded-full bg-white border-4 border-white shadow-xl mx-auto flex items-center justify-center overflow-hidden group ${!readOnly ? 'cursor-pointer' : ''}`}
                >
                    {isUploading ? (
                        <Loader2 className="animate-spin text-emerald-500" />
                    ) : student.photoUrl ? (
                        <img src={student.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${student.name}`} className="w-full h-full" />
                    )}
                    
                    {/* Overlay Camera Icon - Hanya jika bukan ReadOnly */}
                    {!readOnly && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" />
                        </div>
                    )}
                </div>
                {!readOnly && (
                    <div className="absolute bottom-1 right-1 bg-lime-400 p-2 rounded-full border-2 border-white shadow-sm pointer-events-none">
                        <Camera size={14} className="text-[#064e3b]" />
                    </div>
                )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" disabled={readOnly} />

            <h2 className="text-xl font-bold text-slate-800 mt-3">{student.name}</h2>
            <p className="text-slate-500 text-sm font-medium">Siswa Kelas MIT</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-5 bg-lime-400 rounded-full"></span>
            Data Pribadi & Fisik
        </h3>

        <div className="space-y-5">
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-2 mb-1 block">Nama Panggilan (Untuk Login)</label>
                <div className="relative">
                    <User className={`absolute left-4 top-3.5 ${readOnly ? 'text-slate-400' : 'text-emerald-500'}`} size={20} />
                    <input 
                        type="text" 
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className={inputClass}
                        disabled={readOnly}
                    />
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-2 mb-1 block">Tanggal Lahir</label>
                <div className="relative">
                    <Calendar className={`absolute left-4 top-3.5 ${readOnly ? 'text-slate-400' : 'text-emerald-500'}`} size={20} />
                    <input 
                        type="date" 
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className={inputClass}
                        disabled={readOnly}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2 mb-1 block">Berat Badan (Kg)</label>
                    <div className="relative">
                        <Weight className={`absolute left-4 top-3.5 ${readOnly ? 'text-slate-400' : 'text-emerald-500'}`} size={20} />
                        <input 
                            type="number" 
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className={inputClass}
                            placeholder="0"
                            disabled={readOnly}
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2 mb-1 block">Tinggi Badan (Cm)</label>
                    <div className="relative">
                        <Ruler className={`absolute left-4 top-3.5 ${readOnly ? 'text-slate-400' : 'text-emerald-500'}`} size={20} />
                        <input 
                            type="number" 
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className={inputClass}
                            placeholder="0"
                            disabled={readOnly}
                        />
                    </div>
                </div>
            </div>
            
            {!readOnly && (
            <>
                <hr className="border-slate-100 my-4" />
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2 mb-1 block">Ganti Password Login</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-orange-400" size={20} />
                        <input 
                            type="text" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-orange-50/50 border-none focus:ring-2 focus:ring-orange-200 text-slate-700 font-bold"
                            placeholder="Password Baru"
                        />
                    </div>
                </div>

                <button 
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-full bg-[#064e3b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95 transition-transform"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    Simpan Data Anak
                </button>
            </>
            )}
        </div>
      </div>

      {!isModal && onLogout && (
        <button 
            onClick={onLogout}
            className="w-full bg-rose-50 text-rose-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border border-rose-100 hover:bg-rose-100 active:scale-95 transition-transform"
        >
            <LogOut size={20} />
            Keluar Aplikasi
        </button>
      )}
    </div>
  );
};

export default StudentProfile;