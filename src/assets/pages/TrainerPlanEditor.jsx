import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Save, Plus, Trash2, ArrowLeft, Info, Search } from 'lucide-react';
import { getWorkoutExercises, getTrainingPlans, normalizeWorkoutExercises, normalizeTrainingPlans } from '../../api/trainingPlanApi';
import { getExercises } from '../../api/exerciseApi';
import { addExercisesToPlan } from '../../api/specialistApi';
import { toast } from 'react-toastify';

const MAX_DAYS = 14;

function TrainerPlanEditor() {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [planInfo, setPlanInfo] = useState(null);
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [planExercises, setPlanExercises] = useState([]);
  const [queuedExercises, setQueuedExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    exercise_id: '',
    day_number: '1',
    sets: '3',
    reps: '10',
    rest_time: '60',
  });

  const loadPlanContext = async () => {
    try {
      const res = await getTrainingPlans();
      const plans = normalizeTrainingPlans(res.data);
      const plan = plans.find((p) => String(p.id) === String(planId));
      if (plan) setPlanInfo(plan);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPlanExercises = async () => {
    try {
      const res = await getWorkoutExercises(planId);
      setPlanExercises(normalizeWorkoutExercises(res.data));
    } catch (e) {
      console.error(e);
      toast.error('Failed to load current workout exercises.');
    }
  };

  const loadExerciseLibrary = async (search = '') => {
    setLibraryLoading(true);
    try {
      const res = await getExercises(search);
      setExerciseLibrary(res.data?.exercises || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load exercise library.');
    } finally {
      setLibraryLoading(false);
    }
  };

  useEffect(() => {
    if (!planId) return;
    setLoading(true);
    Promise.all([loadPlanContext(), loadPlanExercises(), loadExerciseLibrary()])
      .finally(() => setLoading(false));
  }, [planId]);

  useEffect(() => {
    const timer = setTimeout(() => loadExerciseLibrary(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectedLibraryExercise = exerciseLibrary.find(
    (ex) => String(ex.id) === String(form.exercise_id)
  );

  const getNextSortOrder = (dayNumber) => {
    const inPlan = planExercises.filter((e) => Number(e.day_number) === dayNumber).length;
    const inQueue = queuedExercises.filter((e) => Number(e.day_number) === dayNumber).length;
    return inPlan + inQueue + 1;
  };

  const handleAddToQueue = (e) => {
    e.preventDefault();
    if (!form.exercise_id) {
      toast.error('Select an exercise from the library.');
      return;
    }

    const exercise = exerciseLibrary.find((ex) => String(ex.id) === String(form.exercise_id));
    if (!exercise) return;

    const dayNumber = parseInt(form.day_number, 10);
    if (!dayNumber || dayNumber < 1) {
      toast.error('Day number must be at least 1.');
      return;
    }

    setQueuedExercises((prev) => [
      ...prev,
      {
        exercise_id: exercise.id,
        day_number: dayNumber,
        sort_order: getNextSortOrder(dayNumber),
        sets: parseInt(form.sets, 10) || 3,
        reps: parseInt(form.reps, 10) || 10,
        rest_time: parseInt(form.rest_time, 10) || 60,
        exercise_name: exercise.name,
        exercise_description: exercise.description,
        muscle_name: exercise.muscle_name,
        equipment_name: exercise.equipment_name,
      },
    ]);
    toast.success('Exercise queued for this plan.');
  };

  const handleRemoveQueued = (index) => {
    setQueuedExercises((prev) => prev.filter((_, idx) => idx !== index));
    toast.info('Exercise removed from queue.');
  };

  const handlePublishPlan = async () => {
    if (queuedExercises.length === 0) {
      toast.error('Add at least one exercise to the queue before publishing.');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await addExercisesToPlan(planId, queuedExercises);
      if (res.data?.success) {
        toast.success(res.data.message || 'Training program published successfully!');
        setQueuedExercises([]);
        await loadPlanExercises();
        await loadPlanContext();
        navigate('/specialist/dashboard');
      } else {
        toast.error(res.data?.error || res.data?.message || 'Failed to publish program.');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to publish workout program.'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const planTitle = planInfo?.goal || planInfo?.plan_name || 'Training Program';
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
            <h1 className="fw-black text-gradient display-6 mb-1" style={{ fontWeight: 900 }}>Workout Planner</h1>
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
                  Pick from Exercise Library
                </h3>

                <div className="form-group mb-3">
                  <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Search exercises</label>
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
                    <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Exercise</label>
                    <select
                      name="exercise_id"
                      value={form.exercise_id}
                      onChange={handleInputChange}
                      className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25 py-2"
                      required
                      disabled={libraryLoading}
                    >
                      <option value="">Select an exercise...</option>
                      {exerciseLibrary.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name} ({ex.muscle_name || 'General'}{ex.equipment_name ? ` · ${ex.equipment_name}` : ''})
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

                  <div className="row g-2">
                    <div className="col-4">
                      <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Sets</label>
                      <input
                        type="number"
                        name="sets"
                        value={form.sets}
                        onChange={handleInputChange}
                        min="1"
                        className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25 py-2"
                      />
                    </div>
                    <div className="col-4">
                      <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Reps</label>
                      <input
                        type="number"
                        name="reps"
                        value={form.reps}
                        onChange={handleInputChange}
                        min="1"
                        className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25 py-2"
                      />
                    </div>
                    <div className="col-4">
                      <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Rest (sec)</label>
                      <input
                        type="number"
                        name="rest_time"
                        value={form.rest_time}
                        onChange={handleInputChange}
                        min="0"
                        className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25 py-2"
                      />
                    </div>
                  </div>

                  {selectedLibraryExercise && (
                    <div className="p-3 rounded border border-secondary border-opacity-15 bg-black bg-opacity-25">
                      <p className="text-white small fw-bold m-0">{selectedLibraryExercise.name}</p>
                      <p className="text-secondary small m-0 mt-1">
                        {selectedLibraryExercise.muscle_name}
                        {selectedLibraryExercise.equipment_name ? ` · ${selectedLibraryExercise.equipment_name}` : ''}
                      </p>
                      {selectedLibraryExercise.description && (
                        <p className="text-secondary small m-0 mt-2" style={{ fontSize: '0.75rem' }}>
                          {selectedLibraryExercise.description}
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
                    disabled={libraryLoading || !form.exercise_id}
                  >
                    <Plus size={18} /> Queue Exercise
                  </button>
                </form>
              </div>

              <div className="mt-4 pt-4 border-top border-secondary border-opacity-15">
                <button
                  onClick={handlePublishPlan}
                  disabled={submitLoading || queuedExercises.length === 0}
                  className="btn btn-outline-warning w-100 py-3 fw-black text-uppercase d-flex align-items-center justify-content-center gap-2 hover-lift"
                  style={{
                    borderRadius: '10px',
                    border: '2px solid var(--accent-primary)',
                    fontWeight: 900,
                    letterSpacing: '1px',
                  }}
                >
                  <Save size={18} /> {submitLoading ? 'Publishing...' : 'Publish Workout Program'}
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
                {planExercises.length > 0 && (
                  <div className="mb-5">
                    <h3 className="fw-black text-white mb-4 fs-5 text-uppercase d-flex align-items-center gap-2" style={{ letterSpacing: '1px' }}>
                      <Dumbbell size={18} className="text-success" /> Current Plan Exercises
                    </h3>
                    <div className="d-flex flex-column gap-3">
                      {planExercises.map((ex) => (
                        <ExerciseCard key={ex.workout_exercise_id ?? `${ex.exercise_id}-${ex.day_number}-${ex.sort_order}`} exercise={ex} readOnly />
                      ))}
                    </div>
                  </div>
                )}

                <h3 className="fw-black text-white mb-4 fs-5 text-uppercase d-flex align-items-center gap-2" style={{ letterSpacing: '1px' }}>
                  <Dumbbell size={18} className="text-warning" /> Queued Exercises
                </h3>

                {queuedExercises.length === 0 ? (
                  <div className="text-center py-5 rounded-4" style={{ background: 'rgba(20, 20, 20, 0.45)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span className="text-secondary small">No exercises queued. Pick exercises from the library on the left.</span>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {queuedExercises.map((ex, idx) => (
                      <motion.div
                        key={`${ex.exercise_id}-${ex.day_number}-${idx}`}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <ExerciseCard exercise={ex} onRemove={() => handleRemoveQueued(idx)} />
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

function ExerciseCard({ exercise, onRemove, readOnly = false }) {
  const name = exercise.exercise_name || exercise.name;
  const dayLabel = exercise.day_number ? `Day ${exercise.day_number}` : exercise.day_of_week;
  const description = exercise.exercise_description || exercise.description;

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
          <div className="d-flex gap-2 mb-2 flex-wrap">
            <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded px-2 py-0.5 fw-bold small text-uppercase" style={{ fontSize: '0.6rem' }}>
              {dayLabel}
            </span>
            {exercise.sort_order != null && (
              <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded px-2 py-0.5 fw-bold small" style={{ fontSize: '0.6rem' }}>
                #{exercise.sort_order}
              </span>
            )}
            {exercise.muscle_name && (
              <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded px-2 py-0.5 fw-bold small text-uppercase" style={{ fontSize: '0.6rem' }}>
                {exercise.muscle_name}
              </span>
            )}
          </div>
          <h4 className="fw-black text-white m-0 fs-6">{name}</h4>
          <div className="d-flex gap-3 text-secondary small mt-2 flex-wrap" style={{ fontSize: '0.75rem' }}>
            <span>Sets: <strong className="text-white">{exercise.sets ?? 3}</strong></span>
            <span>Reps: <strong className="text-white">{exercise.reps ?? 10}</strong></span>
            <span>Rest: <strong className="text-white">{exercise.rest_time ?? 60}s</strong></span>
            {exercise.equipment_name && (
              <span>Equipment: <strong className="text-white">{exercise.equipment_name}</strong></span>
            )}
          </div>
        </div>
        {!readOnly && onRemove && (
          <button onClick={onRemove} className="btn btn-link text-danger p-2 hover-lift">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {description && (
        <div className="mt-2.5 p-2 bg-black bg-opacity-20 rounded border border-secondary border-opacity-10 d-flex gap-1.5 align-items-start">
          <Info size={12} className="text-info mt-0.5" />
          <p className="text-secondary small m-0" style={{ fontSize: '0.7rem', lineHeight: '1.4' }}>{description}</p>
        </div>
      )}
    </div>
  );
}

export default TrainerPlanEditor;
