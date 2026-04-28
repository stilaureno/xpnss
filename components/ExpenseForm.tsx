'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ExpenseForm({ categories, onSuccess, defaultDate }: { categories: any[], onSuccess: () => void, defaultDate?: string }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    
    setLoading(true);
    const supabase = createClient();
    
    const insertData: any = {
      id: crypto.randomUUID(),
      title: title.trim(),
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      state: 'active',
      created_by: '13efc018-1040-4382-8729-1109b30da23b',
    };
    if (categoryId) {
      insertData.category_id = categoryId;
    }
    
    console.log('Inserting:', insertData);
    
    const { error, data } = await supabase.from('expenses').insert(insertData).select();
    
    console.log('Result:', { error, data });
    
    setLoading(false);
    if (error) {
      console.error('Insert error details:', JSON.stringify(error));
      alert('Error: ' + (error.message || JSON.stringify(error)));
      return;
    }
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