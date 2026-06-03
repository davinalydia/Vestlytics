/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';

export const UserFinancialContext = createContext();

export const UserFinancialProvider = ({ children }) => {
  const [financialData, setFinancialData] = useState({
    monthlyIncome: '',
    monthlyExpenses: '',
    emergencyFund: '',
    totalDebt: '',
    monthlyDebtPayment: '',
    netWorth: '',
    isProfileCompleted: false,
    assets: {
      stocks: '',
      gold: '',
      bonds: '',
      cash: '',
    }
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('vestlytics_profile');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        Promise.resolve().then(() => {
          setFinancialData(parsed);
        });
      } catch (err) {
        console.error('Failed to parse financial data', err);
      }
    }
  }, []);

  const updateFinancialData = (newData) => {
    const updated = { ...financialData, ...newData };
    setFinancialData(updated);
    localStorage.setItem('vestlytics_profile', JSON.stringify(updated));
  };

  return (
    <UserFinancialContext.Provider value={{ financialData, updateFinancialData }}>
      {children}
    </UserFinancialContext.Provider>
  );
};
