'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import ExpenseForm from './ExpenseForm';

export default function ExpenseDashboard() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = async () => {
    const [expRes, catRes] = await Promise.all([
      supabase.from('expenses').select('*, categories(*)').order('date', { ascending: false }).limit(20),
      supabase.from('categories').select('*'),
    ]);
    setExpenses(expRes.data || []);
    setCategories(catRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthlyTotal = expenses
    .filter(e => e.date?.startsWith(thisMonth))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-blue-500 text-white p-6 rounded-b-3xl">
        <h1 className="text-2xl font-bold">Expense Manager</h1>
        <p className="text-blue-100 text-sm mt-1">Track your spending</p>
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-xs">Total</p>
              <p className="text-2xl font-bold text-gray-800">${totalExpenses.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">This Month</p>
              <p className="text-2xl font-bold text-blue-500">${monthlyTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Add Expense</h2>
          <ExpenseForm categories={categories} onSuccess={fetchData} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Expenses</h2>
          <div className="space-y-2">
            {expenses.map((expense) => (
              <div key={expense.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: expense.categories?.color || '#3b82f6' }}>
                    {(expense.categories?.name || '?').charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{expense.title}</p>
                    <p className="text-gray-400 text-xs">{expense.categories?.name} • {expense.date?.split('T')[0]}</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-800">${Number(expense.amount).toFixed(2)}</p>
              </div>
            ))}
            {expenses.length === 0 && <p className="text-gray-400 text-center py-8">No expenses yet</p>}
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around">
        <button className="flex flex-col items-center text-blue-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-xs mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          <span className="text-xs mt-1">Add</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span className="text-xs mt-1">Stats</span>
        </button>
      </nav>
    </div>
  );
}