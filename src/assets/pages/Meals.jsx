import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Flame, Utensils, Clock, X, ChevronRight, Heart, Activity } from 'lucide-react';
import { getMeals } from '../../api/mealApi';
import { toast } from 'react-toastify';

function Meals() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  const fetchMeals = async () => {
    setLoading(true);
    try {
      const res = await getMeals(search, '');
      if (res.data?.success) {
        setMeals(res.data.meals);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load meal catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchMeals();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  // Reset ingredients checklist when selected meal changes
  useEffect(() => {
    setCheckedIngredients({});
  }, [selectedMeal]);

  const toggleIngredient = (idx) => {
    setCheckedIngredients(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getGoalConfig = (g) => {
    const gl = typeof g === 'string' ? g.toLowerCase() : 'maintenance';
    if (gl === 'bulking') return { label: 'Bulking Fuel', bg: 'rgba(255, 122, 0, 0.12)', color: '#ff7a00', border: 'rgba(255, 122, 0, 0.25)' };
    if (gl === 'cutting') return { label: 'Cutting Split', bg: 'rgba(40, 167, 69, 0.12)', color: '#28a745', border: 'rgba(40, 167, 69, 0.25)' };
    return { label: g || 'Maintenance Blend', bg: 'rgba(255, 193, 7, 0.12)', color: '#ffc107', border: 'rgba(255, 193, 7, 0.25)' };
  };

  const getMacroPercentage = (macroVal, totalVal) => {
    if (!totalVal) return 0;
    return Math.round((macroVal / totalVal) * 100);
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
            NUTRITION CATALOG
          </h1>
          <p className="text-secondary small m-0">High-performance recipes categorized by fitness goals and detailed macro distributions.</p>
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
              <span className="text-secondary small text-uppercase fw-bold d-block mb-2" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Search Recipes</span>
              <div className="position-relative">
                <Search className="position-absolute top-50 translate-middle-y ms-3 text-secondary" size={18} />
                <input
                  type="text"
                  placeholder="Beef, Oats, Chicken, Avocado, Bulking, Cutting, Oats..."
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

        {/* Recipes Grid */}
        {loading ? (
          <div className="row g-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="col-12 col-md-6">
                <div className="p-4 h-100 d-flex flex-column justify-content-between" style={{
                  background: 'rgba(18, 18, 18, 0.85)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '18px'
                }}>
                  <div>
                    <div className="d-flex justify-content-between mb-3">
                      <div className="skeleton" style={{ width: '90px', height: '22px', borderRadius: '6px' }} />
                      <div className="skeleton" style={{ width: '60px', height: '16px' }} />
                    </div>
                    <div className="skeleton mb-2" style={{ width: '60%', height: '26px' }} />
                    <div className="skeleton mb-4" style={{ width: '90%', height: '16px' }} />
                    
                    <div className="mb-4">
                      <div className="d-flex justify-content-between mb-1.5">
                        <div className="skeleton" style={{ width: '80px', height: '14px' }} />
                        <div className="skeleton" style={{ width: '80px', height: '14px' }} />
                        <div className="skeleton" style={{ width: '80px', height: '14px' }} />
                      </div>
                      <div className="skeleton" style={{ width: '100%', height: '2px', borderRadius: '2px' }} />
                    </div>
                  </div>
                  <div className="pt-3 border-top border-secondary border-opacity-10 d-flex justify-content-between align-items-center">
                    <div className="skeleton" style={{ width: '90px', height: '20px' }} />
                    <div className="skeleton" style={{ width: '80px', height: '16px' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            No recipes matching your parameters. Adjust filters and try again.
          </div>
        ) : (
          <div className="row g-4">
            {meals.map((meal, idx) => {
              const goalCfg = getGoalConfig(meal.goal || meal.meal_type || 'Maintenance');
              const proteinVal = parseFloat(meal.protein) || 0;
              const carbsVal = parseFloat(meal.carbs) || 0;
              const fatsVal = parseFloat(meal.fats || meal.fat) || 0;
              const totalMacros = proteinVal + carbsVal + fatsVal;
              const caloriesVal = parseFloat(meal.calories) || 0;
              const prepTimeStr = meal.prepTime || (meal.serving_size ? `${meal.serving_size}g` : '15 mins');
              const descriptionStr = meal.description || 'A healthy and nutritious option to support your fitness journey.';

              return (
                <div key={meal.id || idx} className="col-12 col-md-6">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    whileHover={{ scale: 1.02, borderColor: 'rgba(255,122,0,0.3)', boxShadow: '0 8px 30px rgba(0,0,0,0.45)' }}
                    onClick={() => setSelectedMeal(meal)}
                    className="p-4 h-100 d-flex flex-column justify-content-between"
                    style={{
                      background: 'rgba(18, 18, 18, 0.85)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '18px',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <div>
                      {/* Badge / Stats Header */}
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <span className="badge px-3 py-1.5 fw-bold" style={{
                          background: goalCfg.bg,
                          color: goalCfg.color,
                          border: `1px solid ${goalCfg.border}`,
                          borderRadius: '6px',
                          fontSize: '0.65rem'
                        }}>
                          {goalCfg.label}
                        </span>

                        <span className="text-secondary small d-flex align-items-center gap-1">
                          <Clock size={13} className="text-warning" /> {prepTimeStr}
                        </span>
                      </div>

                      <h4 className="fw-black text-white mb-2">{meal.name}</h4>
                      <p className="text-secondary small mb-4 line-clamp-2" style={{ lineHeight: '1.5' }}>
                        {descriptionStr}
                      </p>

                      {/* Micro progress bar for macros */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between text-secondary small mb-1.5" style={{ fontSize: '0.68rem' }}>
                          <span>Protein: <strong>{proteinVal}g</strong> ({getMacroPercentage(proteinVal, totalMacros)}%)</span>
                          <span>Carbs: <strong>{carbsVal}g</strong> ({getMacroPercentage(carbsVal, totalMacros)}%)</span>
                          <span>Fats: <strong>{fatsVal}g</strong> ({getMacroPercentage(fatsVal, totalMacros)}%)</span>
                        </div>
                        <div className="d-flex h-2px rounded-pill overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div style={{ width: `${getMacroPercentage(proteinVal, totalMacros)}%`, background: '#ff7a00' }} />
                          <div style={{ width: `${getMacroPercentage(carbsVal, totalMacros)}%`, background: '#28a745' }} />
                          <div style={{ width: `${getMacroPercentage(fatsVal, totalMacros)}%`, background: '#ffc107' }} />
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between pt-3 border-top border-secondary border-opacity-10">
                      <div className="d-flex align-items-center gap-1.5 text-warning small">
                        <Flame size={14} />
                        <strong className="fs-6 text-white">{caloriesVal}</strong> <span className="opacity-60" style={{ fontSize: '0.7rem' }}>kcal</span>
                      </div>
                      <span className="text-warning fw-bold small d-flex align-items-center gap-1">
                        View Recipe <ChevronRight size={14} />
                      </span>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recipe Modal Overlay */}
      <AnimatePresence>
        {selectedMeal && (
          <div className="modal-backdrop-custom" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px'
          }} onClick={() => setSelectedMeal(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="p-5 text-white w-100 overflow-auto scrollbar-hidden position-relative"
              style={{
                maxWidth: '700px',
                maxHeight: '90vh',
                background: '#121212',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
              }}
            >
              <button 
                onClick={() => setSelectedMeal(null)}
                className="position-absolute btn btn-link text-white opacity-40 hover-opacity-100 p-0"
                style={{ top: '24px', right: '24px' }}
              >
                <X size={24} />
              </button>

              <div className="d-flex align-items-center gap-2 mb-2 text-warning fw-bold small text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.72rem' }}>
                <Utensils size={14} />
                {selectedMeal.goal || selectedMeal.meal_type || 'Nutrition'} Recipe
              </div>

              <h2 className="fw-black text-white mb-3 display-6">{selectedMeal.name}</h2>

              {/* Macro breakdown grid */}
              <div className="row g-2 mb-4">
                <div className="col-3">
                  <div className="p-3 text-center rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-secondary d-block small mb-1" style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>Calories</span>
                    <strong className="text-danger" style={{ fontSize: '0.85rem' }}>{parseFloat(selectedMeal.calories) || 0} kcal</strong>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-3 text-center rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-secondary d-block small mb-1" style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>Protein</span>
                    <strong className="text-white" style={{ fontSize: '0.85rem', color: '#ff7a00' }}>{parseFloat(selectedMeal.protein) || 0}g</strong>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-3 text-center rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-secondary d-block small mb-1" style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>Carbs</span>
                    <strong className="text-white" style={{ fontSize: '0.85rem', color: '#28a745' }}>{parseFloat(selectedMeal.carbs) || 0}g</strong>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-3 text-center rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-secondary d-block small mb-1" style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>Fats</span>
                    <strong className="text-white" style={{ fontSize: '0.85rem', color: '#ffc107' }}>{parseFloat(selectedMeal.fats || selectedMeal.fat) || 0}g</strong>
                  </div>
                </div>
              </div>

              <p className="text-secondary mb-4" style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>{selectedMeal.description || 'A healthy and nutritious option to support your fitness journey.'}</p>

              {/* Ingredients Interactive checklist */}
              <h5 className="fw-black text-white text-uppercase mb-3" style={{ letterSpacing: '0.5px' }}>Ingredients Checklist</h5>
              <div className="p-4 rounded-4 mb-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="d-flex flex-column gap-2.5">
                  {(Array.isArray(selectedMeal.ingredients)
                    ? selectedMeal.ingredients
                    : typeof selectedMeal.ingredients === 'string'
                      ? selectedMeal.ingredients.split(',').map(s => s.trim()).filter(Boolean)
                      : ['Healthy main ingredient', 'Aromatic spices and greens', 'Serving of grain/protein source']
                  ).map((ing, idx) => {
                    const isChecked = !!checkedIngredients[idx];
                    return (
                      <div 
                        key={idx} 
                        className="d-flex align-items-center gap-3 cursor-pointer" 
                        onClick={() => toggleIngredient(idx)}
                      >
                        <div className="d-flex align-items-center justify-content-center border" style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          borderColor: isChecked ? '#ff7a00' : 'rgba(255,255,255,0.25)',
                          background: isChecked ? '#ff7a00' : 'transparent',
                          transition: 'all 0.2s',
                          cursor: 'pointer'
                        }}>
                          {isChecked && <span style={{ color: '#000', fontSize: '10px', fontWeight: 'bold' }}>✓</span>}
                        </div>
                        <span className="small text-secondary" style={{
                          textDecoration: isChecked ? 'line-through' : 'none',
                          color: isChecked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
                          transition: 'all 0.2s'
                        }}>
                          {ing}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Directions */}
              <h5 className="fw-black text-white text-uppercase mb-3" style={{ letterSpacing: '0.5px' }}>Cooking Directions</h5>
              <div className="d-flex flex-column gap-3.5">
                {(() => {
                  const instructionsSource = selectedMeal.instructions || selectedMeal.preparation_steps;
                  const instructionsArray = Array.isArray(instructionsSource)
                    ? instructionsSource
                    : typeof instructionsSource === 'string'
                      ? instructionsSource.split('.').map(s => s.trim()).filter(Boolean)
                      : ['Prepare and cook ingredients according to standard clean eating guidelines.', 'Serve warm and monitor your portions to fit your macro goals.'];
                  
                  return instructionsArray.map((step, idx) => (
                    <div key={idx} className="d-flex gap-3 align-items-start">
                      <div className="d-flex align-items-center justify-content-center flex-shrink-0" style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(255,193,7,0.15)',
                        border: '1px solid rgba(255,193,7,0.3)',
                        color: '#ffc107',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}>
                        {idx + 1}
                      </div>
                      <p className="text-secondary small m-0 pt-0.5" style={{ lineHeight: '1.5' }}>{step}</p>
                    </div>
                  ));
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Meals;
