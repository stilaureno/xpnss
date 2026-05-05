'use client';

// @ts-nocheck
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category_id: string | null;
}

interface ExpenseFormProps {
  categories: Category[];
  onSuccess: (action: 'add' | 'update') => void;
  defaultDate?: string;
  editExpense?: Expense | null;
}

export default function ExpenseForm({ categories, onSuccess, defaultDate, editExpense }: ExpenseFormProps) {
  const [title, setTitle] = useState(editExpense?.title || '');
  const [amount, setAmount] = useState(editExpense?.amount?.toString() || '');
  const [categoryId, setCategoryId] = useState(editExpense?.category_id || '');
  const [date, setDate] = useState(editExpense?.date?.split('T')[0] || defaultDate || (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  })());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    
    setLoading(true);
    
    if (editExpense) {
      const { error } = await supabase.from('expenses').update({
        title: title.trim(),
        amount: parseFloat(amount),
        category_id: categoryId || null,
      }).eq('id', editExpense.id);
      
      setLoading(false);
      if (error) {
        alert('Error: ' + error.message);
        return;
      }
      onSuccess('update');
    } else {
      const insertData: Record<string, unknown> = {
        id: crypto.randomUUID(),
        title: title.trim(),
        amount: parseFloat(amount),
        date: date + 'T00:00:00',
        state: 'active',
        created_by: '13efc018-1040-4382-8729-1109b30da23b',
      };
      if (categoryId) {
        insertData.category_id = categoryId;
      }
      
      const { error } = await supabase.from('expenses').insert(insertData);
      
      setLoading(false);
      if (error) {
        alert('Error: ' + (error.message || JSON.stringify(error)));
        return;
      }
      setTitle('');
      setAmount('');
      setCategoryId('');
      onSuccess('add');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 space-y-4">
      <input
        type="text"
        placeholder="Expense title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 border border-gray-200 rounded-lg text-sm"
        required
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 border border-gray-200 rounded-lg text-sm"
        step="0.01"
        required
      />
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="w-full p-3 border border-gray-200 rounded-lg text-sm hidden"
      >
        <option value="">Select category</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full p-3 border border-gray-200 rounded-lg text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white p-3 rounded-lg font-medium text-sm disabled:opacity-50"
      >
        {loading ? (editExpense ? 'Updating...' : 'Adding...') : (editExpense ? 'Update Expense' : 'Add Expense')}
      </button>
    </form>
  );
}
