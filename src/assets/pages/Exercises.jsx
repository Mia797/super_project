import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Dumbbell, Zap, BookOpen, Info, X, ChevronRight } from 'lucide-react';
import { getExercises } from '../../api/exerciseApi';
import { toast } from 'react-toastify';

function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const res = await getExercises(search, '', '');
      if (res.data?.success) {
        setExercises(res.data.exercises);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load exercise library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchExercises();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const getDifficultyColor = (diff) => {
    const d = (diff || 'Beginner').toLowerCase();
    if (d === 'beginner') return { bg: 'rgba(40, 167, 69, 0.12)', color: '#28a745', border: 'rgba(40, 167, 69, 0.25)' };
    if (d === 'intermediate') return { bg: 'rgba(255, 122, 0, 0.12)', color: '#ff7a00', border: 'rgba(255, 122, 0, 0.25)' };
    return { bg: 'rgba(220, 53, 69, 0.12)', color: '#dc3545', border: 'rgba(220, 53, 69, 0.25)' };
  };

  return (
    <div className="min-vh-100 text-white py-5 px-3" style={{ background: '#0a0a0a' }}>
      <div className="mx-auto" style={{ maxWidth: '1100px' }}>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 pb-4 border-bottom border-secondary border-opacity-15"
        >
          <h1 className="fw-black mb-1" style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            background: 'linear-gradient(135deg, #ff7a00, #ffc107)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            EXERCISE LIBRARY
          </h1>
          <p className="text-secondary small m-0">Master your form with our elite catalog of compound and isolation movements.</p>
        </motion.div>

        {/* Filters Panel */}
        <div className="p-4 mb-4 rounded-4" style={{
          background: 'rgba(18, 18, 18, 0.65)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div className="row g-4 align-items-center">
            {/* Search */}
            <div className="col-12">
              <span className="text-secondary small text-uppercase fw-bold d-block mb-2" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Search Movement</span>
              <div className="position-relative">
                <Search className="position-absolute top-50 translate-middle-y ms-3 text-secondary" size={18} />
                <input
                  type="text"
                  placeholder="Bench Press, Squats, Pull-ups, Chest, Intermediate, Barbell..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-100 py-3 ps-5 pe-4 rounded-3 text-white border-0"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    outline: 'none',
                    fontSize: '0.9rem',
                    transition: 'border-color 0.3s, box-shadow 0.3s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff7a00';
                    e.target.style.boxShadow = '0 0 15px rgba(255, 122, 0, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Exercises Grid */}
        {loading ? (
          <div className="row g-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="col-12 col-md-6 col-lg-4">
                <div className="p-4 h-100 d-flex flex-column justify-content-between" style={{
                  background: 'rgba(18, 18, 18, 0.85)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px'
                }}>
                  <div>
                    <div className="d-flex justify-content-between mb-3">
                      <div className="skeleton" style={{ width: '60px', height: '20px', borderRadius: '20px' }} />
                      <div className="skeleton" style={{ width: '70px', height: '20px', borderRadius: '6px' }} />
                    </div>
                    <div className="skeleton mb-2" style={{ width: '70%', height: '24px' }} />
                    <div className="skeleton mb-2" style={{ width: '90%', height: '16px' }} />
                    <div className="skeleton mb-4" style={{ width: '80%', height: '16px' }} />
                  </div>
                  <div className="pt-3 border-top border-secondary border-opacity-10 d-flex justify-content-between">
                    <div className="skeleton" style={{ width: '80px', height: '16px' }} />
                    <div className="skeleton" style={{ width: '60px', height: '16px' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            No movements match your current filters. Try adjusting search criteria.
          </div>
        ) : (
          <div className="row g-4">
            {exercises.map((ex, idx) => {
              const diffCfg = getDifficultyColor(ex.difficulty || 'Beginner');
              const categoryStr = ex.category || ex.muscle_name || 'General';
              const equipmentStr = ex.equipment || ex.equipment_name || 'Bodyweight';
              return (
                <div key={ex.id || idx} className="col-12 col-md-6 col-lg-4">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.02, borderColor: 'rgba(255,122,0,0.35)', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}
                    onClick={() => setSelectedExercise(ex)}
                    className="p-4 h-100 d-flex flex-column justify-content-between cursor-pointer"
                    style={{
                      background: 'rgba(18, 18, 18, 0.85)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <span className="badge px-3 py-2 fw-black text-uppercase" style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          color: '#fff',
                          borderRadius: '20px',
                          fontSize: '0.62rem',
                          letterSpacing: '0.5px'
                        }}>
                          {categoryStr}
                        </span>
                        
                        <span className="badge px-2.5 py-1.5 fw-bold" style={{
                          background: diffCfg.bg,
                          color: diffCfg.color,
                          border: `1px solid ${diffCfg.border}`,
                          borderRadius: '6px',
                          fontSize: '0.65rem'
                        }}>
                          {ex.difficulty || 'Beginner'}
                        </span>
                      </div>

                      <h4 className="fw-black text-white mb-2 fs-5">{ex.name}</h4>
                      <p className="text-secondary small mb-4 line-clamp-2" style={{ lineHeight: '1.5' }}>
                        {ex.description}
                      </p>
                    </div>

                    <div className="d-flex align-items-center justify-content-between pt-3 border-top border-secondary border-opacity-10 text-secondary small">
                      <span>Equip: <strong className="text-white">{equipmentStr.split(',')[0]}</strong></span>
                      <span className="text-warning fw-bold d-flex align-items-center gap-1">
                        View Guides <ChevronRight size={14} />
                      </span>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedExercise && (
          <div className="modal-backdrop-custom" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px'
          }} onClick={() => setSelectedExercise(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="p-5 text-white w-100 overflow-auto scrollbar-hidden position-relative"
              style={{
                maxWidth: '680px',
                maxHeight: '90vh',
                background: '#121212',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
              }}
            >
              <button 
                onClick={() => setSelectedExercise(null)}
                className="position-absolute btn btn-link text-white opacity-40 hover-opacity-100 p-0"
                style={{ top: '24px', right: '24px' }}
              >
                <X size={24} />
              </button>

              <div className="d-flex align-items-center gap-2 mb-2 text-warning fw-bold small text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.72rem' }}>
                <Dumbbell size={14} />
                {selectedExercise.category || selectedExercise.muscle_name || 'General'} Catalog
              </div>

              <h2 className="fw-black text-white mb-3 display-6">{selectedExercise.name}</h2>

              {/* Stats Box */}
              <div className="row g-2 mb-4">
                <div className="col-4">
                  <div className="p-3 text-center rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-secondary d-block small mb-1" style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>Difficulty</span>
                    <strong style={{ color: getDifficultyColor(selectedExercise.difficulty || 'Beginner').color, fontSize: '0.8rem' }}>{selectedExercise.difficulty || 'Beginner'}</strong>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 text-center rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-secondary d-block small mb-1" style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>Equipment</span>
                    <strong className="text-white" style={{ fontSize: '0.8rem' }}>{(selectedExercise.equipment || selectedExercise.equipment_name || 'Bodyweight').split(',')[0]}</strong>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 text-center rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-secondary d-block small mb-1" style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>Min Time</span>
                    <strong className="text-warning" style={{ fontSize: '0.8rem' }}>{selectedExercise.duration || 10} mins</strong>
                  </div>
                </div>
              </div>

              <p className="text-secondary mb-4" style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>{selectedExercise.description}</p>

              {/* Instructions split */}
              <h5 className="fw-black text-white text-uppercase mb-3" style={{ letterSpacing: '0.5px' }}>Form Execution Steps</h5>
              <div className="d-flex flex-column gap-3 mb-4">
                {(Array.isArray(selectedExercise.instructions) 
                  ? selectedExercise.instructions 
                  : typeof selectedExercise.instructions === 'string'
                    ? selectedExercise.instructions.split('\n').filter(Boolean)
                    : [selectedExercise.description || 'Perform this exercise with controlled movements and proper form.']
                ).map((step, idx) => (
                  <div key={idx} className="d-flex gap-3 align-items-start">
                    <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(255,122,0,0.15)',
                      border: '1px solid rgba(255,122,0,0.3)',
                      color: '#ff7a00',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {idx + 1}
                    </div>
                    <p className="text-secondary small m-0 pt-0.5" style={{ lineHeight: '1.5' }}>{step}</p>
                  </div>
                ))}
              </div>

              {/* Pro Tips */}
              {(selectedExercise.tips || selectedExercise.description) && (
                <div className="p-3.5 rounded-3 d-flex gap-2.5 align-items-start" style={{
                  background: 'rgba(255,122,0,0.03)',
                  border: '1px solid rgba(255,122,0,0.2)'
                }}>
                  <Info size={16} className="text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-warning small d-block fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>Pro Tip / Form Cue</span>
                    <p className="text-secondary small m-0" style={{ lineHeight: '1.5' }}>{selectedExercise.tips || selectedExercise.description}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Exercises;
