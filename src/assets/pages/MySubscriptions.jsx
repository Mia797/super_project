import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  RefreshCw,
  Dumbbell,
  Apple,
  ExternalLink,
  User,
  Target,
  FileText,
  Hash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getTrainingPlans, normalizeTrainingPlans } from '../../api/trainingPlanApi';
import { getNutritionPlans, normalizeNutritionPlans } from '../../api/nutritionPlanApi';

function MySubscriptions() {
  const navigate = useNavigate();
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [nutritionPlans, setNutritionPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const [trainingRes, nutritionRes] = await Promise.all([
        getTrainingPlans(),
        getNutritionPlans()
      ]);

      setTrainingPlans(normalizeTrainingPlans(trainingRes.data));
      setNutritionPlans(normalizeNutritionPlans(nutritionRes.data));
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast.error(error.response?.data?.message || 'Failed to load your plans.');
      setTrainingPlans([]);
      setNutritionPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const getStatusBadge = (status) => {
    const s = status ? String(status).toLowerCase() : 'pending';
    let style = { background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)', color: '#ffc107' };

    if (s === 'active' || s === 'completed' || s === 'completed_plans' || s === 'active_plans') {
      style = { background: 'rgba(40, 167, 69, 0.1)', border: '1px solid rgba(40, 167, 69, 0.3)', color: '#28a745' };
    } else if (s === 'cancelled' || s === 'expired') {
      style = { background: 'rgba(220, 53, 69, 0.1)', border: '1px solid rgba(220, 53, 69, 0.3)', color: '#dc3545' };
    } else if (s === 'planning' || s === 'assigned' || s === 'pending assign') {
      style = { background: 'rgba(23, 162, 184, 0.1)', border: '1px solid rgba(23, 162, 184, 0.3)', color: '#17a2b8' };
    }

    return (
      <span className="badge px-3 py-2 text-uppercase fw-bold" style={{ ...style, borderRadius: '20px', fontSize: '0.7rem' }}>
        {status || 'Pending'}
      </span>
    );
  };

  const hasPlans = trainingPlans.length > 0 || nutritionPlans.length > 0;

  const PlanMeta = ({ icon, label, value, accent }) => (
    <div className="col-12 col-sm-6">
      <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="d-flex align-items-center gap-2 mb-1">
          {icon}
          <span className="text-secondary small text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>{label}</span>
        </div>
        <span className="text-white small fw-bold" style={{ color: accent || '#fff' }}>{value || '—'}</span>
      </div>
    </div>
  );

  const TrainingPlanCard = ({ plan, idx }) => (
    <motion.div
      key={plan.id || idx}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08 }}
      className="p-4"
      style={{
        background: 'rgba(20, 20, 20, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 122, 0, 0.15)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
      }}
    >
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <Dumbbell size={18} style={{ color: '#ff7a00' }} />
            <span className="text-secondary small text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
              Training Plan #{plan.id}
            </span>
          </div>
          <h4 className="fw-black text-white m-0 fs-5">{plan.goal || 'Training Program'}</h4>
        </div>
        {getStatusBadge(plan.status)}
      </div>

      {plan.description && (
        <p className="text-secondary small mb-4" style={{ lineHeight: 1.6 }}>{plan.description}</p>
      )}

      <div className="row g-2 mb-4">
        <PlanMeta icon={<User size={14} className="text-secondary" />} label="Member" value={plan.user_name} />
        <PlanMeta icon={<Dumbbell size={14} style={{ color: '#ff7a00' }} />} label="Trainer" value={plan.trainer_name} accent="#ff7a00" />
        <PlanMeta icon={<Hash size={14} className="text-secondary" />} label="Exercises" value={plan.exercise_count ?? 0} />
        <PlanMeta icon={<Target size={14} className="text-secondary" />} label="Goal" value={plan.goal} />
      </div>

      <button
        onClick={() => navigate(`/training/${plan.id}`)}
        className="btn py-2 px-3 small d-flex align-items-center gap-2 hover-lift"
        style={{
          borderRadius: '8px',
          fontSize: '0.8rem',
          background: 'rgba(255, 122, 0, 0.1)',
          border: '1px solid rgba(255, 122, 0, 0.4)',
          color: '#ff7a00'
        }}
      >
        <Dumbbell size={14} /> View Training Plan <ExternalLink size={12} />
      </button>
    </motion.div>
  );

  const NutritionPlanCard = ({ plan, idx }) => (
    <motion.div
      key={plan.id || idx}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08 }}
      className="p-4"
      style={{
        background: 'rgba(20, 20, 20, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(0, 230, 115, 0.15)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
      }}
    >
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <Apple size={18} style={{ color: '#00e673' }} />
            <span className="text-secondary small text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
              Diet Plan #{plan.id}
            </span>
          </div>
          <h4 className="fw-black text-white m-0 fs-5">{plan.goal || 'Nutrition Program'}</h4>
        </div>
        {getStatusBadge(plan.status)}
      </div>

      {plan.description && (
        <p className="text-secondary small mb-4" style={{ lineHeight: 1.6 }}>{plan.description}</p>
      )}

      <div className="row g-2 mb-4">
        <PlanMeta icon={<User size={14} className="text-secondary" />} label="Member" value={plan.user_name} />
        <PlanMeta icon={<Apple size={14} style={{ color: '#00e673' }} />} label="Nutritionist" value={plan.nutritionist_name} accent="#00e673" />
        <PlanMeta icon={<Hash size={14} className="text-secondary" />} label="Meals" value={plan.meal_count ?? 0} />
        <PlanMeta icon={<FileText size={14} className="text-secondary" />} label="Goal" value={plan.goal} />
      </div>

      <button
        onClick={() => navigate(`/nutrition/${plan.id}`)}
        className="btn py-2 px-3 small d-flex align-items-center gap-2 hover-lift"
        style={{
          borderRadius: '8px',
          fontSize: '0.8rem',
          background: 'rgba(0, 230, 115, 0.1)',
          border: '1px solid rgba(0, 230, 115, 0.4)',
          color: '#00e673'
        }}
      >
        <Apple size={14} /> View Diet Plan <ExternalLink size={12} />
      </button>
    </motion.div>
  );

  return (
    <div className="profile-container text-white py-5 px-3 min-vh-100" style={{ background: '#0a0a0a' }}>
      <div className="max-width-lg mx-auto" style={{ maxWidth: '1000px' }}>
        <div className="d-flex align-items-center justify-content-between mb-5 border-bottom border-secondary border-opacity-15 pb-4">
          <div>
            <h1 className="fw-black text-gradient display-6 mb-2">My Plans</h1>
            <p className="text-secondary small m-0">
              Training and diet plans loaded from your account — goals, specialists, and progress counts.
            </p>
          </div>
          <button
            onClick={fetchPlans}
            className="btn btn-link text-warning p-0 hover-lift d-flex align-items-center gap-2"
            style={{ textDecoration: 'none' }}
          >
            <RefreshCw size={18} className={loading ? 'spin-animation' : ''} />
            <span className="small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Refresh</span>
          </button>
        </div>

        {loading && !hasPlans ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading plans...</span>
            </div>
          </div>
        ) : !hasPlans ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-5 p-4 rounded-4"
            style={{
              background: 'rgba(20, 20, 20, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <Shield size={48} className="text-secondary mb-3 opacity-40" />
            <h3 className="fw-bold text-white mb-2">No Plans Yet</h3>
            <p className="text-secondary small mb-4 mx-auto" style={{ maxWidth: '420px' }}>
              Book a trainer or nutritionist to create your first training or diet plan.
            </p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <button
                onClick={() => navigate('/trainers')}
                className="btn btn-warning px-4 py-2 fw-black text-uppercase border-0 hover-lift"
                style={{
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ff7a00 0%, #ff4400 100%)',
                  color: '#000',
                  fontSize: '0.85rem'
                }}
              >
                Book a Trainer
              </button>
              <button
                onClick={() => navigate('/nutritionists')}
                className="btn px-4 py-2 fw-black text-uppercase border-0 hover-lift"
                style={{
                  borderRadius: '8px',
                  background: 'rgba(0, 230, 115, 0.15)',
                  border: '1px solid rgba(0, 230, 115, 0.4)',
                  color: '#00e673',
                  fontSize: '0.85rem'
                }}
              >
                Book a Nutritionist
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="d-flex flex-column gap-5">
            <section>
              <h2 className="fw-black text-uppercase fs-5 mb-3 d-flex align-items-center gap-2" style={{ letterSpacing: '1px' }}>
                <Dumbbell size={20} style={{ color: '#ff7a00' }} /> Training Plans
              </h2>
              {trainingPlans.length === 0 ? (
                <div className="p-4 rounded-4 text-center text-secondary small" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  No training plans yet.{' '}
                  <button className="btn btn-link text-warning p-0 small" onClick={() => navigate('/trainers')}>Book a trainer</button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {trainingPlans.map((plan, idx) => <TrainingPlanCard key={plan.id || idx} plan={plan} idx={idx} />)}
                </div>
              )}
            </section>

            <section>
              <h2 className="fw-black text-uppercase fs-5 mb-3 d-flex align-items-center gap-2" style={{ letterSpacing: '1px' }}>
                <Apple size={20} style={{ color: '#00e673' }} /> Diet Plans
              </h2>
              {nutritionPlans.length === 0 ? (
                <div className="p-4 rounded-4 text-center text-secondary small" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  No diet plans yet.{' '}
                  <button className="btn btn-link text-success p-0 small" onClick={() => navigate('/nutritionists')}>Book a nutritionist</button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {nutritionPlans.map((plan, idx) => <NutritionPlanCard key={plan.id || idx} plan={plan} idx={idx} />)}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default MySubscriptions;
