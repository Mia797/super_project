import React, { createContext, useContext, useState, useEffect } from 'react';
import { depositFunds, getWalletHistory } from '../api/walletApi';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await getWalletHistory(user);
      if (response.data) {
        setBalance(response.data.balance || 0);
        setTransactions(response.data.history || response.data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch wallet history:', error);
    } finally {
      setLoading(false);
    }
  };

  const deposit = async (amount) => {
    setLoading(true);
    try {
      const response = await depositFunds(amount, user);
      if (response.data && response.data.success) {
        toast.success(`Successfully deposited ${amount} tokens!`);
        await fetchHistory();
        return { success: true };
      }
      return { success: false, message: response.data?.message || 'Deposit failed' };
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Deposit failed';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setBalance(0);
      setTransactions([]);
    }
  }, [user]);

  return (
    <WalletContext.Provider value={{ balance, transactions, loading, deposit, fetchHistory }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
