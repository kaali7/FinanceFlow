import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import Modal from '../components/ui/Modal';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  
  // Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: 'Food',
    description: '',
    entry_date: new Date().toISOString().split('T')[0]
  });

  const fetchSummary = async () => {
    try {
      const date = new Date();
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const res = await api.get(`/finance/summary/${month}`);
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance/expenses', expenseForm);
      setIsExpenseModalOpen(false);
      setExpenseForm({ ...expenseForm, amount: '', description: '' });
      fetchSummary(); // Refresh data
    } catch (err) {
      alert("Failed to add expense");
    }
  };

  if (loading) return <div className="p-8 flex justify-center text-primary">Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-soft">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome Back!
          </h1>
          <p className="text-gray-500 mt-1">Here's your financial overview</p>
        </div>
        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-base bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-100 rounded-xl text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-gray-600 font-medium">Income</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">${summary?.total_income?.toFixed(2)}</p>
        </div>

        <div className="card-base bg-gradient-to-br from-red-50 to-pink-50 border-red-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-100 rounded-xl text-red-600">
              <TrendingDown className="w-6 h-6" />
            </div>
            <span className="text-gray-600 font-medium">Expenses</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">${summary?.total_expenses?.toFixed(2)}</p>
        </div>

        <div className="card-base bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-gray-600 font-medium">Balance</span>
          </div>
          <p className={`text-3xl font-bold ${summary?.remaining_budget < 0 ? 'text-red-500' : 'text-gray-800'}`}>
            ${summary?.remaining_budget?.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Insights & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-base">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Spending Breakdown
          </h3>
          <div className="space-y-4">
            {summary?.category_breakdown && Object.entries(summary.category_breakdown).map(([cat, amount]) => (
              <div key={cat} className="flex items-center justify-between group p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-medium text-gray-700">{cat}</span>
                </div>
                <span className="font-bold text-gray-900">${amount.toFixed(2)}</span>
              </div>
            ))}
            {(!summary?.category_breakdown || Object.keys(summary.category_breakdown).length === 0) && (
              <p className="text-gray-400 text-center py-8">No expenses yet</p>
            )}
          </div>
        </div>

        <div className="card-base bg-primary/5 border-primary/10">
            <h3 className="text-xl font-bold mb-4 text-gray-800">AI Insights</h3>
            <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <p className={`text-lg font-bold ${summary?.status === 'Over Budget' ? 'text-red-500' : 'text-green-500'}`}>
                        {summary?.status}
                    </p>
                </div>
                 <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Recommended Savings</p>
                    <p className="text-lg font-bold text-primary">
                        ${summary?.savings_recommendation?.toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)}
        title="New Expense"
      >
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              required
              className="input-field"
              value={expenseForm.amount}
              onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="input-field"
              value={expenseForm.category}
              onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}
            >
              {['Food', 'Transport', 'Utilities', 'Entertainment', 'Housing', 'Other'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
             <input
              className="input-field"
              value={expenseForm.description}
              onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
              placeholder="What was this for?"
            />
          </div>
          <div className="pt-4">
            <button type="submit" className="btn-primary w-full">
              Save Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
