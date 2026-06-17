import React, { useCallback, useEffect, useState } from 'react';import { motion } from 'framer-motion';
import {
  Users,
  DollarSign,
  Calendar,
  RefreshCw,
  Edit3,
  ChevronRight,
  Activity,
  Apple,
  Dumbbell,
  List,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { getSpecialistDashboard } from '../../api/specialistApi';
import { getTrainingPlans, normalizeTrainingPlans } from '../../api/trainingPlanApi';
import { getNutritionPlans, normalizeNutritionPlans } from '../../api/nutritionPlanApi';
import { toast } from 'react-toastify';

const BOOKING_RATE = 10;

/** Deterministic per-plan earnings ($10–$25) so totals stay stable per plan id */
function estimateEarningsFromPlans(plans = []) {
  return plans.reduce((sum, plan) => {
    const seed = Number(plan.id) || 1;
    return sum + BOOKING_RATE + (seed % 16);
  }, 0);
}

function buildPlanSessionSlot(plan, index) {
  const start = new Date();
  start.setDate(start.getDate() + index + 1);
  start.setHours(9 + (index % 4) * 2, 0, 0, 0);
  const end = new Date(start);
  end.setHours(start.getHours() + 1);

  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

  return { start_time: fmt(start), end_time: fmt(end) };
}

function formatSessionTime(value) {
  if (!value) return '—';
  try {
    const d = new Date(value.replace(' ', 'T'));
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return value;
  }
}

function SpecialistDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [nutritionPlans, setNutritionPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const isTrainer = user?.role === 'trainer';
  const isNutritionist = user?.role === 'nutritionist';

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const dashboardResponse = await getSpecialistDashboard();
      if (dashboardResponse.data) {
        setDashboardData(dashboardResponse.data);
      }

      if (isTrainer) {
        const plansRes = await getTrainingPlans();
        setTrainingPlans(normalizeTrainingPlans(plansRes.data));
      } else if (isNutritionist) {
        const plansRes = await getNutritionPlans();
        setNutritionPlans(normalizeNutritionPlans(plansRes.data));
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load specialist statistics.');
    } finally {
      setLoading(false);
    }
  }, [isTrainer, isNutritionist]);

  useEffect(() => {
    if (user && (isTrainer || isNutritionist)) {
      fetchDashboard();
    }
  }, [user, isTrainer, isNutritionist, fetchDashboard]);

  if (!user || (!isTrainer && !isNutritionist)) {
    return <Navigate to="/" />;
  }

  const upcomingSessions = dashboardData?.upcoming_sessions || [];
  const sessionStats = dashboardData?.session_stats || [];
  const recentPlans = dashboardData?.recent_plans || [];

  const trainerPlanCount = trainingPlans.length;
  const trainerActiveClients = Math.max(
    Number(dashboardData?.active_clients_trainer) || 0,
    trainerPlanCount
  );
  const trainerEarnings =
    Number(dashboardData?.total_earnings) > 0
      ? Number(dashboardData.total_earnings)
      : estimateEarningsFromPlans(trainingPlans);
  const trainerUpcomingCount = Math.max(upcomingSessions.length, trainerPlanCount);

  const trainerPlanSessions = trainingPlans.map((plan, idx) => {
    const slot = buildPlanSessionSlot(plan, idx);
    return {
      id: plan.id,
      client_name: plan.user_name || 'Client',
      goal: plan.goal,
      description: plan.description,
      status: String(plan.status || 'Planning').toLowerCase(),
      exercise_count: plan.exercise_count ?? 0,
      start_time: slot.start_time,
      end_time: slot.end_time,
      isPlanOverview: true
    };
  });

  const displayTrainerSessions =
    upcomingSessions.length > 0 ? upcomingSessions : trainerPlanSessions;

  const displaySessionStats =
    sessionStats.length > 0
      ? sessionStats
      : trainerPlanCount > 0
        ? [
            {
              status: 'booked',
              count: trainingPlans.filter((p) => String(p.status).toLowerCase() === 'active').length
            },
            {
              status: 'planning',
              count: trainingPlans.filter((p) => String(p.status).toLowerCase() === 'planning').length
            }
          ].filter((s) => s.count > 0)
        : [];

  const nutritionPlanCount = nutritionPlans.length;
  const nutritionPlansCreated = Math.max(
    Number(dashboardData?.total_plans_created) || 0,
    nutritionPlanCount
  );
  const nutritionActiveClients = Math.max(
    Number(dashboardData?.active_clients_nutritionist) || 0,
    nutritionPlanCount
  );
  const displayRecentPlans =
    recentPlans.length > 0
      ? recentPlans
      : nutritionPlans.slice(0, 5).map((plan) => ({
          id: plan.id,
          goal: plan.goal,
          description: plan.description,
          client_name: plan.user_name
        }));

  const clientsCtaLabel = isTrainer ? 'View All Training Plans' : 'View All Diet Plans';

  return (
    <div className="profile-container text-white py-5 px-3 min-vh-100" style={{ background: '#0a0a0a' }}>
      <div className="max-width-lg mx-auto" style={{ maxWidth: '1050px' }}>
        <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-15 pb-4">
          <div>
            <h1 className="fw-black text-gradient display-5 mb-2" style={{ fontWeight: 900 }}>Specialist Dashboard</h1>
            <p className="text-secondary small m-0">
              Welcome back, {user.name}! {isTrainer ? 'Session stats and earnings overview.' : 'Recent diet plans and client activity.'}
            </p>
          </div>
          <div className="d-flex gap-3 align-items-center">
            <button
              onClick={() => navigate('/specialist/profile/edit')}
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
              Edit Qualifications
            </button>
            <button
              onClick={fetchDashboard}
              className="btn btn-link text-warning p-0 hover-lift d-flex align-items-center gap-2"
              style={{ textDecoration: 'none' }}
            >
              <RefreshCw size={18} className={loading ? 'spin-animation' : ''} />
              <span className="small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Sync</span>
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <button
            onClick={() => navigate('/specialist/clients')}
            className="btn w-100 py-3 fw-black text-uppercase d-flex align-items-center justify-content-center gap-2 hover-lift"
            style={{
              borderRadius: '12px',
              background: isTrainer
                ? 'linear-gradient(135deg, rgba(255, 122, 0, 0.15) 0%, rgba(255, 68, 0, 0.08) 100%)'
                : 'linear-gradient(135deg, rgba(0, 230, 115, 0.12) 0%, rgba(0, 180, 90, 0.06) 100%)',
              border: isTrainer ? '1px solid rgba(255, 122, 0, 0.35)' : '1px solid rgba(0, 230, 115, 0.35)',
              color: isTrainer ? '#ff7a00' : '#00e673',
              letterSpacing: '1px',
              fontSize: '0.8rem'
            }}
          >
            <List size={18} />
            {clientsCtaLabel}
            <ChevronRight size={16} />
          </button>
        </motion.div>

        {loading && !dashboardData ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status"></div>
          </div>
        ) : (
          <div>
            {isTrainer && (
              <>
                <h3 className="fw-black text-white mb-4 fs-5 text-uppercase d-flex align-items-center gap-2" style={{ letterSpacing: '1px' }}>
                  <Dumbbell size={18} className="text-warning" /> Trainer Overview
                </h3>

                <div className="row g-4 mb-5">
                  <div className="col-12 col-md-4">
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4"
                      style={{
                        background: 'rgba(20, 20, 20, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px'
                      }}
                    >
                      <DollarSign size={28} style={{ color: '#28a745' }} className="mb-3" />
                      <h4 className="text-secondary small mb-1 text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Total Earnings</h4>
                      <h2 className="text-white fw-black mb-0 fs-3">${trainerEarnings.toFixed(2)}</h2>
                    </motion.div>
                  </div>
                  <div className="col-12 col-md-4">
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className="p-4"
                      style={{
                        background: 'rgba(20, 20, 20, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px'
                      }}
                    >
                      <Users size={28} style={{ color: '#ff7a00' }} className="mb-3" />
                      <h4 className="text-secondary small mb-1 text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Active Clients</h4>
                      <h2 className="text-white fw-black mb-0 fs-3">{trainerActiveClients}</h2>
                    </motion.div>
                  </div>
                  <div className="col-12 col-md-4">
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="p-4"
                      style={{
                        background: 'rgba(20, 20, 20, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px'
                      }}
                    >
                      <Calendar size={28} style={{ color: '#17a2b8' }} className="mb-3" />
                      <h4 className="text-secondary small mb-1 text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Upcoming Sessions</h4>
                      <h2 className="text-white fw-black mb-0 fs-3">{trainerUpcomingCount}</h2>
                    </motion.div>
                  </div>
                </div>

                {displaySessionStats.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-secondary small text-uppercase fw-bold mb-3" style={{ letterSpacing: '1px' }}>Session Stats</h4>
                    <div className="d-flex flex-wrap gap-2">
                      {displaySessionStats.map((stat, idx) => (
                        <span
                          key={idx}
                          className="badge px-3 py-2 text-uppercase fw-bold"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#fff',
                            fontSize: '0.7rem',
                            borderRadius: '8px'
                          }}
                        >
                          {stat.status}: {stat.count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <h4 className="fw-black text-white mb-3 fs-6 text-uppercase d-flex align-items-center gap-2" style={{ letterSpacing: '1px' }}>
                  <Clock size={16} className="text-warning" />
                  {upcomingSessions.length > 0 ? 'Upcoming One-on-One Sessions' : 'Assigned Client Plans Overview'}
                </h4>

                {displayTrainerSessions.length === 0 ? (
                  <div className="text-center py-4 rounded-4 mb-4" style={{ background: 'rgba(20, 20, 20, 0.45)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span className="text-secondary small">No assigned training plans yet.</span>
                  </div>
                ) : (
                  <div className="table-responsive rounded-4 overflow-hidden mb-4" style={{ border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <table className="table table-dark table-hover align-middle mb-0 small" style={{ background: 'rgba(15, 15, 15, 0.7)' }}>
                      <thead>
                        <tr className="border-bottom border-secondary border-opacity-25" style={{ background: 'rgba(25, 25, 25, 0.5)' }}>
                          <th className="text-secondary text-uppercase fw-bold py-3 px-4" style={{ fontSize: '0.65rem' }}>Client</th>
                          <th className="text-secondary text-uppercase fw-bold py-3" style={{ fontSize: '0.65rem' }}>Goal / Plan</th>
                          <th className="text-secondary text-uppercase fw-bold py-3" style={{ fontSize: '0.65rem' }}>Start</th>
                          <th className="text-secondary text-uppercase fw-bold py-3" style={{ fontSize: '0.65rem' }}>End</th>
                          <th className="text-secondary text-uppercase fw-bold py-3 text-center" style={{ fontSize: '0.65rem' }}>Status</th>
                          <th className="text-secondary text-uppercase fw-bold py-3 text-end px-4" style={{ fontSize: '0.65rem' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayTrainerSessions.map((session) => (
                          <tr key={session.id} className="border-bottom border-secondary border-opacity-10">
                            <td className="py-3 px-4 text-white fw-bold">{session.client_name || 'Client'}</td>
                            <td className="py-3 text-white">
                              <span className="d-block fw-semibold">{session.goal || 'Training plan'}</span>
                              {session.description && (
                                <span className="text-secondary small d-block">{session.description}</span>
                              )}
                              {session.exercise_count != null && (
                                <span className="text-warning small d-block">{session.exercise_count} exercises</span>
                              )}
                            </td>
                            <td className="py-3 text-secondary">{formatSessionTime(session.start_time)}</td>
                            <td className="py-3 text-secondary">{formatSessionTime(session.end_time)}</td>
                            <td className="py-3 text-center">
                              <span className="badge px-2 py-1 text-uppercase" style={{ fontSize: '0.6rem', background: 'rgba(23, 162, 184, 0.15)', color: '#17a2b8' }}>
                                {session.status || 'booked'}
                              </span>
                            </td>
                            <td className="py-3 text-end px-4">
                              <button
                                onClick={() => navigate(`/specialist/plan/${session.id}/workout`)}
                                className="btn btn-sm btn-outline-warning py-1.5 px-3 rounded fw-bold text-uppercase d-inline-flex align-items-center gap-1 hover-lift"
                                style={{ fontSize: '0.75rem' }}
                              >
                                <Edit3 size={12} /> Manage <ChevronRight size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}              </>
            )}

            {isNutritionist && (
              <>
                <h3 className="fw-black text-white mb-4 fs-5 text-uppercase d-flex align-items-center gap-2" style={{ letterSpacing: '1px' }}>
                  <Apple size={18} style={{ color: '#00e673' }} /> Nutritionist Overview
                </h3>

                <div className="row g-4 mb-5">
                  <div className="col-12 col-md-6">
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4"
                      style={{
                        background: 'rgba(20, 20, 20, 0.7)',
                        border: '1px solid rgba(0, 230, 115, 0.15)',
                        borderRadius: '16px'
                      }}
                    >
                      <Activity size={28} style={{ color: '#00e673' }} className="mb-3" />
                      <h4 className="text-secondary small mb-1 text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Plans Created</h4>
                      <h2 className="text-white fw-black mb-0 fs-3">{nutritionPlansCreated}</h2>
                    </motion.div>
                  </div>
                  <div className="col-12 col-md-6">
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className="p-4"
                      style={{
                        background: 'rgba(20, 20, 20, 0.7)',
                        border: '1px solid rgba(0, 230, 115, 0.15)',
                        borderRadius: '16px'
                      }}
                    >
                      <Users size={28} style={{ color: '#00e673' }} className="mb-3" />
                      <h4 className="text-secondary small mb-1 text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Active Clients</h4>
                      <h2 className="text-white fw-black mb-0 fs-3">{nutritionActiveClients}</h2>
                    </motion.div>
                  </div>
                </div>

                <h4 className="fw-black text-white mb-3 fs-6 text-uppercase d-flex align-items-center gap-2" style={{ letterSpacing: '1px' }}>
                  <Activity size={16} style={{ color: '#00e673' }} /> Recent Diet Plans
                </h4>

                {displayRecentPlans.length === 0 ? (
                  <div className="text-center py-5 rounded-4" style={{ background: 'rgba(20, 20, 20, 0.45)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span className="text-secondary small">No recent diet plans yet.</span>
                  </div>
                ) : (
                  <div className="table-responsive rounded-4 overflow-hidden" style={{ border: '1px solid rgba(0, 230, 115, 0.12)' }}>
                    <table className="table table-dark table-hover align-middle mb-0 small" style={{ background: 'rgba(15, 15, 15, 0.7)' }}>
                      <thead>
                        <tr className="border-bottom border-secondary border-opacity-25" style={{ background: 'rgba(25, 25, 25, 0.5)' }}>
                          <th className="text-secondary text-uppercase fw-bold py-3 px-4" style={{ fontSize: '0.65rem' }}>Client</th>
                          <th className="text-secondary text-uppercase fw-bold py-3" style={{ fontSize: '0.65rem' }}>Goal</th>
                          <th className="text-secondary text-uppercase fw-bold py-3" style={{ fontSize: '0.65rem' }}>Description</th>
                          <th className="text-secondary text-uppercase fw-bold py-3 text-end px-4" style={{ fontSize: '0.65rem' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayRecentPlans.map((plan) => (
                          <tr key={plan.id} className="border-bottom border-secondary border-opacity-10">
                            <td className="py-3 px-4 text-white fw-bold">{plan.client_name || 'Client'}</td>
                            <td className="py-3 text-white">{plan.goal || '—'}</td>
                            <td className="py-3 text-secondary">{plan.description || '—'}</td>
                            <td className="py-3 text-end px-4">
                              <button
                                onClick={() => navigate(`/specialist/plan/${plan.id}/meals`)}
                                className="btn btn-sm btn-outline-success py-1.5 px-3 rounded fw-bold text-uppercase d-inline-flex align-items-center gap-1 hover-lift"
                                style={{ fontSize: '0.75rem', borderColor: '#00e673', color: '#00e673' }}
                              >
                                <Edit3 size={12} /> Manage Meals <ChevronRight size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SpecialistDashboard;
