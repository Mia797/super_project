const ACTIVE_PLAN_STATUSES = ['pending assign', 'planning', 'active', 'assigned', 'pending'];

const isActivePlan = (status) => {
  const normalized = String(status || '').toLowerCase();
  return ACTIVE_PLAN_STATUSES.some((active) => normalized.includes(active));
};

export const extractAssignedTrainers = (subscriptions = []) => {
  const trainers = [];
  const seen = new Set();

  subscriptions.forEach((sub) => {
    if (!isActivePlan(sub.status)) return;

    const trainerId = sub.trainer_id ?? sub.trainerId;
    if (!trainerId || seen.has(Number(trainerId))) return;

    seen.add(Number(trainerId));
    trainers.push({
      id: trainerId,
      name: sub.trainer_name || sub.trainerName || `Trainer #${trainerId}`,
      image_url: sub.trainer_image_url || sub.trainer_image || null
    });
  });

  return trainers;
};

export const extractAssignedNutritionists = (subscriptions = []) => {
  const nutritionists = [];
  const seen = new Set();

  subscriptions.forEach((sub) => {
    if (!isActivePlan(sub.status)) return;

    const nutritionistId = sub.nutritionist_id ?? sub.nutritionistId;
    if (!nutritionistId || seen.has(Number(nutritionistId))) return;

    seen.add(Number(nutritionistId));
    nutritionists.push({
      id: nutritionistId,
      name: sub.nutritionist_name || sub.nutritionistName || `Nutritionist #${nutritionistId}`,
      image_url: sub.nutritionist_image_url || sub.nutritionist_image || null
    });
  });

  return nutritionists;
};

export const clearLegacySpecialistStorage = () => {
  try {
    localStorage.removeItem('bookedTrainers');
    localStorage.removeItem('bookedNutritionists');
  } catch {
    // ignore storage errors
  }
};
