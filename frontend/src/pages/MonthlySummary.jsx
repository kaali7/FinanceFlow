import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Calendar, RefreshCcw } from 'lucide-react';

const MonthlySummary = () => {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [months, setMonths] = useState(6);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setStatus('Loading...');
    try {
      const res = await api.get(`/finance/history?months=${months}`);
      setRows(res.data);
      setStatus('');
    } catch {
      setStatus('Error loading history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [months]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            History & Trends
          </h2>
          <p className="text-gray-500">Track your financial progress over time</p>
        </div>
       
        <div className="flex items-center gap-4 bg-white p-2 md:p-1 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 px-3">
             <Calendar className="w-4 h-4 text-gray-400" />
             <span className="text-sm text-gray-500">Last</span>
             <select 
                className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer" 
                value={months} 
                onChange={(e) => setMonths(e.target.value)}
             >
                <option value={3}>3 Months</option>
                <option value={6}>6 Months</option>
                <option value={12}>12 Months</option>
             </select>
          </div>
          <button onClick={load} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-primary">
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="card-base overflow-hidden p-0 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-5 font-semibold text-gray-600 text-sm tracking-wider uppercase">Month</th>
                <th className="p-5 font-semibold text-gray-600 text-sm tracking-wider uppercase">Income</th>
                <th className="p-5 font-semibold text-gray-600 text-sm tracking-wider uppercase">Expenses</th>
                <th className="p-5 font-semibold text-gray-600 text-sm tracking-wider uppercase">Budget</th>
                <th className="p-5 font-semibold text-gray-600 text-sm tracking-wider uppercase">Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((r) => {
                 const savings = r.income - r.expenses;
                 return (
                  <tr key={r.month} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="p-5 font-bold text-gray-800">{r.month}</td>
                    <td className="p-5 text-emerald-600 font-medium">+${r.income.toFixed(2)}</td>
                    <td className="p-5 text-red-500 font-medium">-${r.expenses.toFixed(2)}</td>
                    <td className="p-5 text-gray-600">${r.budget.toFixed(2)}</td>
                    <td className={`p-5 font-bold ${savings >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {savings >= 0 ? '+' : ''}${savings.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && !loading && (
                <tr>
                  <td className="p-8 text-center text-gray-400" colSpan={5}>
                      No history found. Start adding expenses!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {status && <div className="text-center text-gray-400 text-sm">{status}</div>}
    </div>
  );
};

export default MonthlySummary;
