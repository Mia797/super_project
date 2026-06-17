// src/api/adminApi.js
import api from './axios';

// Get admin dashboard stats and recent activities
export const getAdminDashboard = (user) =>
  api.get('/admin/dashboard', {
    headers: {
      'x-user-id': user?.id,
      'x-role': user?.role
    }
  });

// Assign a trainer to a user's subscription plan
export const assignTrainer = (subscriptionId, trainerId) =>
  api.post('/training/plans/assign', { subscriptionId, trainerId });

// Assign a nutritionist to a user's subscription plan
export const assignNutritionist = (subscriptionId, nutritionistId) =>
  api.post('/nutrition/plans/assign', { subscriptionId, nutritionistId });

// Subscriptions / Packages CRUD
export const createSubscription = (planData) =>
  api.post('/subscriptions/create', planData);

export const updateSubscription = (planData) =>
  api.post('/subscriptions/update', planData);

export const deleteSubscription = (planId) =>
  api.post('/subscriptions/delete', {
    id: Number(planId),
    planId: Number(planId),
  });

// Equipment / Machines CRUD
export const createEquipment = (equipmentData) =>
  api.post('/equipment/create', equipmentData);

export const updateEquipment = (equipmentData) =>
  api.post('/equipment/update', equipmentData);

export const deleteEquipment = (equipmentId) =>
  api.post('/equipment/delete', {
    id: Number(equipmentId),
    equipmentId: Number(equipmentId),
  });

// Specialists CRUD
export const createSpecialist = (specialistData) =>
  api.post('/specialists/create', specialistData);

export const updateSpecialist = (specialistData) =>
  //update msh mawgouda fl database
  api.post('/specialists/update', specialistData);

export const deleteTrainer = (userId) =>
  api.post('/trainers/delete', { user_id: Number(userId) });

export const updateAuthUser = (userData) =>
  api.post('/auth/update', userData);

export const getUserDetail = (userId) =>
  api.get('/users/detail', { params: { user_id: Number(userId) } });

export const deleteNutritionist = (userId) =>
  api.post('/nutritionists/delete', { user_id: Number(userId) });

// User Management
export const updateUser = (userData) =>
  api.post('/auth/update-user', userData);

export const deleteUser = (userId) =>
  api.post('/auth/delete-user', {
    user_id: Number(userId),
    userId: Number(userId),
  });
