import React, { useState } from 'react';
import axios from 'axios';

const ExpenseForm = () => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const submit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Login required to save expenses.');
      return;
    }
    try {
      await axios.post('http://localhost:8000/finance/expenses', {
        amount: parseFloat(amount),
        category,
        description
      }, {
        headers: { Authorization: token }
      });
      setMessage('Expense saved.');
      setAmount('');
      setDescription('');
    } catch {
      setMessage('Error saving expense.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add Expense</h2>
      <div className="space-y-3">
        <input
          className="w-full border rounded p-2"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select
          className="w-full border rounded p-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Food</option>
          <option>Transport</option>
          <option>Utilities</option>
          <option>Entertainment</option>
          <option>Other</option>
        </select>
        <input
          className="w-full border rounded p-2"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={submit} className="bg-blue-600 text-white px-4 py-2 rounded w-full">Save</button>
        <div className="text-sm text-gray-600">{message}</div>
      </div>
    </div>
  );
};

export default ExpenseForm;
