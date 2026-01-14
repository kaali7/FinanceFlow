import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Login from './pages/Login';
import BudgetPlanner from './pages/BudgetPlanner';
import MonthlySummary from './pages/MonthlySummary';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes wrapped in Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/chat" element={
          <ProtectedRoute>
            <Layout>
              <Chat />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/planner" element={
          <ProtectedRoute>
            <Layout>
              <BudgetPlanner />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Summary is arguably part of dashboard now, but keeping route if needed, or redirecting */}
        <Route path="/summary" element={
          <ProtectedRoute>
            <Layout>
              <MonthlySummary />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
