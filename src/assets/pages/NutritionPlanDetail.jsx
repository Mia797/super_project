import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Apple, Info, ArrowLeft, User, Target, FileText } from 'lucide-react';
import { getUserNutritionPlan, getNutritionPlans, getDietMeals, normalizeUserNutritionPlan, normalizeNutritionPlans, normalizeDietMeals } from '../../api/nutritionPlanApi';
import { toast } from 'react-toastify';

function NutritionPlanDetail() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);

  const fetchPlanDetails = async () => {
    setLoading(true);
    try {
      const response = await getUserNutritionPlan();
      const { plan: latestPlan, meals: latestMeals } = normalizeUserNutritionPlan(response.data);

      if (latestPlan && String(latestPlan.id) === String(planId)) {
        setPlan(latestPlan);
        setMeals(latestMeals);
        return;
      }

      const plansRes = await getNutritionPlans();
      const plans = normalizeNutritionPlans(plansRes.data);
      const matchedPlan = plans.find((p) => String(p.id) === String(planId));

      if (!matchedPlan) {
        if (latestPlan) {
          setPlan(latestPlan);
          setMeals(latestMeals);
          toast.info('Showing your latest diet plan.');
        } else {
          setPlan(null);
          setMeals([]);
        }
        return;
      }

      const mealsRes = await getDietMeals(planId);
      const planMeals = normalizeDietMeals(mealsRes.data);

      setPlan({
        id: matchedPlan.id,
        nutritionist_id: matchedPlan.nutritionist_id,
        nutritionist_name: matchedPlan.nutritionist_name,
        goal: matchedPlan.goal,
        description: matchedPlan.description,
      });
      setMeals(planMeals.map((m) => ({
        day_number: m.day_number,
        meal_name: m.meal_name,
        calories: m.calories,
        serving_size: m.serving_size,
        meal_type: m.meal_type,
        preparation_steps: m.preparation_steps,
      })));
    } catch (error) {
      console.error('Failed to fetch nutrition plan:', error);
      toast.error(error.response?.data?.message || 'Failed to load nutrition plan details.');
      setPlan(null);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (planId) {
      fetchPlanDetails();
    }
  }, [planId]);

  const groupedMeals = useMemo(() => {
    return meals.reduce((acc, meal) => {
      const day = Number(meal.day_number) || 1;
      if (!acc[day]) acc[day] = [];
      acc[day].push(meal);
      return acc;
    }, {});
  }, [meals]);

  const dayNumbers = useMemo(() => {
    const days = Object.keys(groupedMeals)
      .map(Number)
      .sort((a, b) => a - b);
    return days.length > 0 ? days : [1];
  }, [groupedMeals]);

  useEffect(() => {
    if (dayNumbers.length > 0 && !dayNumbers.includes(activeDay)) {
      setActiveDay(dayNumbers[0]);
    }
  }, [dayNumbers, activeDay]);

  const activeMeals = groupedMeals[activeDay] || [];
  const totalCalories = activeMeals.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0);
  const totalMeals = meals.length;

  const mealTypeOrder = ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Late Night Snack'];
  const sortedActiveMeals = [...activeMeals].sort((a, b) => {
    const aIdx = mealTypeOrder.indexOf(a.meal_type);
    const bIdx = mealTypeOrder.indexOf(b.meal_type);
    if (aIdx === -1 && bIdx === -1) return 0;
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });

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
              {plan?.goal || 'Nutrition Program'}
            </h1>
            <p className="text-secondary small m-0">
              Diet Plan #{plan?.id || planId}
              {plan?.nutritionist_name ? ` · ${plan.nutritionist_name}` : ''}
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
            <Apple size={40} className="text-secondary mb-3 opacity-40" />
            <p className="text-secondary small">No diet plan found yet. Check back once your nutritionist publishes your program.</p>
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
                border: '1px solid rgba(0, 230, 115, 0.15)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <User size={14} style={{ color: '#00e673' }} />
                    <span className="text-secondary small text-uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>Nutritionist</span>
                  </div>
                  <span className="text-white fw-bold">{plan.nutritionist_name || '—'}</span>
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
                  <span className="text-secondary small d-block text-uppercase" style={{ fontSize: '0.6rem' }}>Total Meals</span>
                  <span className="fs-5 fw-black text-white">{totalMeals}</span>
                </div>
                <div className="col-6 col-md-3">
                  <span className="text-secondary small d-block text-uppercase" style={{ fontSize: '0.6rem' }}>Program Days</span>
                  <span className="fs-5 fw-black text-white">{dayNumbers.length}</span>
                </div>
              </div>
            </motion.div>

            {meals.length === 0 ? (
              <div className="text-center py-5 rounded-4" style={{ background: 'rgba(20, 20, 20, 0.45)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <Apple size={40} className="text-secondary mb-3 opacity-40" />
                <p className="text-secondary small">No meals assigned to this plan yet. Your nutritionist is still building your program.</p>
              </div>
            ) : (
              <div>
                <div className="d-flex gap-2 overflow-auto pb-3 mb-4 scrollbar-hidden" style={{ whiteSpace: 'nowrap' }}>
                  {dayNumbers.map((day) => {
                    const count = groupedMeals[day]?.length || 0;
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
                            ? 'linear-gradient(135deg, #00e673 0%, #00b359 100%)'
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
                            background: isSelected ? 'rgba(0,0,0,0.2)' : 'rgba(0,230,115,0.2)',
                            color: isSelected ? '#000' : '#00e673',
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

                {activeMeals.length > 0 && (
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
                      <span className="text-secondary small d-block mb-1 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Meals</span>
                      <span className="fs-4 fw-black text-white">{activeMeals.length}</span>
                    </div>
                    <div className="col-6 col-md-4">
                      <span className="text-secondary small d-block mb-1 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Total Energy</span>
                      <span className="fs-4 fw-black text-white">
                        {Math.round(totalCalories)} <span className="small text-secondary" style={{ fontSize: '0.75rem' }}>kcal</span>
                      </span>
                    </div>
                  </motion.div>
                )}

                <div className="d-flex flex-column gap-4">
                  {sortedActiveMeals.map((meal, idx) => (
                    <motion.div
                      key={`${meal.meal_name}-${idx}`}
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
                          <div className="p-3 bg-black bg-opacity-40 rounded-3 border border-secondary border-opacity-10" style={{ color: '#00e673' }}>
                            <Apple size={24} />
                          </div>
                          <div>
                            <div className="d-flex gap-2 mb-1">
                              {meal.meal_type && (
                                <span
                                  className="badge rounded px-2 py-0.5 fw-bold small text-uppercase"
                                  style={{
                                    fontSize: '0.6rem',
                                    background: 'rgba(0, 230, 115, 0.1)',
                                    border: '1px solid rgba(0, 230, 115, 0.25)',
                                    color: '#00e673',
                                  }}
                                >
                                  {meal.meal_type}
                                </span>
                              )}
                            </div>
                            <h4 className="fw-black text-white m-0 fs-5">{meal.meal_name || 'Diet Meal'}</h4>
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          {meal.calories != null && (
                            <div
                              className="px-3 py-2 rounded-3 text-center"
                              style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)' }}
                            >
                              <span className="text-secondary small d-block" style={{ fontSize: '0.6rem' }}>Calories</span>
                              <span className="text-warning fw-black fs-6">{Math.round(meal.calories)} kcal</span>
                            </div>
                          )}
                          {meal.serving_size != null && (
                            <div
                              className="px-3 py-2 rounded-3 text-center"
                              style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)' }}
                            >
                              <span className="text-secondary small d-block" style={{ fontSize: '0.6rem' }}>Serving</span>
                              <span className="text-white fw-black fs-6">{meal.serving_size}g</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {meal.preparation_steps && (
                        <div className="mt-3 p-3 rounded-3 bg-black bg-opacity-30 border border-secondary border-opacity-10 d-flex gap-2 align-items-start">
                          <Info size={16} className="text-info flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-secondary small d-block fw-bold text-uppercase mb-1" style={{ fontSize: '0.6rem' }}>Preparation</span>
                            <p className="text-secondary small m-0" style={{ lineHeight: '1.5' }}>{meal.preparation_steps}</p>
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

export default NutritionPlanDetail;
