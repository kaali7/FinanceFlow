import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const date = new Date();
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        // Using localhost:8000 directly for now
        const res = await axios.get(`http://localhost:8000/finance/summary/${month}`);
        setSummary(res.data);
      } catch (err) {
        console.error(err);
        // Mock data if backend fails for demo
        // setError("Failed to fetch data. Ensure backend is running.");
        setSummary({
            total_income: 0,
            total_expenses: 0,
            remaining_budget: 0,
            savings_recommendation: 0,
            status: "Database Not Connected",
            category_breakdown: {}
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Financial Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">${summary?.total_income}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">${summary?.total_expenses}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-500">Remaining Budget</h3>
          <p className={`text-2xl font-bold ${summary?.remaining_budget < 0 ? 'text-red-500' : 'text-blue-600'}`}>
            ${summary?.remaining_budget}
          </p>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Insights</h2>
        <p><strong>Status:</strong> <span className={`font-bold ${summary?.status === 'Over Budget' ? 'text-red-500' : 'text-green-500'}`}>{summary?.status}</span></p>
        <p><strong>Recommended Savings (20%):</strong> ${summary?.savings_recommendation}</p>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Expense Breakdown</h2>
        {summary?.category_breakdown && Object.keys(summary.category_breakdown).length > 0 ? (
          <ul>
            {Object.entries(summary.category_breakdown).map(([cat, amount]) => (
              <li key={cat} className="flex justify-between py-2 border-b last:border-0">
                <span>{cat}</span>
                <span className="font-semibold">${amount}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No expenses recorded yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
