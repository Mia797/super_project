import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowDownLeft, ArrowUpRight, Plus, RefreshCw } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { toast } from 'react-toastify';

function Wallet() {
  const { balance, transactions, loading, deposit, fetchHistory } = useWallet();
  const [depositAmount, setDepositAmount] = useState('');
  const [funding, setFunding] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!depositAmount || isNaN(depositAmount) || parseFloat(depositAmount) <= 0) {
      toast.error('Please enter a valid deposit amount.');
      return;
    }

    setFunding(true);
    const result = await deposit(parseFloat(depositAmount));
    setFunding(false);

    if (result.success) {
      setDepositAmount('');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="profile-container text-white py-5 px-3 min-vh-100" style={{ background: '#0a0a0a' }}>
      <div className="max-width-lg mx-auto" style={{ maxWidth: '900px' }}>
        
        <div className="d-flex align-items-center justify-content-between mb-5 border-bottom border-secondary border-opacity-15 pb-4">
          <div>
            <h1 className="fw-black text-gradient display-6 mb-2">My Digital Wallet</h1>
            <p className="text-secondary small m-0">Deposit funds, view balance, and track transactions history.</p>
          </div>
          <button 
            onClick={fetchHistory} 
            className="btn btn-link text-warning p-0 hover-lift d-flex align-items-center gap-2"
            style={{ textDecoration: 'none' }}
          >
            <RefreshCw size={18} className={loading ? 'spin-animation' : ''} />
            <span className="small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Refresh</span>
          </button>
        </div>

        <div className="row g-4 mb-5">
          {/* Balance card */}
          <div className="col-12 col-md-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 h-100 d-flex flex-column justify-content-between"
              style={{
                background: 'linear-gradient(135deg, #1f1208 0%, #0d0d0d 100%)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 122, 0, 0.15)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
              }}
            >
              <div>
                <span className="text-warning text-uppercase fw-bold small d-block mb-1" style={{ letterSpacing: '1.5px', fontSize: '0.65rem' }}>
                  Available Balance
                </span>
                <h2 className="display-4 fw-black text-white m-0" style={{ fontWeight: 900 }}>
                  {parseFloat(balance).toFixed(0)} 🪙 Tokens
                </h2>
              </div>
              <div className="d-flex align-items-center gap-2 text-secondary small mt-4 pt-3 border-top border-secondary border-opacity-10">
                <CreditCard size={16} className="text-warning" />
                <span>Default currency: Tokens</span>
              </div>
            </motion.div>
          </div>

          {/* Quick Deposit Card */}
          <div className="col-12 col-md-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-4"
              style={{
                background: 'rgba(20, 20, 20, 0.7)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
              }}
            >
              <span className="text-secondary text-uppercase fw-bold small d-block mb-3" style={{ letterSpacing: '1.5px', fontSize: '0.65rem' }}>
                Quick Deposit
              </span>
              <form onSubmit={handleDepositSubmit} className="d-flex flex-column gap-3">
                <div className="input-group">
                  <span className="input-group-text text-secondary bg-black bg-opacity-40 border-secondary border-opacity-25 fw-bold">$</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="form-control text-white bg-black bg-opacity-40 border-secondary border-opacity-25"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={funding}
                  className="btn btn-warning py-2 fw-black text-uppercase d-flex align-items-center justify-content-center gap-2 hover-lift"
                  style={{
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #ff7a00 0%, #ff4400 100%)',
                    border: 'none',
                    color: '#000',
                    fontWeight: 800
                  }}
                >
                  <Plus size={18} /> {funding ? 'Processing...' : 'Deposit Funds'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>

        {/* Transaction History */}
        <h3 className="fw-black text-white mb-4 fs-5 text-uppercase" style={{ letterSpacing: '1px' }}>
          Transaction Ledger
        </h3>

        {transactions.length === 0 ? (
          <div className="text-center py-5 rounded-4" style={{ background: 'rgba(20, 20, 20, 0.45)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <span className="text-secondary small">No transaction activity recorded.</span>
          </div>
        ) : (
          <div className="table-responsive rounded-4 overflow-hidden" style={{ border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <table className="table table-dark table-hover align-middle mb-0 small" style={{ background: 'rgba(15, 15, 15, 0.7)' }}>
              <thead>
                <tr className="border-bottom border-secondary border-opacity-25" style={{ background: 'rgba(25, 25, 25, 0.5)' }}>
                  <th className="text-secondary text-uppercase fw-bold py-3 px-4" style={{ fontSize: '0.65rem' }}>Transaction</th>
                  <th className="text-secondary text-uppercase fw-bold py-3 text-center" style={{ fontSize: '0.65rem' }}>Date & Time</th>
                  <th className="text-secondary text-uppercase fw-bold py-3 text-center" style={{ fontSize: '0.65rem' }}>Status</th>
                  <th className="text-secondary text-uppercase fw-bold py-3 text-end px-4" style={{ fontSize: '0.65rem' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => {
                  const isDebit = tx.type === 'debit' || tx.type === 'purchase';
                  return (
                    <tr key={tx.id || idx} className="border-bottom border-secondary border-opacity-10">
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="p-2 rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              background: isDebit ? 'rgba(220, 53, 69, 0.1)' : 'rgba(40, 167, 69, 0.1)',
                              border: isDebit ? '1px solid rgba(220, 53, 69, 0.2)' : '1px solid rgba(40, 167, 69, 0.2)'
                            }}
                          >
                            {isDebit ? <ArrowUpRight size={14} className="text-danger" /> : <ArrowDownLeft size={14} className="text-success" />}
                          </div>
                          <div>
                            <span className="text-white fw-bold d-block">{tx.description || (isDebit ? 'Package Purchase' : 'Wallet Deposit')}</span>
                            <span className="text-secondary small d-block" style={{ fontSize: '0.7rem' }}>ID: #{tx.id || idx}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-secondary text-center py-3">{formatDate(tx.created_at || tx.date)}</td>
                      <td className="text-center py-3">
                        <span
                          className="badge px-2 py-1 text-uppercase fw-bold"
                          style={{
                            borderRadius: '12px',
                            fontSize: '0.6rem',
                            background: tx.status === 'completed' || tx.status === 'success' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                            color: tx.status === 'completed' || tx.status === 'success' ? '#28a745' : '#ffc107',
                            border: tx.status === 'completed' || tx.status === 'success' ? '1px solid rgba(40, 167, 69, 0.3)' : '1px solid rgba(255, 193, 7, 0.3)'
                          }}
                        >
                          {tx.status || 'completed'}
                        </span>
                      </td>
                      <td className={`text-end py-3 px-4 fw-black ${isDebit ? 'text-danger' : 'text-success'}`} style={{ fontSize: '1rem' }}>
                        {isDebit ? '-' : '+'}{parseFloat(tx.amount).toFixed(0)} 🪙 Tokens
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

export default Wallet;
