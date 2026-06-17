// src/api/subscriptionApi.js
import api from './axios';

const userHeaders = (user) => ({
  headers: {
    'x-user-id': user?.id,
    'x-role': user?.role
  }
});

// Get list of all subscription plans (catalog)
export const getSubscriptions = () => api.get('/subscriptions');

// Purchase a subscription plan for the logged-in user
export const purchaseSubscription = (payload, user) =>
  api.post('/subscriptions/purchase', payload, userHeaders(user));

// Get the logged-in user's subscriptions with status
export const getUserSubscriptions = (user) =>
  api.get('/subscriptions/user', userHeaders(user));

// Admin: create a new subscription plan
export const createSubscriptionPlan = (payload) =>
  api.post('/subscriptions/create', payload);

// Get AI plans for the logged-in user
export const getAIPlans = (user) =>
  api.get('/subscriptions/ai-plans', userHeaders(user));

const parseMaybeJson = (value) => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const looksLikePlan = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Boolean(
    value.id ||
    value.inbody ||
    value.ai_plan ||
    value.inbody_data ||
    value.ai_plan_data ||
    value.created_at ||
    value.goal ||
    value.calories ||
    value.workout_plan ||
    Array.isArray(value.plan)
  );
};

const coerceToPlanArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((item) => item && typeof item === 'object');
  if (typeof value === 'string') return coerceToPlanArray(parseMaybeJson(value));
  if (looksLikePlan(value)) return [value];

  if (typeof value === 'object') {
    const values = Object.values(value).filter((item) => item && typeof item === 'object');
    if (values.length && values.every(looksLikePlan)) return values;
  }

  return [];
};

const normalizePlanRecord = (plan) => {
  if (!plan || typeof plan !== 'object') return null;
  if (typeof plan === 'string') return normalizePlanRecord(parseMaybeJson(plan));

  const inbody = parseMaybeJson(plan.inbody ?? plan.inbody_data ?? plan.inbodyData);
  const ai_plan = parseMaybeJson(
    plan.ai_plan ?? plan.ai_plan_data ?? plan.aiPlan ?? plan.ai_plan_json
  );

  const inbodyFields = ['goal', 'weight', 'height', 'age', 'gender', 'body_fat', 'muscle_mass', 'water_perc'];
  const flatInbody = Object.fromEntries(
    inbodyFields.filter((field) => plan[field] != null).map((field) => [field, plan[field]])
  );
  const normalizedInbody =
    inbody && typeof inbody === 'object' && Object.keys(inbody).length
      ? inbody
      : Object.keys(flatInbody).length
        ? flatInbody
        : undefined;

  const aiPlanFields = ['calories', 'protein', 'carbs', 'fat', 'plan', 'workout_plan'];
  const flatAIPlan = Object.fromEntries(
    aiPlanFields.filter((field) => plan[field] != null).map((field) => [field, plan[field]])
  );
  const normalizedAIPlan =
    ai_plan && typeof ai_plan === 'object' && Object.keys(ai_plan).length
      ? ai_plan
      : Object.keys(flatAIPlan).length
        ? flatAIPlan
        : undefined;

  return {
    ...plan,
    id: plan.id ?? plan.plan_id ?? plan.ai_plan_id,
    inbody: normalizedInbody,
    ai_plan: normalizedAIPlan,
  };
};

const extractPlansOnce = (payload) => {
  if (!payload) return [];

  if (Array.isArray(payload)) return coerceToPlanArray(payload);
  if (typeof payload !== 'object') return [];

  const { data } = payload;

  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    return (
      (Array.isArray(data.plans) && data.plans) ||
      (Array.isArray(data.ai_plans) && data.ai_plans) ||
      (Array.isArray(data.items) && data.items) ||
      (Array.isArray(data.list) && data.list) ||
      (Array.isArray(data.result) && data.result) ||
      coerceToPlanArray(data)
    );
  }

  return (
    (Array.isArray(payload.plans) && payload.plans) ||
    (Array.isArray(payload.ai_plans) && payload.ai_plans) ||
    coerceToPlanArray(payload)
  );
};

const findPlansDeep = (payload, depth = 0) => {
  if (!payload || depth > 6) return [];

  const direct = extractPlansOnce(payload);
  if (direct.length) return direct;

  if (typeof payload === 'object' && !Array.isArray(payload)) {
    for (const value of Object.values(payload)) {
      if (!value || typeof value !== 'object') continue;
      const found = findPlansDeep(value, depth + 1);
      if (found.length) return found;
    }
  }

  return [];
};

export const normalizeAIPlans = (payload) => {
  const rawPlans = findPlansDeep(payload);
  return rawPlans.map(normalizePlanRecord).filter(Boolean);
};
