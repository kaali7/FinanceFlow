import React, { useState } from 'react';
import api from '../services/api';
import { Target, Save, Zap } from 'lucide-react';

const BudgetPlanner = () => {
  const [formData, setFormData] = useState({
    month: '2026-01',
    monthly_income: 25000,
    savings_rate: 0.2
  });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    try {
      // First save profile (assuming backend needs it for auto-calc or just standard flow)
      await api.put('/auth/profile', { 
        monthly_income: formData.monthly_income,
        savings_rate: formData.savings_rate
      });
      
      const res = await api.post('/finance/budget_plan', { month: formData.month });
      setPlan(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
      try {
        await api.put('/auth/profile', { 
            monthly_income: formData.monthly_income,
            savings_rate: formData.savings_rate
        });
        alert("Profile saved!");
      } catch (err) {
          console.error(err);
      }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="card-base">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Smart Budget Planner</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Month</label>
            <input
              type="month"
              className="input-field"
              value={formData.month}
              onChange={e => setFormData({...formData, month: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income ($)</label>
            <input
              type="number"
              className="input-field"
              value={formData.monthly_income}
              onChange={e => setFormData({...formData, monthly_income: parseFloat(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Savings Rate (0-1)</label>
            <input
              type="number"
              step="0.05"
              max="1"
              min="0"
              className="input-field"
              value={formData.savings_rate}
              onChange={e => setFormData({...formData, savings_rate: parseFloat(e.target.value)})}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button onClick={saveProfile} className="btn-primary bg-gray-800 hover:bg-gray-900 shadow-none">
            <Save className="w-4 h-4" />
            Save Profile
          </button>
          <button onClick={generatePlan} disabled={loading} className="btn-primary">
            <Zap className="w-4 h-4" />
            {loading ? 'Generating...' : 'Generate Plan'}
          </button>
        </div>
      </div>

      {plan && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="card-base bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
            <h3 className="text-xl font-bold mb-4 text-indigo-900">Recommended Allocation</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                <span className="text-gray-600">Needs (50%)</span>
                <span className="font-bold text-gray-900">${plan.needs.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                <span className="text-gray-600">Wants (30%)</span>
                <span className="font-bold text-gray-900">${plan.wants.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
                <span className="text-indigo-600 font-medium">Savings (20%)</span>
                <span className="font-bold text-indigo-600">${plan.savings.toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t border-indigo-100 flex justify-between items-center">
                <span className="font-bold text-gray-800">Total Budget</span>
                <span className="font-bold text-2xl text-primary">${plan.total_budget.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="card-base bg-white border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500 fill-current" />
              AI Insights
            </h3>
            <div className="prose prose-sm text-gray-600 bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100">
              {plan.explanation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPlanner;
