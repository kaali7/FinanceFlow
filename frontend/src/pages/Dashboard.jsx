import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  TrendingUp, TrendingDown, Wallet, Plus, Sparkles, 
  MoreVertical, Trash2, Edit2, DollarSign, X
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' or 'income'
  
  // Form State
  const [formData, setFormData] = useState({ 
    amount: '', 
    category: '', 
    description: '', 
    source: '', 
    entry_date: new Date().toISOString().split('T')[0] 
  });
  const [editingItem, setEditingItem] = useState(null);

  const loadSummary = async () => {
    try {
      const month = new Date().toISOString().slice(0, 7);
      const res = await api.get(`/finance/summary/${month}`);
      setSummary(res.data);
    } catch (error) {
      console.error("Failed to load summary", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ 
      amount: '', 
      category: '', 
      description: '', 
      source: '', 
      entry_date: new Date().toISOString().split('T')[0] 
    });
    setEditingItem(null);
  };

  const openAddModal = (type) => {
    resetForm();
    if (type === 'expense') setIsExpenseModalOpen(true);
    else setIsIncomeModalOpen(true);
  };

  const openEditModal = (item, type) => {
    setEditingItem(item);
    setFormData({
      amount: item.amount,
      category: item.category || '',
      description: item.description || '',
      source: item.source || '',
      entry_date: item.entry_date
    });
    if (type === 'expense') setIsExpenseModalOpen(true);
    else setIsIncomeModalOpen(true);
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    try {
      const payload = { ...formData, amount: parseFloat(formData.amount) };
      
      if (type === 'expense') {
        if (editingItem) {
          await api.put(`/finance/expenses/${editingItem.id}`, payload);
        } else {
          await api.post('/finance/expenses', payload);
        }
        setIsExpenseModalOpen(false);
      } else {
        if (editingItem) {
          await api.put(`/finance/income/${editingItem.id}`, payload);
        } else {
          await api.post('/finance/income', payload);
        }
        setIsIncomeModalOpen(false);
      }
      resetForm();
      loadSummary();
    } catch (error) {
      console.error(error);
      alert("Operation failed");
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      if (type === 'expense') await api.delete(`/finance/expenses/${id}`);
      else await api.delete(`/finance/income/${id}`);
      loadSummary();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Financial Overview</h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Here's your financial health report.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => openAddModal('income')}
            className="btn-secondary text-emerald-600 border-emerald-200 hover:border-emerald-500 hover:text-emerald-700"
          >
            <Plus className="w-5 h-5" />
            Add Income
          </button>
          <button 
            onClick={() => openAddModal('expense')}
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-base bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-indigo-100 text-sm font-medium">Total Balance</span>
          </div>
          <div className="text-3xl font-bold mb-1">
            ${(summary?.total_income - summary?.total_expenses).toFixed(2)}
          </div>
          <div className="text-indigo-100 text-sm opacity-80">
            Available to spend
          </div>
        </div>

        <div className="card-base group hover:border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-gray-400 text-sm">Income</span>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
             ${summary?.total_income.toFixed(2)}
          </div>
          <div className="text-emerald-500 text-sm font-medium flex items-center gap-1">
            +12% <span className="text-gray-400 font-normal">vs last month</span>
          </div>
        </div>

        <div className="card-base group hover:border-red-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingDown className="w-6 h-6" />
            </div>
            <span className="text-gray-400 text-sm">Expenses</span>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
             ${summary?.total_expenses.toFixed(2)}
          </div>
          <div className="text-gray-500 text-sm">
             Target: <span className="text-gray-800 font-medium">${(summary?.remaining_budget + summary?.total_expenses).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions & Income List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-base">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
              <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                 <button 
                   onClick={() => setActiveTab('expenses')}
                   className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'expenses' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                   Expenses
                 </button>
                 <button 
                   onClick={() => setActiveTab('income')}
                   className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'income' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                   Income
                 </button>
              </div>
            </div>

            <div className="space-y-4">
              {activeTab === 'expenses' ? (
                 summary?.recent_transactions?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100 group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                        <TrendingDown className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{item.description || 'Expense'}</p>
                        <p className="text-xs text-gray-500">{item.category} • {item.entry_date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="font-bold text-gray-800">-${item.amount.toFixed(2)}</span>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(item, 'expense')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                             <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item.id, 'expense')} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  </div>
                 ))
              ) : (
                 summary?.income_sources?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100 group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{item.source || 'Income'}</p>
                        <p className="text-xs text-gray-500">Income • {item.entry_date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="font-bold text-emerald-600">+${item.amount.toFixed(2)}</span>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(item, 'income')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                             <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item.id, 'income')} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  </div>
                 ))
              )}
              
              {((activeTab === 'expenses' && (!summary?.recent_transactions || summary.recent_transactions.length === 0)) || 
                (activeTab === 'income' && (!summary?.income_sources || summary.income_sources.length === 0))) && (
                <div className="text-center py-10 text-gray-400">
                  No records found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* AI Insights & Breakdown */}
          <div className="card-base bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              AI Insights
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              {summary?.insights || "Unlock personalized insights by adding more expense data."}
            </p>
            
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Top Spending</h4>
              {summary?.overspending_categories?.map((cat, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{cat}</span>
                  <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{width: `${100 - (i*20)}%`}}></div>
                  </div>
                </div>
              ))}
               {!summary?.overspending_categories?.length && (
                <p className="text-xs text-gray-500">No data available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
      <Modal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)} 
        title={editingItem ? "Edit Expense" : "Add New Expense"}
      >
        <form onSubmit={(e) => handleSubmit(e, 'expense')} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
            <input name="description" placeholder="e.g. Grocery Shopping" className="input-field" value={formData.description} onChange={handleInputChange} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="text-sm font-medium text-gray-700 mb-1 block">Amount</label>
               <div className="relative">
                 <span className="absolute left-3 top-3.5 text-gray-400">$</span>
                 <input type="number" step="0.01" name="amount" placeholder="0.00" className="input-field pl-8" value={formData.amount} onChange={handleInputChange} required />
               </div>
            </div>
            <div>
               <label className="text-sm font-medium text-gray-700 mb-1 block">Date</label>
               <input type="date" name="entry_date" className="input-field" value={formData.entry_date} onChange={handleInputChange} required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
            <select name="category" className="input-field" value={formData.category} onChange={handleInputChange}>
              <option value="">Select Category</option>
              <option value="Food">Food & Dining</option>
              <option value="Transport">Transportation</option>
              <option value="Utilities">Utilities & Bills</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Housing">Housing</option>
              <option value="Health">Health & Wellness</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full py-3 mt-4">
            {editingItem ? 'Update Expense' : 'Add Expense'}
          </button>
        </form>
      </Modal>

      {/* Add/Edit Income Modal */}
      <Modal 
        isOpen={isIncomeModalOpen} 
        onClose={() => setIsIncomeModalOpen(false)} 
        title={editingItem ? "Edit Income" : "Add New Income"}
      >
        <form onSubmit={(e) => handleSubmit(e, 'income')} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Source</label>
            <input name="source" placeholder="e.g. Salary, Freelance" className="input-field" value={formData.source} onChange={handleInputChange} required />
          </div>
           <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="text-sm font-medium text-gray-700 mb-1 block">Amount</label>
               <div className="relative">
                 <span className="absolute left-3 top-3.5 text-gray-400">$</span>
                 <input type="number" step="0.01" name="amount" placeholder="0.00" className="input-field pl-8" value={formData.amount} onChange={handleInputChange} required />
               </div>
            </div>
            <div>
               <label className="text-sm font-medium text-gray-700 mb-1 block">Date</label>
               <input type="date" name="entry_date" className="input-field" value={formData.entry_date} onChange={handleInputChange} required />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-3 mt-4">
            {editingItem ? 'Update Income' : 'Add Income'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
