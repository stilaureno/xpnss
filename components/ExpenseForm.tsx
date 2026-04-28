'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ExpenseForm({ categories, onSuccess }: { categories: any[], onSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !categoryId) return;
    
    setLoading(true);
    const supabase = createClient();
    
    const { error } = await supabase.from('expenses').insert({
      title,
      amount: parseFloat(amount),
      category_id: categoryId,
      date: new Date(date).toISOString(),
      state: 'active',
    });
    
    setLoading(false);
    if (!error) {
      setTitle('');
      setAmount('');
      setCategoryId('');
      onSuccess();
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
        className="w-full p-3 border border-gray-200 rounded-lg text-sm"
        required
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
        {loading ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  );
}