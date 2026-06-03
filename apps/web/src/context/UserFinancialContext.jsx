/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import { api } from '../services/api';

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
    },
    assetsList: [
      { asset_category: 'Stocks', value: 55000000, return_ytd: 12.5, performance: 'Outperform', last_updated: new Date().toISOString() },
      { asset_category: 'Gold', value: 30000000, return_ytd: 8.1, performance: 'Outperform', last_updated: new Date().toISOString() },
      { asset_category: 'Bonds', value: 29000000, return_ytd: 3.2, performance: 'In Line', last_updated: new Date().toISOString() },
      { asset_category: 'Cash / Deposit', value: 24000000, return_ytd: 0.8, performance: 'Underperform', last_updated: new Date().toISOString() }
    ],
    financialTargets: [
      { id: 'emergency', name: 'Dana darurat 6 bulan', targetAmount: 0, deadline: '6 months', saved: 0, isDefault: true },
      { id: 'property', name: 'Beli properti 2028', targetAmount: 150000000, deadline: '2028', saved: 0, isDefault: true },
      { id: 'fire', name: 'Pensiun dini (FIRE)', targetAmount: 360000000, deadline: 'FIRE', saved: 0, isDefault: true }
    ]
  });

  const [userProfile, setUserProfile] = useState({
    fullName: 'Crazy Killer',
    username: 'crazykiller',
    email: 'crazykiller@email.com',
    phoneNumber: '+62 812 3456 7890',
    avatarUrl: ''
  });

  const [loadingProfile, setLoadingProfile] = useState(true);

  // Load financial profile from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('vestlytics_profile');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (!parsed.assetsList) {
          parsed.assetsList = [
            { asset_category: 'Stocks', value: 55000000, return_ytd: 12.5, performance: 'Outperform', last_updated: new Date().toISOString() },
            { asset_category: 'Gold', value: 30000000, return_ytd: 8.1, performance: 'Outperform', last_updated: new Date().toISOString() },
            { asset_category: 'Bonds', value: 29000000, return_ytd: 3.2, performance: 'In Line', last_updated: new Date().toISOString() },
            { asset_category: 'Cash / Deposit', value: 24000000, return_ytd: 0.8, performance: 'Underperform', last_updated: new Date().toISOString() }
          ];
        }
        if (!parsed.financialTargets) {
          parsed.financialTargets = [
            { id: 'emergency', name: 'Dana darurat 6 bulan', targetAmount: 0, deadline: '6 months', saved: 0, isDefault: true },
            { id: 'property', name: 'Beli properti 2028', targetAmount: 150000000, deadline: '2028', saved: 0, isDefault: true },
            { id: 'fire', name: 'Pensiun dini (FIRE)', targetAmount: 360000000, deadline: 'FIRE', saved: 0, isDefault: true }
          ];
        }
        Promise.resolve().then(() => {
          setFinancialData(parsed);
        });
      } catch (err) {
        console.error('Failed to parse financial data', err);
      }
    }
  }, []);

  // Fetch auth profile details from /auth/me or localStorage mock fallback on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.getMe();
        if (res && res.success && res.user) {
          setUserProfile({
            fullName: res.user.full_name || '',
            username: res.user.username || '',
            email: res.user.email || '',
            phoneNumber: res.user.phone_number || '',
            avatarUrl: res.user.avatar_url || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch user profile in context:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    const token = localStorage.getItem('vestlytics_token');
    if (token) {
      fetchProfile();
    } else {
      setLoadingProfile(false);
    }
  }, []);

  const updateFinancialData = (newData) => {
    const updated = { ...financialData, ...newData };
    setFinancialData(updated);
    localStorage.setItem('vestlytics_profile', JSON.stringify(updated));
  };

  const addAssetCategory = (newAsset) => {
    const updatedAssetsList = [
      ...(financialData.assetsList || []),
      {
        ...newAsset,
        last_updated: new Date().toISOString()
      }
    ];
    updateFinancialData({ assetsList: updatedAssetsList });
  };

  const updateAssetCategory = (categoryName, updatedFields) => {
    const updatedAssetsList = (financialData.assetsList || []).map((asset) => {
      if (asset.asset_category === categoryName) {
        return { ...asset, ...updatedFields, last_updated: new Date().toISOString() };
      }
      return asset;
    });
    updateFinancialData({ assetsList: updatedAssetsList });
  };

  const deleteAssetCategory = (categoryName) => {
    const updatedAssetsList = (financialData.assetsList || []).filter(
      (asset) => asset.asset_category !== categoryName
    );
    updateFinancialData({ assetsList: updatedAssetsList });
  };

  const addFinancialTarget = (newTarget) => {
    const updatedTargets = [
      ...(financialData.financialTargets || []),
      {
        id: Math.random().toString(36).substring(2, 9),
        ...newTarget
      }
    ];
    updateFinancialData({ financialTargets: updatedTargets });
  };

  const updateFinancialTarget = (targetId, updatedFields) => {
    const updatedTargets = (financialData.financialTargets || []).map((target) => {
      if (target.id === targetId) {
        return { ...target, ...updatedFields };
      }
      return target;
    });
    updateFinancialData({ financialTargets: updatedTargets });
  };

  const deleteFinancialTarget = (targetId) => {
    const updatedTargets = (financialData.financialTargets || []).filter(
      (target) => target.id !== targetId
    );
    updateFinancialData({ financialTargets: updatedTargets });
  };

  const updateUserProfile = (newProfile) => {
    setUserProfile((prev) => ({ ...prev, ...newProfile }));
  };

  return (
    <UserFinancialContext.Provider value={{
      financialData,
      updateFinancialData,
      userProfile,
      updateUserProfile,
      loadingProfile,
      addAssetCategory,
      updateAssetCategory,
      deleteAssetCategory,
      addFinancialTarget,
      updateFinancialTarget,
      deleteFinancialTarget
    }}>
      {children}
    </UserFinancialContext.Provider>
  );
};
