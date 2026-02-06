import { supabase } from '../lib/supabaseClient';
import { Student, Transaction } from '../types';

// Utility untuk generate ID
export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// --- STUDENTS ---

export const getStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('absent_number', { ascending: true });
  
  if (error) {
    console.error('Error fetching students:', error);
    return [];
  }
  
  return data.map((s: any) => ({
    id: s.id,
    name: s.name,
    gender: s.gender,
    absentNumber: s.absent_number,
    // Mapping field baru (handle null values)
    nickname: s.nickname || '',
    password: s.password || '',
    birthDate: s.birth_date || '',
    weight: s.weight || 0,
    height: s.height || 0,
    photoUrl: s.photo_url || ''
  }));
};

export const addStudent = async (student: Student) => {
  // Pastikan field optional dikirim sebagai null jika undefined/kosong
  const { error } = await supabase.from('students').insert({
    id: student.id,
    name: student.name,
    gender: student.gender,
    absent_number: student.absentNumber,
    nickname: student.nickname || null,
    password: student.password || '123456',
    birth_date: student.birthDate || null,
    weight: student.weight || null,
    height: student.height || null,
    photo_url: student.photoUrl || null
  });
  
  if (error) {
      console.error("Error adding student:", error);
      throw error;
  }
};

export const updateStudent = async (student: Student) => {
  const { error } = await supabase.from('students').update({
    name: student.name,
    gender: student.gender,
    absent_number: student.absentNumber,
    nickname: student.nickname || null,
    password: student.password,
    birth_date: student.birthDate || null,
    weight: student.weight || null,
    height: student.height || null,
    photo_url: student.photoUrl || null
  }).eq('id', student.id);
  
  if (error) {
      console.error("Error updating student:", error);
      throw error;
  }
};

export const deleteStudent = async (id: string) => {
  const { error: transError } = await supabase.from('transactions').delete().eq('student_id', id);
  if (transError) throw transError;

  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw error;
};

// --- TRANSACTIONS ---

export const getTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data.map((t: any) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    date: t.date,
    description: t.description,
    studentId: t.student_id,
    month: t.month,
    year: t.year,
    attachment: t.attachment
  }));
};

export const addTransactions = async (transactions: Transaction[]) => {
  const dbTransactions = transactions.map(t => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    date: t.date,
    description: t.description,
    student_id: t.studentId,
    month: t.month,
    year: t.year,
    attachment: t.attachment
  }));

  const { error } = await supabase.from('transactions').insert(dbTransactions);
  if (error) throw error;
};

export const updateTransaction = async (t: Transaction) => {
  const { error } = await supabase.from('transactions').update({
    amount: t.amount,
    date: t.date,
    description: t.description,
    student_id: t.studentId,
    month: t.month,
    year: t.year,
    attachment: t.attachment
  }).eq('id', t.id);
  if (error) throw error;
};

export const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
};

// --- STORAGE ---

export const uploadAttachment = async (file: File): Promise<string | null> => {
  // Validasi nama file agar aman
  const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const fileName = `${Date.now()}-${cleanName}`;
  
  const { data, error } = await supabase.storage
    .from('attachments')
    .upload(fileName, file);

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from('attachments')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};