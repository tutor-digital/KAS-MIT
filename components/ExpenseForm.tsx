import React, { useState, useRef } from 'react';
import { Transaction } from '../types';
import * as api from '../services/api';
import { Save, Upload, Image as ImageIcon, MinusCircle, FileText, Calendar, Loader2, X } from 'lucide-react';

interface Props {
  onSuccess: (t: Transaction) => void;
}

const ExpenseForm: React.FC<Props> = ({ onSuccess }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAttachmentFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) return;
    setIsLoading(true);

    try {
      let attachmentUrl = '';
      if (attachmentFile) {
        const url = await api.uploadAttachment(attachmentFile);
        if (url) attachmentUrl = url;
      }

      const newTransaction: Transaction = {
        id: api.generateUUID(),
        type: 'EXPENSE',
        amount: parseInt(amount),
        date,
        description,
        attachment: attachmentUrl || undefined
      };

      await api.addTransactions([newTransaction]);
      onSuccess(newTransaction);
      alert('Pengeluaran berhasil dicatat!');
      
      // Reset form
      setDescription('');
      setAmount('');
      setAttachmentFile(null);
      setPreviewUrl(null);
    } catch (error) {
      alert("Gagal menyimpan data pengeluaran.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in slide-in-from-right-10 duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-rose-50 text-rose-500 rounded-3xl mb-4">
          <MinusCircle size={48} />
        </div>
        <h1 className="text-2xl font-kids font-bold text-slate-800">Catat Pengeluaran</h1>
        <p className="text-slate-500">Gunakan uang kas dengan bijak dan jangan lupa lampirkan struk!</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-3xl backdrop-blur-[1px]">
             <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-rose-500" size={48} />
                <p className="text-sm font-bold text-rose-500 animate-pulse">Menyimpan data...</p>
             </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <FileText size={16} className="text-rose-500" />
            Keperluan / Deskripsi
          </label>
          <input 
            type="text" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all"
            placeholder="Contoh: Beli Penghapus & Kapur tulis"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Jumlah (Rp)</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-rose-600 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all font-bold"
              placeholder="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Calendar size={16} className="text-rose-500" />
              Tanggal
            </label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <ImageIcon size={16} className="text-rose-500" />
            Upload Bukti / Nota
          </label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`
              w-full relative border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden
              ${previewUrl ? 'h-auto min-h-[200px] border-emerald-500 bg-emerald-50/10' : 'h-48 border-slate-200 bg-slate-50 hover:bg-slate-100'}
            `}
          >
            {previewUrl ? (
              <div className="w-full p-2 relative group">
                 <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-auto max-h-[400px] rounded-2xl object-contain mx-auto shadow-sm" 
                 />
                 <button 
                    onClick={clearFile}
                    className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                    type="button"
                    title="Hapus foto"
                 >
                    <X size={16} />
                 </button>
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Ketuk untuk ganti foto
                 </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-slate-300">
                   <Upload size={32} />
                </div>
                <p className="text-sm font-bold text-slate-600">Ketuk untuk upload foto struk</p>
                <p className="text-[10px] text-slate-400 mt-1">Format JPG, PNG (Max 5MB)</p>
              </div>
            )}
          </div>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-rose-100 mt-6 active:scale-95 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
          Catat Pengeluaran
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;