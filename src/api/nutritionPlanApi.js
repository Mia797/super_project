// src/api/nutritionPlanApi.js
import api from './axios';

// Get user's active nutrition plan
export const getUserNutritionPlan = () => api.get('/nutrition/user');

// Diet overview — all plans (role-filtered)
export const getNutritionPlans = () => api.get('/nutrition/plans');

// Get list of diet meals for a given nutrition plan
export const getDietMeals = (planId) =>
  api.get(`/nutrition/diet-meals?plan_id=${planId}`);

export const normalizeNutritionPlans = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.plans)) return payload.plans;
  if (Array.isArray(payload.nutrition_plans)) return payload.nutrition_plans;
  if (Array.isArray(payload.diet_plans)) return payload.diet_plans;
  if (Array.isArray(payload.data?.plans)) return payload.data.plans;
  return [];
};
