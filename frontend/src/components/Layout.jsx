import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, LogOut, Wallet, PieChart } from 'lucide-react';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: MessageSquare, label: 'AI Chat', path: '/chat' },
    { icon: PieChart, label: 'Budget Plan', path: '/planner' },
    { icon: Wallet, label: 'Monthly Summary', path: '/summary' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-surface shadow-xl hidden md:flex flex-col z-10 rounded-r-3xl my-4 ml-4">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FinanceFlow
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-primary text-white shadow-glow'
                    : 'text-gray-500 hover:bg-primary-light hover:text-primary'
                }`
              }
            >
              <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 rounded-t-3xl border-t border-gray-50">
          <div className="flex justify-around p-4">
               {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `flex flex-col items-center p-2 rounded-xl ${isActive ? 'text-primary' : 'text-gray-400'}`}
                    >
                        <item.icon className="w-6 h-6" />
                    </NavLink>
               ))}
          </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="p-8 max-w-7xl mx-auto pb-24 md:pb-8">
            {/* Header for mobile mostly, or consistent title */}
            <div className="md:hidden flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-primary">FinanceFlow</span>
                <button onClick={handleLogout}><LogOut className="w-5 h-5 text-gray-400"/></button>
            </div>
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
