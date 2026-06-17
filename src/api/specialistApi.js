// src/api/specialistApi.js
import api from './axios';

export const SPECIALIST_BOOKING_TOKENS = 10;

// Get specialist dashboard stats (role-specific fields)
export const getSpecialistDashboard = () => api.get('/specialists/dashboard');

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

// Add meals from the library to a client nutrition plan
export const addMealsToPlan = (diet_plan_id, meals) =>
  api.post('/nutrition/plans/add-meals', {
    diet_plan_id: Number(diet_plan_id),
    meals: meals.map((m) => ({
      meal_id: Number(m.meal_id),
      day_number: Number(m.day_number),
    })),
  });
