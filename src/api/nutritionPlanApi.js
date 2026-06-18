// src/api/nutritionPlanApi.js
import api from './axios';

// Get user's active nutrition plan
export const getUserNutritionPlan = () => api.get('/nutrition/user');

// Diet overview — all plans (role-filtered)
export const getNutritionPlans = () => api.get('/nutrition/plans');

// Get list of diet meals for a given nutrition plan
export const getDietMeals = (planId) =>
  api.get(`/nutrition/diet-meals?plan_id=${planId}`);

// Cancel a diet plan (plan owner)
export const cancelNutritionPlan = (diet_plan_id) =>
  api.post('/nutrition/plans/cancel', { diet_plan_id: Number(diet_plan_id) });

export const normalizeNutritionPlans = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.plans)) return payload.plans;
  if (Array.isArray(payload.nutrition_plans)) return payload.nutrition_plans;
  if (Array.isArray(payload.diet_plans)) return payload.diet_plans;
  if (Array.isArray(payload.data?.plans)) return payload.data.plans;
  return [];
};

export const normalizeDietMeals = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.meals)) return payload.meals;
  return Object.keys(payload)
    .filter((key) => key !== 'success' && key !== 'message' && !Number.isNaN(Number(key)))
    .map((key) => payload[key]);
};

export const normalizeUserNutritionPlan = (payload) => {
  if (!payload) return { plan: null, meals: [] };
  const plan = payload.plan || payload.diet_plan || null;
  let meals = [];
  if (Array.isArray(payload.meals)) {
    meals = payload.meals;
  } else if (payload.meals) {
    meals = normalizeDietMeals(payload.meals);
  }
  return { plan, meals };
};
