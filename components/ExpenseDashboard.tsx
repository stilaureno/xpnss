'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import ExpenseForm from './ExpenseForm';

export default function ExpenseDashboard() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [showExpenseMenu, setShowExpenseMenu] = useState(false);
  const touchStartX = useRef(0);
  const supabase = createClient();

  const fetchData = async () => {
    const [expRes, catRes] = await Promise.all([
      supabase.from('expenses').select('*, categories(*)').order('date', { ascending: false }),
      supabase.from('categories').select('*'),
    ]);
    setExpenses(expRes.data || []);
    setCategories(catRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const current = new Date(y, m - 1, d);
      if (diff > 0) {
        current.setDate(current.getDate() + 1);
      } else {
        current.setDate(current.getDate() - 1);
      }
      const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        setSelectedDate(`${year}-${month}-${day}`);
    }
  };

  const handleExpenseClick = (expense: any) => {
    setSelectedExpense(expense);
    setShowExpenseMenu(true);
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;
    await supabase.from('expenses').delete().eq('id', selectedExpense.id);
    setShowExpenseMenu(false);
    setSelectedExpense(null);
    fetchData();
  };

  const dayExpenses = expenses.filter(e => {
    if (!e.date) return false;
    const d = new Date(e.date);
    const expenseDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return expenseDate === selectedDate;
  });
  const dayTotal = dayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const thisMonth = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  })();
  const monthlyTotal = expenses
    .filter(e => {
      if (!e.date) return false;
      const d = new Date(e.date);
      const expenseMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return expenseMonth === thisMonth;
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const formatDate = (dateStr: string) => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
<div 
        className="min-h-screen bg-gray-50 pb-20"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
      <div className="bg-blue-500 text-white p-6 rounded-b-3xl">
        <h1 className="text-2xl font-bold">Expense Manager</h1>
        <p className="text-blue-100 text-sm mt-1">{formatDate(selectedDate)}</p>
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-xs">This Day</p>
              <p className="text-2xl font-bold text-gray-800">₱{dayTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">This Month</p>
              <p className="text-2xl font-bold text-blue-500">₱{monthlyTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        

        <div>
          <h2 className="text-lg font-semibold mb-3">
            {(() => {
              const today = new Date();
              const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              return selectedDate === todayStr ? "Today's Expenses" : 'Expenses';
            })()}
          </h2>
          <div className="space-y-2">
            {dayExpenses.map((expense) => (
              <div 
                key={expense.id} 
                className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between cursor-pointer active:bg-gray-100 transition-colors"
                onClick={() => handleExpenseClick(expense)}
              >
                <div>
                  <p className="font-medium text-gray-800">{expense.title}</p>
                  <p className="text-gray-400 text-xs">{expense.categories?.name}</p>
                </div>
                <p className="font-semibold text-gray-800">₱{Number(expense.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            ))}
            {dayExpenses.length === 0 && (
              <p className="text-gray-400 text-center py-8">No expenses for this day</p>
            )}
          </div>
        </div>

        <p className="text-gray-400 text-xs text-center mt-6">← Swipe left/right to change date →</p>
      </div>

      <button
        onClick={() => { setSelectedExpense(null); setShowFabMenu(true); }}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-blue-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-all duration-200 active:scale-95 z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {showFabMenu && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => { setShowFabMenu(false); setSelectedExpense(null); }}
        >
          <div 
            className="bg-white w-full rounded-t-3xl p-6 pb-8 animate-slide-up" 
            style={{ animationFillMode: 'forwards' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Expense</h2>
              <button onClick={() => setShowFabMenu(false)} className="text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ExpenseForm 
              categories={categories} 
              onSuccess={() => { fetchData(); setShowFabMenu(false); setSelectedExpense(null); }}
              defaultDate={selectedDate}
              editExpense={selectedExpense}
            />
          </div>
        </div>
      )}

      {showExpenseMenu && selectedExpense && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => { setShowExpenseMenu(false); setSelectedExpense(null); }}
        >
          <div 
            className="bg-white w-full rounded-t-3xl p-6 pb-8 animate-slide-up" 
            style={{ animationFillMode: 'forwards' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Expense Options</h2>
              <button onClick={() => { setShowExpenseMenu(false); setSelectedExpense(null); }} className="text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => { setShowExpenseMenu(false); setShowFabMenu(true); }}
                className="w-full bg-blue-500 text-white p-4 rounded-xl font-medium text-left flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Expense
              </button>
              <button 
                onClick={handleDeleteExpense}
                className="w-full bg-red-500 text-white p-4 rounded-xl font-medium text-left flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Expense
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around">
        <button className="flex flex-col items-center text-blue-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-xs mt-1">Home</span>
        </button>
        <div className="w-14" />
        <button className="flex flex-col items-center text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span className="text-xs mt-1">Stats</span>
        </button>
      </nav>
    </div>
  );
}