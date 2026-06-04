/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export const UserFinancialContext = createContext();

export const UserFinancialProvider = ({ children }) => {
  // Menginisialisasi state dengan nilai kosong murni agar tidak ada data tiruan yang muncul
  const [financialData, setFinancialData] = useState({
    monthlyIncome: '',
    monthlyExpenses: '',
    emergencyFund: '',
    totalDebt: '',
    monthlyDebtPayment: '',
    netWorth: '',
    isProfileCompleted: false,
    assetsList: [],
    financialTargets: [],
    healthScore: 0,
    healthStatus: 'Needs improvement',
  });

  const getInitialProfile = () => {
    const savedProfile = localStorage.getItem('vestlytics_user_me');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        return {
          fullName: parsed.full_name || '',
          username: parsed.username || '',
          email: parsed.email || '',
          phoneNumber: parsed.phone_number || '',
          avatarUrl: parsed.avatar_url || '',
        };
      } catch (e) {
        console.error('Gagal memproses data profil lokal', e);
      }
    }
    return {
      fullName: '',
      username: '',
      email: '',
      phoneNumber: '',
      avatarUrl: '',
    };
  };

  const [userProfile, setUserProfile] = useState(getInitialProfile);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Memuat data langsung dari backend sebagai Single Source of Truth agar sinkron pasca-refresh
  useEffect(() => {
    const syncDataFromBackend = async () => {
      const token = localStorage.getItem('vestlytics_token');
      if (!token) {
        setLoadingProfile(false);
        return;
      }

      try {
        const [userRes, profileRes, assetsRes, targetsRes] = await Promise.all([
          api.getMe(),
          api.getProfile(),
          api.getAssets(),
          api.getTargets(),
        ]);

        // Sinkronisasi profil otentikasi
        if (userRes && userRes.success && userRes.user) {
          setUserProfile((prev) => ({
            ...prev,
            fullName: userRes.user.full_name || prev.fullName,
            username: userRes.user.username || prev.username,
            email: userRes.user.email || prev.email,
            phoneNumber: userRes.user.phone_number || prev.phoneNumber,
            avatarUrl: userRes.user.avatar_url || prev.avatarUrl,
          }));
        }

        // Sinkronisasi data keuangan utama dan mencegah penguncian Onboarding
        setFinancialData((prev) => {
          let updated = { ...prev };

          if (profileRes && profileRes.success && profileRes.profile_data) {
            const p = profileRes.profile_data;
            const m = profileRes.metrics || {};
            const isCompleted = p.monthly_income > 0 && p.monthly_expenses > 0;
            updated = {
              ...updated,
              monthlyIncome: p.monthly_income || '',
              monthlyExpenses: p.monthly_expenses || '',
              emergencyFund: p.emergency_fund || '',
              totalDebt: p.total_debt || '',
              monthlyDebtPayment: p.monthly_debt_payment || '',
              isProfileCompleted: isCompleted,
              healthScore: m.health_score || 0,
              healthStatus: m.health_status || 'Needs improvement',
            };
          }

          if (assetsRes && assetsRes.success) {
            updated.assetsList = assetsRes.assets || [];
          }

          if (targetsRes && targetsRes.success) {
            updated.financialTargets = targetsRes.targets || [];
          }

          localStorage.setItem('vestlytics_profile', JSON.stringify(updated));
          return updated;
        });
      } catch (err) {
        console.error('Gagal menyinkronkan data dari server:', err);
        // Fallback ke localStorage jika terjadi masalah jaringan
        const savedData = localStorage.getItem('vestlytics_profile');
        if (savedData) {
          try {
            setFinancialData(JSON.parse(savedData));
          } catch (e) {
            console.error('Gagal parsing local profile', e);
          }
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    syncDataFromBackend();
  }, []);

  // Memperbarui data finansial dengan menggunakan prevState untuk mencegah Race Condition (Stale Data)
  const updateFinancialData = (newData) => {
    setFinancialData((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('vestlytics_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const addAssetCategory = (newAsset) => {
    setFinancialData((prev) => {
      const updatedAssetsList = [
        ...(prev.assetsList || []),
        { ...newAsset, last_updated: new Date().toISOString() },
      ];
      const updated = { ...prev, assetsList: updatedAssetsList };
      localStorage.setItem('vestlytics_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const updateAssetCategory = (categoryName, updatedFields) => {
    setFinancialData((prev) => {
      const updatedAssetsList = (prev.assetsList || []).map((asset) =>
        asset.asset_category === categoryName
          ? {
              ...asset,
              ...updatedFields,
              last_updated: new Date().toISOString(),
            }
          : asset,
      );
      const updated = { ...prev, assetsList: updatedAssetsList };
      localStorage.setItem('vestlytics_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteAssetCategory = (categoryName) => {
    setFinancialData((prev) => {
      const updatedAssetsList = (prev.assetsList || []).filter(
        (asset) => asset.asset_category !== categoryName,
      );
      const updated = { ...prev, assetsList: updatedAssetsList };
      localStorage.setItem('vestlytics_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const addFinancialTarget = (newTarget) => {
    setFinancialData((prev) => {
      const updatedTargets = [
        ...(prev.financialTargets || []),
        { id: Math.random().toString(36).substring(2, 9), ...newTarget },
      ];
      const updated = { ...prev, financialTargets: updatedTargets };
      localStorage.setItem('vestlytics_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const updateFinancialTarget = (targetId, updatedFields) => {
    setFinancialData((prev) => {
      const updatedTargets = (prev.financialTargets || []).map((target) =>
        target.id === targetId ? { ...target, ...updatedFields } : target,
      );
      const updated = { ...prev, financialTargets: updatedTargets };
      localStorage.setItem('vestlytics_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteFinancialTarget = (targetId) => {
    setFinancialData((prev) => {
      const updatedTargets = (prev.financialTargets || []).filter(
        (target) => target.id !== targetId,
      );
      const updated = { ...prev, financialTargets: updatedTargets };
      localStorage.setItem('vestlytics_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const updateUserProfile = (newProfile) => {
    setUserProfile((prev) => {
      const updated = { ...prev, ...newProfile };
      try {
        const localStr = localStorage.getItem('vestlytics_user_me');
        const localProfile = localStr ? JSON.parse(localStr) : {};
        Object.assign(localProfile, {
          full_name: updated.fullName,
          username: updated.username,
          email: updated.email,
          phone_number: updated.phoneNumber,
          avatar_url: updated.avatarUrl,
        });
        localStorage.setItem(
          'vestlytics_user_me',
          JSON.stringify(localProfile),
        );
      } catch (e) {
        console.error('Gagal menyinkronkan profil ke penyimpanan lokal', e);
      }
      return updated;
    });
  };

  return (
    <UserFinancialContext.Provider
      value={{
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
        deleteFinancialTarget,
      }}
    >
      {children}
    </UserFinancialContext.Provider>
  );
};
