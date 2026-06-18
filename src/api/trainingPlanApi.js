// src/api/trainingPlanApi.js
import api from './axios';

// Get user's active training plan
export const getUserTrainingPlan = () => api.get('/training/user');

// Training overview — all plans (role-filtered)
export const getTrainingPlans = () => api.get('/training/plans');

// Get list of workout exercises for a given training plan
export const getWorkoutExercises = (planId) =>
  api.get(`/training/workout-exercises?plan_id=${planId}`);

// Cancel a training plan (plan owner)
export const cancelTrainingPlan = (training_plan_id) =>
  api.post('/training/plans/cancel', { training_plan_id: Number(training_plan_id) });

export const normalizeTrainingPlans = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.plans)) return payload.plans;
  if (Array.isArray(payload.training_plans)) return payload.training_plans;
  if (Array.isArray(payload.data?.plans)) return payload.data.plans;
  return [];
};

export const normalizeWorkoutExercises = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.exercises)) return payload.exercises;
  return Object.keys(payload)
    .filter((key) => key !== 'success' && key !== 'message' && !Number.isNaN(Number(key)))
    .map((key) => payload[key]);
};

export const normalizeUserTrainingPlan = (payload) => {
  if (!payload) return { plan: null, exercises: [] };
  const plan = payload.plan || payload.training_plan || null;
  let exercises = [];
  if (Array.isArray(payload.exercises)) {
    exercises = payload.exercises;
  } else if (payload.exercises) {
    exercises = normalizeWorkoutExercises(payload.exercises);
  }
  return { plan, exercises };
};
