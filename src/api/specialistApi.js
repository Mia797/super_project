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

// Add exercises from the library to a client training plan
export const addExercisesToPlan = (training_plan_id, exercises) =>
  api.post('/training/plans/add-exercises', {
    training_plan_id: Number(training_plan_id),
    exercises: exercises.map((e) => ({
      exercise_id: Number(e.exercise_id),
      day_number: Number(e.day_number ?? 1),
      sort_order: Number(e.sort_order ?? 1),
      sets: Number(e.sets ?? 3),
      reps: Number(e.reps ?? 10),
      rest_time: Number(e.rest_time ?? 60),
    })),
  });

// Add meals from the library to a client nutrition plan
export const addMealsToPlan = (diet_plan_id, meals) =>
  api.post('/nutrition/plans/add-meals', {
    diet_plan_id: Number(diet_plan_id),
    meals: meals.map((m) => ({
      meal_id: Number(m.meal_id),
      day_number: Number(m.day_number),
    })),
  });
