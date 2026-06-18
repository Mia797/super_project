import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Activity, Package, Landmark, RefreshCw, Sparkles, UserCheck, ShieldAlert, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAdminDashboard, assignTrainer, assignNutritionist } from '../../api/adminApi';
import { toast } from 'react-toastify';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigningSub, setAssigningSub] = useState(null); // stores the subscription object to assign
  const [assignType, setAssignType] = useState(''); // 'trainer' or 'nutritionist'
  const [specialists, setSpecialists] = useState([]);
  const [specLoading, setSpecLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await getAdminDashboard(user);
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin dashboard:', error);
      toast.error('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const handleOpenAssignModal = async (sub, type) => {
    setAssigningSub(sub);
    setAssignType(type);
    setSpecialists([]);
    setSpecLoading(true);

    try {
      if (type === 'trainer') {
        const res = await axios.get('/api/trainers');
        if (res.data && Array.isArray(res.data.trainers)) {
          setSpecialists(res.data.trainers);
        }
      } else {
        const res = await axios.get('/api/nutritionists');
        if (res.data && Array.isArray(res.data.nutritionists)) {
          setSpecialists(res.data.nutritionists);
        }
      }
    } catch (e) {
      console.error(`Failed to fetch ${type}s:`, e);
      toast.error(`Failed to fetch list of ${type}s.`);
    } finally {
      setSpecLoading(false);
    }
  };

  const handleSelectSpecialist = async (specId) => {
    if (!assigningSub) return;
    setSubmitLoading(true);
    try {
      let res;
      if (assignType === 'trainer') {
        res = await assignTrainer(assigningSub.id || assigningSub.subscription_id, specId);
      } else {
        res = await assignNutritionist(assigningSub.id || assigningSub.subscription_id, specId);
      }

      if (res.data && res.data.success) {
        toast.success(`Successfully assigned specialist to plan!`);
        setAssigningSub(null);
        fetchDashboardData(); // Refresh metrics and pending queues
      } else {
        toast.error(res.data?.message || 'Assignment failed.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Uplink failed during assignment.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Build metrics mapping
  const stats = [
    { title: 'Gross Revenue', value: `${parseFloat(dashboardData?.revenue || 0).toFixed(0)} Tokens`, icon: Landmark, color: 'var(--accent-primary)' },
    { title: 'Active Plans', value: dashboardData?.active_subscriptions || 0, icon: Activity, color: 'var(--accent-secondary)' },
    { title: 'Equipment Booked', value: `${dashboardData?.equipment_utilization || 0}%`, icon: Users, color: 'var(--accent-primary)' },
    { title: 'Ledger Logs', value: dashboardData?.transactions?.length || 0, icon: Package, color: 'var(--accent-secondary)' }
  ];

  return (
    <div className="profile-container text-white py-5 px-3 min-vh-100" style={{ background: '#0a0a0a' }}>
      <div className="max-width-lg mx-auto" style={{ maxWidth: '1100px' }}>
        
        {/* Header section */}
        <div className="d-flex align-items-center justify-content-between mb-5 border-bottom border-secondary border-opacity-15 pb-4">
          <div>
            <h1 className="fw-black text-gradient display-5 mb-2" style={{ fontWeight: 900 }}>Admin Command Center</h1>
            <p className="text-secondary small m-0">Monitor live revenue streams, equipment workloads, and specialist tasks.</p>
          </div>
          <div className="d-flex gap-3">
            <button 
              onClick={() => navigate('/admin/management')}
              className="btn btn-warning py-2 px-4 fw-black text-uppercase d-flex align-items-center gap-2 hover-lift"
              style={{
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ff7a00 0%, #ff4400 100%)',
                color: '#000',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.85rem'
              }}
            >
              Management Console
            </button>
            <button 
              onClick={fetchDashboardData} 
              className="btn btn-link text-warning p-0 hover-lift d-flex align-items-center gap-2"
              style={{ textDecoration: 'none' }}
            >
              <RefreshCw size={18} className={loading ? 'spin-animation' : ''} />
              <span className="small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Sync</span>
            </button>
          </div>
        </div>

        {loading && !dashboardData ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Syncing dashboard data...</span>
            </div>
          </div>
        ) : (
          <div>
            {/* Top Cards grid */}
            <div className="row g-4 mb-5">
              {stats.map((stat, index) => (
                <div key={index} className="col-12 col-md-6 col-lg-3">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 h-100"
                    style={{
                      background: 'rgba(20, 20, 20, 0.7)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <stat.icon size={28} style={{ color: stat.color }} className="mb-3" />
                    <h4 className="text-secondary small mb-1 text-uppercase fw-bold" style={{ letterSpacing: '1px', fontSize: '0.65rem' }}>{stat.title}</h4>
                    <h2 className="text-white fw-black mb-0 fs-3">{stat.value}</h2>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Assignments Queue */}
            <h3 className="fw-black text-white mb-4 fs-5 text-uppercase d-flex align-items-center gap-2" style={{ letterSpacing: '1px' }}>
              <UserCheck size={18} className="text-warning" /> Specialist Assignment Roster
            </h3>
            
            {(!dashboardData?.pending_assignments || dashboardData.pending_assignments.length === 0) ? (
              <div className="text-center py-5 rounded-4 mb-5" style={{ background: 'rgba(20, 20, 20, 0.45)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span className="text-secondary small">No pending assignments in queue. Roster clean!</span>
              </div>
            ) : (
              <div className="table-responsive rounded-4 overflow-hidden mb-5" style={{ border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <table className="table table-dark table-hover align-middle mb-0 small" style={{ background: 'rgba(15, 15, 15, 0.7)' }}>
                  <thead>
                    <tr className="border-bottom border-secondary border-opacity-25" style={{ background: 'rgba(25, 25, 25, 0.5)' }}>
                      <th className="text-secondary text-uppercase fw-bold py-3 px-4" style={{ fontSize: '0.65rem' }}>Member Details</th>
                      <th className="text-secondary text-uppercase fw-bold py-3" style={{ fontSize: '0.65rem' }}>Purchased Package</th>
                      <th className="text-secondary text-uppercase fw-bold py-3 text-center" style={{ fontSize: '0.65rem' }}>Required Specialists</th>
                      <th className="text-secondary text-uppercase fw-bold py-3 text-end px-4" style={{ fontSize: '0.65rem' }}>Link Accounts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.pending_assignments.map((sub, idx) => (
                      <tr key={sub.id || idx} className="border-bottom border-secondary border-opacity-10">
                        <td className="py-3 px-4">
                          <span className="text-white fw-bold d-block">{sub.user_name || 'Gym Member'}</span>
                          <span className="text-secondary small d-block" style={{ fontSize: '0.75rem' }}>ID: #{sub.user_id}</span>
                        </td>
                        <td className="py-3 text-white fw-semibold">{sub.plan_name}</td>
                        <td className="py-3 text-center">
                          <div className="d-flex justify-content-center gap-2">
                            {sub.has_trainer === 1 && (
                              <span className={`badge px-2 py-1 small ${sub.trainer_id ? 'bg-success text-success border-success' : 'bg-warning text-warning border-warning'} bg-opacity-10 border border-opacity-35 rounded`}>
                                Trainer: {sub.trainer_id ? 'Linked' : 'Required'}
                              </span>
                            )}
                            {sub.has_nutritionist === 1 && (
                              <span className={`badge px-2 py-1 small ${sub.nutritionist_id ? 'bg-success text-success border-success' : 'bg-info text-info border-info'} bg-opacity-10 border border-opacity-35 rounded`}>
                                Nutritionist: {sub.nutritionist_id ? 'Linked' : 'Required'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-end px-4">
                          <div className="d-flex justify-content-end gap-2">
                            {sub.has_trainer === 1 && !sub.trainer_id && (
                              <button 
                                onClick={() => handleOpenAssignModal(sub, 'trainer')}
                                className="btn btn-sm btn-outline-warning py-1.5 px-3 rounded hover-lift"
                                style={{ fontSize: '0.75rem', fontWeight: 'bold' }}
                              >
                                Link Trainer
                              </button>
                            )}
                            {sub.has_nutritionist === 1 && !sub.nutritionist_id && (
                              <button 
                                onClick={() => handleOpenAssignModal(sub, 'nutritionist')}
                                className="btn btn-sm btn-outline-info py-1.5 px-3 rounded hover-lift"
                                style={{ fontSize: '0.75rem', fontWeight: 'bold' }}
                              >
                                Link Nutrition
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Recent Transaction Log */}
            <h3 className="fw-black text-white mb-4 fs-5 text-uppercase d-flex align-items-center gap-2" style={{ letterSpacing: '1px' }}>
              <Landmark size={18} className="text-warning" /> System Audit Ledger
            </h3>

            {(!dashboardData?.transactions || dashboardData.transactions.length === 0) ? (
              <div className="text-center py-5 rounded-4" style={{ background: 'rgba(20, 20, 20, 0.45)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span className="text-secondary small">No logs in system audit ledger.</span>
              </div>
            ) : (
              <div className="table-responsive rounded-4 overflow-hidden" style={{ border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <table className="table table-dark table-hover align-middle mb-0 small" style={{ background: 'rgba(15, 15, 15, 0.7)' }}>
                  <thead>
                    <tr className="border-bottom border-secondary border-opacity-25" style={{ background: 'rgba(25, 25, 25, 0.5)' }}>
                      <th className="text-secondary text-uppercase fw-bold py-3 px-4" style={{ fontSize: '0.65rem' }}>Transaction description</th>
                      <th className="text-secondary text-uppercase fw-bold py-3 text-center" style={{ fontSize: '0.65rem' }}>Log Date</th>
                      <th className="text-secondary text-uppercase fw-bold py-3 text-center" style={{ fontSize: '0.65rem' }}>Category</th>
                      <th className="text-secondary text-uppercase fw-bold py-3 text-end px-4" style={{ fontSize: '0.65rem' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.transactions.map((tx, idx) => (
                      <tr key={tx.id || idx} className="border-bottom border-secondary border-opacity-10">
                        <td className="py-3 px-4">
                          <span className="text-white fw-bold d-block">{tx.description || (tx.type === 'debit' ? 'Program Purchase' : 'Deposit')}</span>
                          <span className="text-secondary small d-block" style={{ fontSize: '0.7rem' }}>Email: {tx.user_email || 'System user'}</span>
                        </td>
                        <td className="text-secondary text-center py-3">{new Date(tx.created_at || tx.date).toLocaleDateString()}</td>
                        <td className="text-center py-3">
                          <span
                            className="badge px-2 py-1 text-uppercase fw-bold"
                            style={{
                              borderRadius: '12px',
                              fontSize: '0.6rem',
                              background: tx.type === 'debit' || tx.type === 'purchase' ? 'rgba(220, 53, 69, 0.1)' : 'rgba(40, 167, 69, 0.1)',
                              color: tx.type === 'debit' || tx.type === 'purchase' ? '#dc3545' : '#28a745',
                              border: tx.type === 'debit' || tx.type === 'purchase' ? '1px solid rgba(220, 53, 69, 0.3)' : '1px solid rgba(40, 167, 69, 0.3)'
                            }}
                          >
                            {tx.type || 'deposit'}
                          </span>
                        </td>
                        <td className={`text-end py-3 px-4 fw-black ${tx.type === 'debit' || tx.type === 'purchase' ? 'text-danger' : 'text-success'}`}>
                          {tx.type === 'debit' || tx.type === 'purchase' ? '-' : '+'}{parseFloat(tx.amount).toFixed(0)} Tokens
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Specialist Assignment Modal */}
      <AnimatePresence>
        {assigningSub && (
          <div 
            className="modal-backdrop d-flex align-items-center justify-content-center"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 2000
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 col-11 col-md-6 col-lg-5"
              style={{
                background: 'rgba(20, 20, 20, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary border-opacity-20 pb-3">
                <h4 className="fw-black text-gradient m-0 text-uppercase fs-5">
                  Link {assignType === 'trainer' ? 'Elite Trainer' : 'Expert Nutritionist'}
                </h4>
                <button 
                  onClick={() => setAssigningSub(null)}
                  className="btn-close btn-close-white" 
                  aria-label="Close"
                ></button>
              </div>

              <p className="text-secondary small mb-4">
                Assigning specialist for <strong>{assigningSub.user_name}</strong>'s subscription plan: <em>{assigningSub.plan_name}</em>.
              </p>

              {specLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-warning" role="status"></div>
                </div>
              ) : specialists.length === 0 ? (
                <div className="text-center py-4">
                  <span className="text-secondary small">No specialists in the roster available.</span>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {specialists.map((spec) => (
                    <button
                      key={spec.id}
                      onClick={() => handleSelectSpecialist(spec.id)}
                      disabled={submitLoading}
                      className="btn text-start p-3 w-100 hover-lift d-flex justify-content-between align-items-center"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    >
                      <div>
                        <span className="fw-bold d-block text-warning">{spec.name}</span>
                        <span className="text-secondary small d-block mt-0.5" style={{ fontSize: '0.75rem' }}>{spec.email || 'direct@goldfit.com'}</span>
                      </div>
                      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded-pill px-2.5 py-1 fw-bold small" style={{ fontSize: '0.65rem' }}>
                        {spec.experience_years ? `${spec.experience_years} Yrs Exp` : 'Assign'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dashboard;
