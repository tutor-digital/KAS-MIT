import React, { useState, useRef } from 'react';
import { Transaction } from '../types';
import * as api from '../services/api';
import { Save, Upload, Image as ImageIcon, MinusCircle, FileText, Calendar, Loader2 } from 'lucide-react';

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
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-3xl">
             <Loader2 className="animate-spin text-rose-500" size={48} />
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
              w-full h-40 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all
              ${previewUrl ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}
            `}
          >
            {previewUrl ? (
              <div className="relative group">
                 <img src={previewUrl} alt="Preview" className="h-32 rounded-xl object-cover shadow-md" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center text-white transition-opacity">
                    <span className="text-xs font-bold">Ubah Foto</span>
                 </div>
              </div>
            ) : (
              <>
                <Upload className="text-slate-400 mb-2" size={32} />
                <p className="text-sm font-medium text-slate-500">Ketuk untuk upload foto struk</p>
                <p className="text-[10px] text-slate-400 mt-1">Format JPG, PNG (Max 5MB)</p>
              </>
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