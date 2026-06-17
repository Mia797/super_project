import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Apple, Save, Plus, Trash2, ArrowLeft, Info, Search } from 'lucide-react';
import { getDietMeals, getNutritionPlans, normalizeDietMeals, normalizeNutritionPlans } from '../../api/nutritionPlanApi';
import { getMeals } from '../../api/mealApi';
import { addMealsToPlan } from '../../api/specialistApi';
import { toast } from 'react-toastify';

const MAX_DAYS = 14;

function NutritionistPlanEditor() {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [planInfo, setPlanInfo] = useState(null);
  const [mealLibrary, setMealLibrary] = useState([]);
  const [planMeals, setPlanMeals] = useState([]);
  const [queuedMeals, setQueuedMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    meal_id: '',
    day_number: '1',
  });

  const loadPlanContext = async () => {
    try {
      const res = await getNutritionPlans();
      const plans = normalizeNutritionPlans(res.data);
      const plan = plans.find((p) => String(p.id) === String(planId));
      if (plan) setPlanInfo(plan);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPlanMeals = async () => {
    try {
      const res = await getDietMeals(planId);
      setPlanMeals(normalizeDietMeals(res.data));
    } catch (e) {
      console.error(e);
      toast.error('Failed to load current diet meals.');
    }
  };

  const loadMealLibrary = async (search = '') => {
    setLibraryLoading(true);
    try {
      const res = await getMeals(search);
      setMealLibrary(res.data?.meals || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load meal library.');
    } finally {
      setLibraryLoading(false);
    }
  };

  useEffect(() => {
    if (!planId) return;
    setLoading(true);
    Promise.all([loadPlanContext(), loadPlanMeals(), loadMealLibrary()])
      .finally(() => setLoading(false));
  }, [planId]);

  useEffect(() => {
    const timer = setTimeout(() => loadMealLibrary(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectedLibraryMeal = mealLibrary.find(
    (m) => String(m.id) === String(form.meal_id)
  );

  const handleAddToQueue = (e) => {
    e.preventDefault();
    if (!form.meal_id) {
      toast.error('Select a meal from the library.');
      return;
    }

    const meal = mealLibrary.find((m) => String(m.id) === String(form.meal_id));
    if (!meal) return;

    const dayNumber = parseInt(form.day_number, 10);
    if (!dayNumber || dayNumber < 1) {
      toast.error('Day number must be at least 1.');
      return;
    }

    setQueuedMeals((prev) => [
      ...prev,
      {
        meal_id: meal.id,
        day_number: dayNumber,
        meal_name: meal.name,
        calories: meal.calories,
        serving_size: meal.serving_size,
        meal_type: meal.meal_type,
        preparation_steps: meal.preparation_steps,
      },
    ]);
    toast.success('Meal queued for this plan.');
  };

  const handleRemoveQueued = (index) => {
    setQueuedMeals((prev) => prev.filter((_, idx) => idx !== index));
    toast.info('Meal removed from queue.');
  };

  const handlePublishPlan = async () => {
    if (queuedMeals.length === 0) {
      toast.error('Add at least one meal to the queue before publishing.');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await addMealsToPlan(planId, queuedMeals);
      if (res.data?.success) {
        toast.success(res.data.message || 'Nutrition program published successfully!');
        setQueuedMeals([]);
        await loadPlanMeals();
        await loadPlanContext();
        navigate('/specialist/dashboard');
      } else {
        toast.error(res.data?.error || res.data?.message || 'Failed to publish program.');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to publish nutrition program.'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const planTitle = planInfo?.goal || planInfo?.plan_name || 'Nutrition Program';
  const clientName = planInfo?.user_name || planInfo?.client_name || planInfo?.user?.name;

  return (
    <div className="profile-container text-white py-5 px-3 min-vh-100" style={{ background: '#0a0a0a' }}>
      <div className="max-width-lg mx-auto" style={{ maxWidth: '1050px' }}>

        <div className="d-flex align-items-center gap-3 mb-5 border-bottom border-secondary border-opacity-15 pb-4">
          <button
            onClick={() => navigate('/specialist/dashboard')}
            className="btn btn-link text-white p-0 d-flex align-items-center justify-content-center"
            style={{ textDecoration: 'none' }}
          >
            <ArrowLeft size={24} className="text-warning hover-lift" />
          </button>
          <div>
            <h1 className="fw-black text-gradient display-6 mb-1" style={{ fontWeight: 900 }}>Nutrition Planner</h1>
            <p className="text-secondary small m-0">
              Plan #{planId}
              {clientName ? ` · ${clientName}` : ''}
              {planInfo?.status ? ` · ${planInfo.status}` : ''}
            </p>
            {planTitle && (
              <p className="text-warning small m-0 mt-1 fw-bold">{planTitle}</p>
            )}
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-5">
            <div
              className="p-4 h-100 d-flex flex-column justify-content-between"
              style={{
                background: 'rgba(20, 20, 20, 0.75)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
              }}
            >
              <div>
                <h3 className="fw-black text-warning mb-4 fs-5 text-uppercase" style={{ letterSpacing: '1px' }}>
                  Pick from Meal Library
                </h3>

                <div className="form-group mb-3">
                  <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Search meals</label>
                  <div className="position-relative">
                    <Search size={16} className="position-absolute text-secondary" style={{ left: 12, top: 12 }} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name..."
                      className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25 py-2 ps-5"
                    />
                  </div>
                </div>

                <form onSubmit={handleAddToQueue} className="d-flex flex-column gap-3">
                  <div className="form-group">
                    <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Meal</label>
                    <select
                      name="meal_id"
                      value={form.meal_id}
                      onChange={handleInputChange}
                      className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25 py-2"
                      required
                      disabled={libraryLoading}
                    >
                      <option value="">Select a meal...</option>
                      {mealLibrary.map((meal) => (
                        <option key={meal.id} value={meal.id}>
                          {meal.name} ({meal.meal_type || 'Meal'} · {meal.calories ?? '?'} kcal)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Day</label>
                    <select
                      name="day_number"
                      value={form.day_number}
                      onChange={handleInputChange}
                      className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25 py-2"
                    >
                      {Array.from({ length: MAX_DAYS }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={day}>Day {day}</option>
                      ))}
                    </select>
                  </div>

                  {selectedLibraryMeal && (
                    <div className="p-3 rounded border border-secondary border-opacity-15 bg-black bg-opacity-25">
                      <p className="text-white small fw-bold m-0">{selectedLibraryMeal.name}</p>
                      <p className="text-secondary small m-0 mt-1">
                        {selectedLibraryMeal.meal_type} · {selectedLibraryMeal.calories} kcal
                        {selectedLibraryMeal.serving_size ? ` · ${selectedLibraryMeal.serving_size}g` : ''}
                      </p>
                      {selectedLibraryMeal.preparation_steps && (
                        <p className="text-secondary small m-0 mt-2" style={{ fontSize: '0.75rem' }}>
                          {selectedLibraryMeal.preparation_steps}
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-warning mt-3 py-2.5 fw-black text-uppercase d-flex align-items-center justify-content-center gap-2 hover-lift"
                    style={{
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #ff7a00 0%, #ff4400 100%)',
                      border: 'none',
                      color: '#000',
                      fontWeight: 800,
                    }}
                    disabled={libraryLoading || !form.meal_id}
                  >
                    <Plus size={18} /> Queue Meal
                  </button>
                </form>
              </div>

              <div className="mt-4 pt-4 border-top border-secondary border-opacity-15">
                <button
                  onClick={handlePublishPlan}
                  disabled={submitLoading || queuedMeals.length === 0}
                  className="btn btn-outline-info w-100 py-3 fw-black text-uppercase d-flex align-items-center justify-content-center gap-2 hover-lift"
                  style={{
                    borderRadius: '10px',
                    border: '2px solid var(--accent-secondary)',
                    fontWeight: 900,
                    letterSpacing: '1px',
                  }}
                >
                  <Save size={18} /> {submitLoading ? 'Publishing...' : 'Publish Nutrition Program'}
                </button>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-7">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status"></div>
              </div>
            ) : (
              <>
                {planMeals.length > 0 && (
                  <div className="mb-5">
                    <h3 className="fw-black text-white mb-4 fs-5 text-uppercase d-flex align-items-center gap-2" style={{ letterSpacing: '1px' }}>
                      <Apple size={18} className="text-success" /> Current Plan Meals
                    </h3>
                    <div className="d-flex flex-column gap-3">
                      {planMeals.map((meal) => (
                        <MealCard key={meal.diet_meal_id ?? `${meal.meal_id}-${meal.day_number}`} meal={meal} readOnly />
                      ))}
                    </div>
                  </div>
                )}

                <h3 className="fw-black text-white mb-4 fs-5 text-uppercase d-flex align-items-center gap-2" style={{ letterSpacing: '1px' }}>
                  <Apple size={18} className="text-info" /> Queued Meals
                </h3>

                {queuedMeals.length === 0 ? (
                  <div className="text-center py-5 rounded-4" style={{ background: 'rgba(20, 20, 20, 0.45)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span className="text-secondary small">No meals queued. Pick meals from the library on the left.</span>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {queuedMeals.map((meal, idx) => (
                      <motion.div
                        key={`${meal.meal_id}-${meal.day_number}-${idx}`}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <MealCard meal={meal} onRemove={() => handleRemoveQueued(idx)} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MealCard({ meal, onRemove, readOnly = false }) {
  const name = meal.meal_name || meal.name;
  const dayLabel = meal.day_number ? `Day ${meal.day_number}` : meal.day_of_week;
  const typeLabel = meal.meal_type || meal.time_slot;
  const steps = meal.preparation_steps || meal.instructions;

  return (
    <div
      className="p-3"
      style={{
        background: 'rgba(25, 25, 25, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
      }}
    >
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="d-flex gap-2 mb-2">
            <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded px-2 py-0.5 fw-bold small text-uppercase" style={{ fontSize: '0.6rem' }}>
              {dayLabel}
            </span>
            {typeLabel && (
              <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded px-2 py-0.5 fw-bold small text-uppercase" style={{ fontSize: '0.6rem' }}>
                {typeLabel}
              </span>
            )}
          </div>
          <h4 className="fw-black text-white m-0 fs-6">{name}</h4>
          <div className="d-flex gap-3 text-secondary small mt-2" style={{ fontSize: '0.75rem' }}>
            {meal.calories != null && (
              <span>Energy: <strong className="text-white">{meal.calories} kcal</strong></span>
            )}
            {meal.serving_size != null && (
              <span>Serving: <strong className="text-white">{meal.serving_size}g</strong></span>
            )}
          </div>
        </div>
        {!readOnly && onRemove && (
          <button onClick={onRemove} className="btn btn-link text-danger p-2 hover-lift">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {steps && (
        <div className="mt-2.5 p-2 bg-black bg-opacity-20 rounded border border-secondary border-opacity-10 d-flex gap-1.5 align-items-start">
          <Info size={12} className="text-info mt-0.5" />
          <p className="text-secondary small m-0" style={{ fontSize: '0.7rem', lineHeight: '1.4' }}>{steps}</p>
        </div>
      )}
    </div>
  );
}

export default NutritionistPlanEditor;
