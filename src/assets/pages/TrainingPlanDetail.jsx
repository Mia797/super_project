import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Info, ArrowLeft, User, Target, FileText } from 'lucide-react';
import {
  getUserTrainingPlan,
  getTrainingPlans,
  getWorkoutExercises,
  normalizeUserTrainingPlan,
  normalizeTrainingPlans,
  normalizeWorkoutExercises,
} from '../../api/trainingPlanApi';
import { toast } from 'react-toastify';

function TrainingPlanDetail() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);

  const fetchPlanDetails = async () => {
    setLoading(true);
    try {
      const response = await getUserTrainingPlan();
      const { plan: latestPlan, exercises: latestExercises } = normalizeUserTrainingPlan(response.data);

      if (latestPlan && String(latestPlan.id) === String(planId)) {
        setPlan(latestPlan);
        setExercises(latestExercises);
        return;
      }

      const plansRes = await getTrainingPlans();
      const plans = normalizeTrainingPlans(plansRes.data);
      const matchedPlan = plans.find((p) => String(p.id) === String(planId));

      if (!matchedPlan) {
        if (latestPlan) {
          setPlan(latestPlan);
          setExercises(latestExercises);
          toast.info('Showing your latest training plan.');
        } else {
          setPlan(null);
          setExercises([]);
        }
        return;
      }

      const exercisesRes = await getWorkoutExercises(planId);
      const planExercises = normalizeWorkoutExercises(exercisesRes.data);

      setPlan({
        id: matchedPlan.id,
        trainer_id: matchedPlan.trainer_id,
        trainer_name: matchedPlan.trainer_name,
        goal: matchedPlan.goal,
        description: matchedPlan.description,
      });
      setExercises(planExercises);
    } catch (error) {
      console.error('Failed to fetch training plan:', error);
      toast.error(error.response?.data?.message || 'Failed to load training plan details.');
      setPlan(null);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (planId) {
      fetchPlanDetails();
    }
  }, [planId]);

  const groupedExercises = useMemo(() => {
    return exercises.reduce((acc, ex) => {
      const day = Number(ex.day_number) || 1;
      if (!acc[day]) acc[day] = [];
      acc[day].push(ex);
      return acc;
    }, {});
  }, [exercises]);

  const dayNumbers = useMemo(() => {
    const days = Object.keys(groupedExercises)
      .map(Number)
      .sort((a, b) => a - b);
    return days.length > 0 ? days : [1];
  }, [groupedExercises]);

  useEffect(() => {
    if (dayNumbers.length > 0 && !dayNumbers.includes(activeDay)) {
      setActiveDay(dayNumbers[0]);
    }
  }, [dayNumbers, activeDay]);

  const activeExercises = useMemo(() => {
    const list = groupedExercises[activeDay] || [];
    return [...list].sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
  }, [groupedExercises, activeDay]);

  const totalExercises = exercises.length;

  return (
    <div className="profile-container text-white py-5 px-3 min-vh-100" style={{ background: '#0a0a0a' }}>
      <div className="max-width-lg mx-auto" style={{ maxWidth: '950px' }}>

        <div className="d-flex align-items-center gap-3 mb-5 border-bottom border-secondary border-opacity-15 pb-4">
          <button
            onClick={() => navigate('/my-subscriptions')}
            className="btn btn-link text-white p-0 d-flex align-items-center justify-content-center"
            style={{ textDecoration: 'none' }}
          >
            <ArrowLeft size={24} className="text-warning hover-lift" />
          </button>
          <div>
            <h1 className="fw-black text-gradient display-6 mb-1">
              {plan?.goal || 'Training Program'}
            </h1>
            <p className="text-secondary small m-0">
              Training Plan #{plan?.id || planId}
              {plan?.trainer_name ? ` · ${plan.trainer_name}` : ''}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading plan...</span>
            </div>
          </div>
        ) : !plan ? (
          <div className="text-center py-5 rounded-4" style={{ background: 'rgba(20, 20, 20, 0.45)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <Dumbbell size={40} className="text-secondary mb-3 opacity-40" />
            <p className="text-secondary small">No training plan found yet. Check back once your trainer publishes your program.</p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 mb-4 rounded-4"
              style={{
                background: 'rgba(20, 20, 20, 0.75)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 122, 0, 0.15)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <User size={14} style={{ color: '#ff7a00' }} />
                    <span className="text-secondary small text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>Trainer</span>
                  </div>
                  <span className="text-white fw-bold">{plan.trainer_name || '—'}</span>
                </div>
                <div className="col-12 col-md-6">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Target size={14} className="text-secondary" />
                    <span className="text-secondary small text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>Goal</span>
                  </div>
                  <span className="text-white fw-bold">{plan.goal || '—'}</span>
                </div>
                {plan.description && (
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <FileText size={14} className="text-secondary" />
                      <span className="text-secondary small text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>Notes</span>
                    </div>
                    <p className="text-secondary small m-0" style={{ lineHeight: 1.6 }}>{plan.description}</p>
                  </div>
                )}
                <div className="col-6 col-md-3">
                  <span className="text-secondary small d-block text-uppercase" style={{ fontSize: '0.6rem' }}>Total Exercises</span>
                  <span className="fs-5 fw-black text-white">{totalExercises}</span>
                </div>
                <div className="col-6 col-md-3">
                  <span className="text-secondary small d-block text-uppercase" style={{ fontSize: '0.6rem' }}>Program Days</span>
                  <span className="fs-5 fw-black text-white">{dayNumbers.length}</span>
                </div>
              </div>
            </motion.div>

            {exercises.length === 0 ? (
              <div className="text-center py-5 rounded-4" style={{ background: 'rgba(20, 20, 20, 0.45)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <Dumbbell size={40} className="text-secondary mb-3 opacity-40" />
                <p className="text-secondary small">No exercises assigned to this plan yet. Your trainer is still building your program.</p>
              </div>
            ) : (
              <div>
                <div className="d-flex gap-2 overflow-auto pb-3 mb-4 scrollbar-hidden" style={{ whiteSpace: 'nowrap' }}>
                  {dayNumbers.map((day) => {
                    const count = groupedExercises[day]?.length || 0;
                    const isSelected = activeDay === day;
                    return (
                      <button
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className="btn px-4 py-2 fw-bold text-uppercase d-flex align-items-center gap-2 hover-lift"
                        style={{
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          background: isSelected
                            ? 'linear-gradient(135deg, #ff7a00 0%, #ff4400 100%)'
                            : 'rgba(255, 255, 255, 0.05)',
                          color: isSelected ? '#000' : '#fff',
                          border: isSelected ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                          fontWeight: 800,
                        }}
                      >
                        Day {day}
                        <span
                          className="badge rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: '18px',
                            height: '18px',
                            background: isSelected ? 'rgba(0,0,0,0.2)' : 'rgba(255,122,0,0.2)',
                            color: isSelected ? '#000' : '#ff7a00',
                            fontSize: '0.6rem',
                            padding: 0,
                          }}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {activeExercises.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="row g-3 mb-4 p-4 rounded-4"
                    style={{
                      background: 'linear-gradient(135deg, rgba(20,20,20,0.85) 0%, rgba(10,10,10,0.9) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <div className="col-12 border-bottom border-secondary border-opacity-15 pb-2 mb-2">
                      <h5 className="small text-secondary text-uppercase fw-bold m-0" style={{ letterSpacing: '1px' }}>
                        Day {activeDay} Summary
                      </h5>
                    </div>
                    <div className="col-6 col-md-4">
                      <span className="text-secondary small d-block mb-1 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Exercises</span>
                      <span className="fs-4 fw-black text-white">{activeExercises.length}</span>
                    </div>
                    <div className="col-6 col-md-4">
                      <span className="text-secondary small d-block mb-1 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Total Sets</span>
                      <span className="fs-4 fw-black text-white">
                        {activeExercises.reduce((sum, ex) => sum + (Number(ex.sets) || 0), 0)}
                      </span>
                    </div>
                  </motion.div>
                )}

                <div className="d-flex flex-column gap-4">
                  {activeExercises.map((ex, idx) => (
                    <motion.div
                      key={ex.workout_exercise_id ?? `${ex.exercise_id}-${idx}`}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="p-4"
                      style={{
                        background: 'rgba(20, 20, 20, 0.75)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                      }}
                    >
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="p-3 bg-black bg-opacity-40 rounded-3 border border-secondary border-opacity-10 text-warning">
                            <Dumbbell size={24} />
                          </div>
                          <div>
                            <div className="d-flex gap-2 mb-1 flex-wrap">
                              {ex.sort_order != null && (
                                <span
                                  className="badge rounded px-2 py-0.5 fw-bold small"
                                  style={{
                                    fontSize: '0.6rem',
                                    background: 'rgba(255, 122, 0, 0.1)',
                                    border: '1px solid rgba(255, 122, 0, 0.25)',
                                    color: '#ff7a00',
                                  }}
                                >
                                  #{ex.sort_order}
                                </span>
                              )}
                              {ex.muscle_name && (
                                <span
                                  className="badge rounded px-2 py-0.5 fw-bold small text-uppercase"
                                  style={{
                                    fontSize: '0.6rem',
                                    background: 'rgba(23, 162, 184, 0.1)',
                                    border: '1px solid rgba(23, 162, 184, 0.25)',
                                    color: '#17a2b8',
                                  }}
                                >
                                  {ex.muscle_name}
                                </span>
                              )}
                            </div>
                            <h4 className="fw-black text-white m-0 fs-5">{ex.exercise_name || 'Workout Exercise'}</h4>
                            {ex.equipment_name && (
                              <span className="text-secondary small d-block mt-1">{ex.equipment_name}</span>
                            )}
                          </div>
                        </div>

                        <div className="d-flex gap-2 flex-wrap">
                          <div
                            className="px-3 py-2 rounded-3 text-center"
                            style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)' }}
                          >
                            <span className="text-secondary small d-block" style={{ fontSize: '0.6rem' }}>Sets</span>
                            <span className="text-white fw-black fs-6">{ex.sets ?? 3}</span>
                          </div>
                          <div
                            className="px-3 py-2 rounded-3 text-center"
                            style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)' }}
                          >
                            <span className="text-secondary small d-block" style={{ fontSize: '0.6rem' }}>Reps</span>
                            <span className="text-white fw-black fs-6">{ex.reps ?? 10}</span>
                          </div>
                          <div
                            className="px-3 py-2 rounded-3 text-center"
                            style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)' }}
                          >
                            <span className="text-secondary small d-block" style={{ fontSize: '0.6rem' }}>Rest</span>
                            <span className="text-warning fw-black fs-6">{ex.rest_time ?? 60}s</span>
                          </div>
                        </div>
                      </div>

                      {ex.exercise_description && (
                        <div className="mt-3 p-3 rounded-3 bg-black bg-opacity-30 border border-secondary border-opacity-10 d-flex gap-2 align-items-start">
                          <Info size={16} className="text-info flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-secondary small d-block fw-bold text-uppercase mb-1" style={{ fontSize: '0.6rem' }}>Description</span>
                            <p className="text-secondary small m-0" style={{ lineHeight: '1.5' }}>{ex.exercise_description}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TrainingPlanDetail;
