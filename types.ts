
export interface Student {
  id: string;
  name: string;
  gender: 'L' | 'P'; // L = Laki-laki, P = Perempuan
  absentNumber: number;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  description: string;
  studentId?: string; // Only for INCOME
  month?: string; // Only for INCOME (e.g., "Januari")
  year?: number; // Only for INCOME
  attachment?: string; // Base64 or URL for proof (Only for EXPENSE)
}

export type UserRole = 'ADMIN' | 'PARENT';

export type ViewType = 'DASHBOARD' | 'STUDENTS' | 'INCOME' | 'EXPENSE' | 'REPORTS' | 'CHECKLIST';

export const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export const CURRENT_YEAR = new Date().getFullYear();
