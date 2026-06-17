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

console.log("User API Plans function 123 defined:", getAIPlans.response);
