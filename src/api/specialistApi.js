// src/api/specialistApi.js
import api from './axios';

export const SPECIALIST_BOOKING_TOKENS = 10;

// Get specialist stats and client plans
export const getSpecialistDashboard = () => api.get('/specialists/dashboard');

// Get nutrition plans assigned to the logged-in nutritionist that are still in planning
export const getNutritionPlans = () => api.get('/nutrition/plans');

// Book a trainer (charges SPECIALIST_BOOKING_TOKENS from balance)
export const bookTrainer = ({ trainer_id, goal, description }) =>
  api.post('/trainers/book', {
    trainer_id: Number(trainer_id),
    ...(goal ? { goal } : {}),
    ...(description ? { description } : {}),
  });

// Book a nutritionist (charges SPECIALIST_BOOKING_TOKENS from balance)
export const bookNutritionist = ({ nutritionist_id, goal, description }) =>
  api.post('/nutritionists/book', {
    nutritionist_id: Number(nutritionist_id),
    ...(goal ? { goal } : {}),
    ...(description ? { description } : {}),
  });

// Update biography, experience years, and achievements
export const updateSpecialistProfile = (profileData) =>
  api.post('/auth/specialist-profile', profileData);

// Add exercise splits to a client training plan
export const addExercisesToPlan = (planId, exercises) =>
  api.post('/training/plans/add-exercises', { planId, exercises });

// Add meal splits to a client nutrition plan
export const addMealsToPlan = (planId, meals) =>
  api.post('/nutrition/plans/add-meals', { planId, meals });
