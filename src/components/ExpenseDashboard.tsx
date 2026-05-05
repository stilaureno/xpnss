'use client';

// @ts-nocheck
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import ExpenseForm from './ExpenseForm';

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
  categories?: Category;
}

export default function ExpenseDashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showExpenseMenu, setShowExpenseMenu] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const touchStartX = useRef(0);

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

  const handleExpenseClick = (expense: Expense) => {
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
    // Parse date string more reliably
    const datePart = e.date.split('T')[0];
    return datePart === selectedDate;
  }).sort((a, b) => Number(b.amount) - Number(a.amount));
  const dayTotal = dayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const thisMonth = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  })();
  const monthlyTotal = expenses
    .filter(e => {
      if (!e.date) return false;
      // Parse date string more reliably
      const datePart = e.date.split('T')[0];
      const expenseMonth = datePart.substring(0, 7);
      return expenseMonth === thisMonth;
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const getWeeklyData = () => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayTotal = expenses
        .filter(e => {
          if (!e.date) return false;
          // Parse date string more reliably - handle both "2026-05-05" and "2026-05-05T14:30:00" formats
          const datePart = e.date.split('T')[0]; // Get just the date part
          return datePart === dateStr;
        })
        .reduce((sum, e) => sum + Number(e.amount), 0);
      days.push({ date: dateStr, day: d.toLocaleDateString('en-US', { weekday: 'short' }), amount: dayTotal });
    }
    return days;
  };

  const getMonthlyData = () => {
    const months = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    for (let i = 0; i < 12; i++) {
      const d = new Date(currentYear, i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthTotal = expenses
        .filter(e => {
          if (!e.date) return false;
          // Parse date string more reliably - handle both "2026-05-05" and "2026-05-05T14:30:00" formats
          const datePart = e.date.split('T')[0]; // Get just the date part
          const edMonth = datePart.substring(0, 7); // Get YYYY-MM
          return edMonth === monthStr;
        })
        .reduce((sum, e) => sum + Number(e.amount), 0);
      months.push({ month: monthStr, label: d.toLocaleDateString('en-US', { month: 'short' }), amount: monthTotal });
    }
    return months;
  };

  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();
  const maxWeeklyAmount = Math.max(...weeklyData.map(d => d.amount), 1);

  const getDailyData = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayTotal = expenses
        .filter(e => {
          if (!e.date) return false;
          // Parse date string more reliably
          const datePart = e.date.split('T')[0];
          return datePart === dateStr;
        })
        .reduce((sum, e) => sum + Number(e.amount), 0);
      days.push({ date: dateStr, day: i, amount: dayTotal });
    }
    return days;
  };

  const dailyData = selectedMonth ? getDailyData(selectedMonth) : [];

  const getDayExpenses = (dateStr: string) => {
    return expenses.filter(e => {
      if (!e.date) return false;
      const ed = new Date(e.date);
      const edStr = `${ed.getFullYear()}-${String(ed.getMonth() + 1).padStart(2, '0')}-${String(ed.getDate()).padStart(2, '0')}`;
      return edStr === dateStr;
    }).sort((a, b) => Number(b.amount) - Number(a.amount));
  };

  const selectedDayExpenses = selectedDay ? getDayExpenses(selectedDay) : [];

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

      {showStats && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setShowStats(false)}
        >
          <div 
            className="bg-white w-full rounded-t-3xl p-6 pb-20 animate-slide-up" 
            style={{ animationFillMode: 'forwards' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Statistics</h2>
              <button onClick={() => setShowStats(false)} className="text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-blue-500 rounded-2xl p-4 mb-6">
              <p className="text-blue-100 text-sm">This Month</p>
              <p className="text-white text-3xl font-bold mt-1">₱{monthlyTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              <p className="text-blue-200 text-xs mt-2">
                {monthlyData.length >= 2 && monthlyData[monthlyData.length - 2].amount > 0 
                  ? ((monthlyTotal - monthlyData[monthlyData.length - 2].amount) / monthlyData[monthlyData.length - 2].amount * 100 > 0 ? '+' : '') + 
                    ((monthlyTotal - monthlyData[monthlyData.length - 2].amount) / monthlyData[monthlyData.length - 2].amount * 100).toFixed(1) + '% vs last month'
                  : 'No previous month data'}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Last 7 Days</h3>
              <div className="flex items-end justify-between gap-2 h-32">
                {weeklyData.map((d, i) => {
                  const heightPercent = maxWeeklyAmount > 0 ? (d.amount / maxWeeklyAmount) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 h-full flex flex-col items-center">
                      <span className="text-[10px] text-gray-500 leading-none mb-1">
                        ₱{d.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </span>
                      <div className="w-full flex-1 flex items-end">
                        <div 
                          className="w-full bg-blue-500 rounded-t-md transition-all duration-300" 
                          style={{ 
                            height: `${heightPercent}%`, 
                            minHeight: d.amount > 0 ? '4px' : '0px',
                            maxHeight: '100%'
                          }} 
                        />
                      </div>
                      <span className="text-xs text-gray-400 mt-2">{d.day}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-right text-sm text-gray-500 mt-2">Total: ₱{weeklyData.reduce((s, d) => s + d.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>

            <div>
              {selectedMonth ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <button onClick={() => selectedDay ? setSelectedDay(null) : setSelectedMonth(null)} className="text-blue-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h3 className="text-sm font-medium text-gray-500">
                      {selectedDay 
                        ? new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                        : new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                      }
                    </h3>
                  </div>
                  
                  {selectedDay ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedDayExpenses.map((expense, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">{expense.title}</span>
                          <span className="text-sm font-semibold text-gray-800">₱{Number(expense.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                      {selectedDayExpenses.length === 0 && (
                        <p className="text-gray-400 text-center py-4">No expenses this day</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {dailyData.filter(d => d.amount > 0).map((d, i) => (
                        <button 
                          key={i} 
                          onClick={() => setSelectedDay(d.date)}
                          className="w-full flex justify-between items-center py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-sm text-gray-600">{new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</span>
                          <span className="text-sm font-semibold text-gray-800">₱{d.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </button>
                      ))}
                      {dailyData.filter(d => d.amount > 0).length === 0 && (
                        <p className="text-gray-400 text-center py-4">No expenses this month</p>
                      )}
                    </div>
                  )}
                  
                  <p className="text-right text-sm text-gray-500 mt-4">
                    {selectedDay 
                      ? `Day Total: ₱${selectedDayExpenses.reduce((s, e) => s + Number(e.amount), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                      : `Month Total: ₱${dailyData.reduce((s, d) => s + d.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    }
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">{new Date().getFullYear()} Monthly Overview</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {monthlyData.map((d, i) => (
                      <button 
                        key={i} 
                        onClick={() => setSelectedMonth(d.month)}
                        className="bg-gray-50 rounded-lg p-3 text-left hover:bg-gray-100 transition-colors"
                      >
                        <p className="text-xs text-gray-400">{d.label}</p>
                        <p className="text-sm font-semibold text-gray-800 mt-1">₱{d.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-right text-sm text-gray-500 mt-4">Year Total: ₱{monthlyData.reduce((s, d) => s + d.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </>
              )}
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
        <button onClick={() => setShowStats(true)} className="flex flex-col items-center text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span className="text-xs mt-1">Stats</span>
        </button>
      </nav>
    </div>
  );
}
