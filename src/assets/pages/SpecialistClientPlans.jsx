import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  RefreshCw,
  Dumbbell,
  Apple,
  Edit3,
  ChevronRight,
  User,
  Hash
} from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTrainingPlans, normalizeTrainingPlans } from '../../api/trainingPlanApi';
import { getNutritionPlans, normalizeNutritionPlans } from '../../api/nutritionPlanApi';
import { toast } from 'react-toastify';

function SpecialistClientPlans() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const isTrainer = user?.role === 'trainer';
  const isNutritionist = user?.role === 'nutritionist';

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      if (isTrainer) {
        const res = await getTrainingPlans();
        setPlans(normalizeTrainingPlans(res.data));
      } else if (isNutritionist) {
        const res = await getNutritionPlans();
        setPlans(normalizeNutritionPlans(res.data));
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to load client plans.');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [isTrainer, isNutritionist]);

  useEffect(() => {
    if (user && (isTrainer || isNutritionist)) {
      fetchPlans();
    }
  }, [user, isTrainer, isNutritionist, fetchPlans]);

  if (!user || (!isTrainer && !isNutritionist)) {
    return <Navigate to="/" />;
  }

  const pageTitle = isTrainer ? 'Assigned Training Plans' : 'Assigned Diet Plans';
  const accent = isTrainer ? '#ff7a00' : '#00e673';
  const countLabel = isTrainer ? 'Exercises' : 'Meals';
  const countField = isTrainer ? 'exercise_count' : 'meal_count';
  const specialistLabel = isTrainer ? 'Trainer' : 'Nutritionist';
  const specialistNameField = isTrainer ? 'trainer_name' : 'nutritionist_name';
  const editorPath = isTrainer ? 'workout' : 'meals';

  const getStatusStyle = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'active') {
      return { background: 'rgba(40, 167, 69, 0.1)', color: '#28a745', border: '1px solid rgba(40, 167, 69, 0.3)' };
    }
    if (s === 'planning') {
      return { background: 'rgba(23, 162, 184, 0.1)', color: '#17a2b8', border: '1px solid rgba(23, 162, 184, 0.3)' };
    }
    return { background: 'rgba(255, 193, 7, 0.1)', color: '#ffc107', border: '1px solid rgba(255, 193, 7, 0.3)' };
  };

  return (
    <div className="profile-container text-white py-5 px-3 min-vh-100" style={{ background: '#0a0a0a' }}>
      <div className="max-width-lg mx-auto" style={{ maxWidth: '1050px' }}>
        <div className="d-flex align-items-center justify-content-between mb-5 border-bottom border-secondary border-opacity-15 pb-4">
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={() => navigate('/specialist/dashboard')}
              className="btn btn-link text-white p-0 d-flex align-items-center justify-content-center"
              style={{ textDecoration: 'none' }}
            >
              <ArrowLeft size={24} className="text-warning hover-lift" />
            </button>
            <div>
              <h1 className="fw-black text-gradient display-6 mb-1 d-flex align-items-center gap-2">
                {isTrainer ? <Dumbbell size={28} style={{ color: accent }} /> : <Apple size={28} style={{ color: accent }} />}
                {pageTitle}
              </h1>
              <p className="text-secondary small m-0">
                All clients assigned to you — build workouts or meal plans from here.
              </p>
            </div>
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

        {loading && plans.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status"></div>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-5 rounded-4" style={{ background: 'rgba(20, 20, 20, 0.45)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <p className="text-secondary small mb-0">No assigned client plans yet.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id || idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4"
                style={{
                  background: 'rgba(20, 20, 20, 0.7)',
                  border: `1px solid ${isTrainer ? 'rgba(255, 122, 0, 0.15)' : 'rgba(0, 230, 115, 0.15)'}`,
                  borderRadius: '16px'
                }}
              >
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                  <div>
                    <span className="text-secondary small text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                      Plan #{plan.id}
                    </span>
                    <h4 className="fw-black text-white m-0">{plan.goal || 'Client Program'}</h4>
                    {plan.description && (
                      <p className="text-secondary small mt-2 mb-0">{plan.description}</p>
                    )}
                  </div>
                  <span className="badge px-3 py-2 text-uppercase fw-bold" style={{ ...getStatusStyle(plan.status), borderRadius: '20px', fontSize: '0.65rem' }}>
                    {plan.status || 'Planning'}
                  </span>
                </div>

                <div className="row g-2 mb-4">
                  <div className="col-6 col-md-3">
                    <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <User size={14} className="text-secondary" />
                        <span className="text-secondary small text-uppercase" style={{ fontSize: '0.6rem' }}>Client</span>
                      </div>
                      <span className="text-white small fw-bold">{plan.user_name || '—'}</span>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        {isTrainer ? <Dumbbell size={14} style={{ color: accent }} /> : <Apple size={14} style={{ color: accent }} />}
                        <span className="text-secondary small text-uppercase" style={{ fontSize: '0.6rem' }}>{specialistLabel}</span>
                      </div>
                      <span className="small fw-bold" style={{ color: accent }}>{plan[specialistNameField] || user.name}</span>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <Hash size={14} className="text-secondary" />
                        <span className="text-secondary small text-uppercase" style={{ fontSize: '0.6rem' }}>{countLabel}</span>
                      </div>
                      <span className="text-white small fw-bold">{plan[countField] ?? 0}</span>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-secondary small text-uppercase d-block mb-1" style={{ fontSize: '0.6rem' }}>User ID</span>
                      <span className="text-white small fw-bold">{plan.user_id ?? '—'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/specialist/plan/${plan.id}/${editorPath}`)}
                  className="btn btn-sm py-2 px-3 rounded fw-bold text-uppercase d-inline-flex align-items-center gap-2 hover-lift"
                  style={{
                    fontSize: '0.75rem',
                    background: isTrainer ? 'rgba(255, 122, 0, 0.1)' : 'rgba(0, 230, 115, 0.1)',
                    border: `1px solid ${isTrainer ? 'rgba(255, 122, 0, 0.4)' : 'rgba(0, 230, 115, 0.4)'}`,
                    color: accent
                  }}
                >
                  <Edit3 size={14} />
                  {isTrainer ? 'Build Workout Split' : 'Build Meal Split'}
                  <ChevronRight size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SpecialistClientPlans;
