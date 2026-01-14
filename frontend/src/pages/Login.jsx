import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    
    try {
      if (mode === 'signup') {
        await api.post('/auth/signup', formData);
        setStatus('Account created! Please log in.');
        setMode('login');
        setFormData({ username: '', password: '' });
      } else {
        const res = await api.post('/auth/login', formData);
        localStorage.setItem('token', res.data.access_token);
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setStatus(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 font-sans">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/50">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary p-4 rounded-2xl shadow-glow mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-500 mt-2 text-center">
            {mode === 'login' 
              ? 'Enter your credentials to access your finance dashboard' 
              : 'Start your journey to financial freedom today'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <input
              name="username"
              className="input-field"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              className="input-field"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          {status && (
            <div className={`text-sm p-3 rounded-xl ${status.includes('created') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {status}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-3 text-lg"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                {mode === 'login' ? 'Login' : 'Sign Up'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setStatus('');
            }}
            className="text-primary font-medium hover:text-primary-hover transition-colors"
          >
            {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
