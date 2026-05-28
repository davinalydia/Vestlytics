import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Basic redirect for now
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Dashboard</h1>
        <p className="text-slate-600 mb-8">Welcome back! You have successfully logged in.</p>
        <button
          onClick={handleLogout}
          className="bg-slate-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
