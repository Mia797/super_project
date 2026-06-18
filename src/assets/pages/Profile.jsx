import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, LogOut, Activity, Phone, CreditCard, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [actionLoading, setActionLoading] = useState(false);

  const handleFundWallet = async () => {
    const amount = prompt("Enter amount of tokens to fund:", "50");
    if (!amount || isNaN(amount)) return;
    
    setActionLoading(true);
    try {
      const response = await axios.post('/api/wallet/fund', { amount: parseFloat(amount) });
      if (response.data.success) {
        alert(`Successfully added ${amount} tokens to your wallet!`);
        refreshUser(); // Update balance in UI
      }
    } catch (e) {
      alert(e.response?.data?.message || "Failed to fund wallet.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuySubscription = async (planId, planName) => {
    if (!confirm(`Confirm purchase of ${planName}?`)) return;
    
    setActionLoading(true);
    try {
      const response = await axios.post('/api/subscriptions/purchase', { planId });
      if (response.data.success) {
        alert(`${planName} Activated! Your journey starts now.`);
        refreshUser();
      }
    } catch (e) {
      alert(e.response?.data?.message || "Purchase failed. Check balance.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-container text-white d-flex align-items-center justify-content-center">
        <div className="text-center" style={{ zIndex: 1 }}>
          <h3 className="text-warning text-uppercase mb-3">Profile unavailable</h3>
          <p className="text-secondary mb-3">Please sign in to access your profile.</p>
          <button
            onClick={() => navigate('/login')}
            className="btn-neon-logout"
            style={{ maxWidth: 240 }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="profile-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="profile-card"
      >
        <div className="text-center mb-4">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              <User size={50} className="profile-avatar-icon" />
            </div>
          </div>
          <h2 className="profile-name">{user.name}</h2>
          <div className="mt-2 d-flex justify-content-center gap-2">
            <button 
              onClick={() => navigate('/profile/edit')} 
              className="btn btn-sm btn-outline-warning py-1.5 px-3 rounded-pill fw-bold text-uppercase" 
              style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}
            >
              Edit Profile
            </button>
          </div>
          <div className="mt-3">
            <span className="profile-badge">
              {user.role} Status
            </span>
          </div>
        </div>

        <div className="profile-details-grid">
          <motion.div 
            className="profile-detail-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="profile-detail-icon">
              <Mail size={24} />
            </div>
            <div>
              <p className="profile-detail-label">Email Address</p>
              <p className="profile-detail-value mb-0">{user.email}</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="profile-detail-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="profile-detail-icon">
              <Phone size={24} />
            </div>
            <div>
              <p className="profile-detail-label">Phone Number</p>
              <p className="profile-detail-value mb-0">{user.phone || 'Not provided'}</p>
            </div>
          </motion.div>

          <motion.div 
            className="profile-detail-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="profile-detail-icon">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="profile-detail-label">Wallet Balance</p>
              <div className="d-flex align-items-center gap-2">
                <p className="profile-detail-value mb-0">{parseFloat(user.balance || 0).toFixed(0)} Tokens</p>
                <button 
                  onClick={() => navigate('/wallet')} 
                  className="btn-fund-small"
                >
                  Manage
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="profile-detail-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="profile-detail-icon">
              <Shield size={24} />
            </div>
            <div>
              <p className="profile-detail-label">Account Role</p>
              <p className="profile-detail-value mb-0 text-uppercase">{user.role}</p>
            </div>
          </motion.div>
        </div>


        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          onClick={handleLogout}
          className="btn-neon-logout"
        >
          <LogOut size={22} className="me-3" />
          Terminate Session
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Profile;
