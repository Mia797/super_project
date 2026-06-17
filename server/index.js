// server/index.js
// Simple Express backend to illustrate role handling for registration
// This file is a minimal example; integrate with your existing backend as needed.

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} - Body:`, req.body);
  next();
});

// In-memory store for demo purposes
const users = [
  { id: 1, name: 'Demo User', email: 'user@goldfit.local', password: 'password', balance: 500, role: 'user', createdAt: new Date() },
  { id: 2, name: 'Admin User', email: 'admin@goldfit.local', password: 'password', balance: 0, role: 'admin', createdAt: new Date() },
  { id: 3, name: 'Demo Trainer', email: 'trainer@goldfit.local', password: 'password', balance: 0, role: 'trainer', createdAt: new Date() },
  { id: 4, name: 'Demo Nutritionist', email: 'nutritionist@goldfit.local', password: 'password', balance: 0, role: 'nutritionist', createdAt: new Date() }
];

let currentUserId = 1;

const specialistProfiles = {
  3: {
    bio: 'Strength coach focused on progressive overload and sustainable performance.',
    experience_years: 7,
    achievements: ['NASM Certified', 'Powerlifting Specialist']
  },
  4: {
    bio: 'Sports nutritionist specializing in practical meal planning and body recomposition.',
    experience_years: 6,
    achievements: ['Precision Nutrition L2', 'ISSN Sports Nutrition Coach']
  }
};

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, age, gender, address, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields (email, password, role).' });
  }
  // Simple duplicate check
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already registered.' });
  }
  const newUser = {
    id: users.length + 1,
    name: name || `${email.split('@')[0]}`,
    email,
    password, // NOTE: In production hash passwords!
    phone: phone || '',
    age: age || null,
    gender: gender || 'male',
    address: address || '',
    role: role || 'user',
    createdAt: new Date()
  };
  users.push(newUser);
  if (newUser.role === 'trainer' || newUser.role === 'nutritionist') {
    specialistProfiles[newUser.id] = {
      bio: '',
      experience_years: 1,
      achievements: []
    };
  }
  // Return a minimal success payload
  res.status(201).json({ message: 'User registered successfully', id: newUser.id, role: newUser.role });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  currentUserId = user.id;
  // In a real app issue a JWT or session cookie
  const redirectPath =
    user.role === 'admin'
      ? '/admin/dashboard'
      : ['trainer', 'nutritionist'].includes(user.role)
        ? '/specialist/dashboard'
        : '/profile';

  res.json({
    message: 'Login successful',
    redirectPath,
    user: { id: user.id, name: user.name, role: user.role, email: user.email }
  });
});

app.get('/api/auth/profile', (req, res) => {
  const { userId } = getUser(req);
  const resolvedUserId = userId || currentUserId;
  const user = users.find(entry => entry.id === resolvedUserId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { ...user, role_name: user.role } });
});

// Mock Database for Exercises and Meals
const mockExercises = [
  {
    id: 1,
    name: 'Barbell Bench Press',
    category: 'Chest',
    muscle_name: 'Chest',
    difficulty: 'Intermediate',
    equipment: 'Barbell, Bench',
    equipment_name: 'Barbell, Bench',
    duration: 10,
    description: 'The bench press is a classic upper-body exercise that targets the chest, shoulders, and triceps.',
    instructions: [
      'Lie flat on your back on a bench.',
      'Grip the barbell with hands slightly wider than shoulder-width apart.',
      'Lower the bar slowly to your chest while keeping your elbows at a 45-degree angle.',
      'Push the bar back up powerfully to the starting position, extending your arms fully.'
    ],
    tips: 'Ensure your feet remain flat on the floor and maintain a slight arch in your lower back. Do not bounce the bar off your chest.'
  },
  {
    id: 2,
    name: 'Push-ups',
    category: 'Chest',
    muscle_name: 'Chest',
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    equipment_name: 'Bodyweight',
    duration: 5,
    description: 'A fundamental bodyweight exercise that builds chest, shoulder, and core strength.',
    instructions: [
      'Start in a plank position with hands slightly wider than shoulder-width.',
      'Keep your body in a straight line from head to heels.',
      'Lower your chest toward the floor by bending your elbows.',
      'Push through your palms to return to the starting position.'
    ],
    tips: 'Keep your core braced and prevent your hips from sagging or rising too high.'
  },
  {
    id: 3,
    name: 'Incline Dumbbell Press',
    category: 'Chest',
    muscle_name: 'Chest',
    difficulty: 'Intermediate',
    equipment: 'Dumbbells, Incline Bench',
    equipment_name: 'Dumbbells, Incline Bench',
    duration: 8,
    description: 'Targets the upper chest (clavicular head) and anterior deltoids.',
    instructions: [
      'Set an incline bench to approximately 30-45 degrees.',
      'Sit back with a dumbbell in each hand, resting them on your thighs.',
      'Kick the weights up to shoulder height and press them straight up.',
      'Lower the weights slowly until they are in line with your upper chest, then press back up.'
    ],
    tips: 'Control the descent phase. Do not let the dumbbells touch at the top to maintain tension on the upper chest.'
  },
  {
    id: 4,
    name: 'Pull-ups',
    category: 'Back',
    muscle_name: 'Back / Lats',
    difficulty: 'Intermediate',
    equipment: 'Pull-up Bar',
    equipment_name: 'Pull-up Bar',
    duration: 8,
    description: 'A premier compound exercise for building upper back width and lat strength.',
    instructions: [
      'Hang from a pull-up bar with an overhand grip, hands wider than shoulders.',
      'Depress your shoulder blades and brace your core.',
      'Pull your chest up toward the bar, driving your elbows down toward your sides.',
      'Lower yourself slowly with control until your arms are fully extended.'
    ],
    tips: 'Focus on pulling with your elbows rather than your hands to maximize lat engagement.'
  },
  {
    id: 5,
    name: 'Bent-Over Barbell Row',
    category: 'Back',
    muscle_name: 'Back / Rhomboids',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    equipment_name: 'Barbell',
    duration: 10,
    description: 'Builds upper back thickness, targeting the lats, rhomboids, and traps.',
    instructions: [
      'Hold a barbell with an overhand grip, feet shoulder-width apart.',
      'Hinge at your hips, keeping your back flat and knees slightly bent.',
      'Pull the bar toward your lower chest, keeping your elbows close to your body.',
      'Lower the bar slowly back to the starting position.'
    ],
    tips: 'Avoid using momentum or standing up as you lift the weight. Keep your spine neutral.'
  },
  {
    id: 6,
    name: 'Barbell Back Squat',
    category: 'Legs',
    muscle_name: 'Legs / Quads',
    difficulty: 'Intermediate',
    equipment: 'Barbell, Squat Rack',
    equipment_name: 'Barbell, Squat Rack',
    duration: 12,
    description: 'The king of lower-body exercises, targeting the quadriceps, glutes, and hamstrings.',
    instructions: [
      'Rest the barbell across your upper back/traps and stand feet shoulder-width apart.',
      'Hinge at your hips and bend your knees to lower your body, keeping your chest up.',
      'Squat down until thighs are parallel to the floor or lower.',
      'Drive through your heels to return to the starting position.'
    ],
    tips: 'Keep your knees aligned with your toes and do not allow them to collapse inward.'
  }
];

const mockMeals = [
  {
    id: '1',
    name: 'Gladiator Beef & Rice Skillet',
    goal: 'Bulking',
    meal_type: 'Bulking Fuel',
    calories: '680',
    protein: '45',
    carbs: '60',
    fats: '15',
    fat: '15',
    serving_size: '350',
    prepTime: '20 mins',
    description: 'A heavy-duty clean bulking staple loaded with lean beef, jasmine rice, and healthy micronutrients to fuel maximum recovery.',
    ingredients: [
      '200g Lean Ground Beef (93/7)',
      '1.5 cups Cooked Jasmine Rice',
      '1/2 cup Bell Peppers (chopped)',
      '1/4 cup Low-Sodium Beef Broth',
      '1 tbsp Olive Oil'
    ],
    preparation_steps: 'Heat olive oil. Cook beef and peppers. Add seasoning, rice, and broth. Simmer for 5 mins.',
    instructions: [
      'Heat olive oil in a large skillet over medium-high heat.',
      'Add ground beef and chopped bell peppers, cooking until beef is fully browned.',
      'Drain excess fat if necessary, then add seasonings (garlic, salt, pepper).',
      'Pour in the jasmine rice and beef broth, stirring continuously for 3-5 minutes until heated through.'
    ]
  },
  {
    id: '2',
    name: 'Powerhouse Oats & PB Bowl',
    goal: 'Bulking',
    meal_type: 'Breakfast',
    calories: '580',
    protein: '26',
    carbs: '68',
    fats: '20',
    fat: '20',
    serving_size: '250',
    prepTime: '10 mins',
    description: 'A high-calorie, carb-dense breakfast bowl packed with complex carbs, fiber, and premium proteins.',
    ingredients: [
      '1 cup Rolled Oats',
      '1.5 cups Whole Milk',
      '1 scoop Whey Protein',
      '2 tbsp Organic Peanut Butter'
    ],
    preparation_steps: 'Boil oats in milk. Cool for 1 min. Mix in protein. Top with peanut butter and honey.',
    instructions: [
      'Combine rolled oats and milk in a pot, bringing it to a light boil over medium heat.',
      'Reduce heat and simmer for 5 minutes, stirring occasionally.',
      'Remove from heat, let cool, and stir in whey protein.',
      'Top with peanut butter and sliced bananas.'
    ]
  },
  {
    id: '3',
    name: 'Lemon Herb Grilled Chicken',
    goal: 'Cutting',
    meal_type: 'Cutting Split',
    calories: '340',
    protein: '42',
    carbs: '12',
    fats: '6',
    fat: '6',
    serving_size: '200',
    prepTime: '15 mins',
    description: 'The ultimate cutting classic. Low in fat and carbs, but packed with lean chicken breast protein.',
    ingredients: [
      '180g Boneless Skinless Chicken Breast',
      '10-12 Asparagus Spears',
      '1 tsp Olive Oil',
      '1/2 Lemon (squeezed)'
    ],
    preparation_steps: 'Grill butterfly chicken 5-6 min per side. Grill asparagus 3 min. Serve with fresh lemon squeeze.',
    instructions: [
      'Butterfly the chicken breast and season with spices.',
      'Grill chicken for 5-6 minutes on each side.',
      'Grill the asparagus alongside the chicken for 3-4 minutes.',
      'Squeeze lemon juice over chicken and asparagus before serving.'
    ]
  }
];

// GET Exercises Library API
app.get('/api/exercises', (req, res) => {
  const { search, category, difficulty } = req.query;
  let filtered = [...mockExercises];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
    );
  }

  if (category) {
    const cat = category.toLowerCase();
    filtered = filtered.filter(e =>
      (e.category && e.category.toLowerCase() === cat) ||
      (e.muscle_name && e.muscle_name.toLowerCase().includes(cat))
    );
  }

  if (difficulty) {
    const diff = difficulty.toLowerCase();
    filtered = filtered.filter(e =>
      e.difficulty && e.difficulty.toLowerCase() === diff
    );
  }

  res.json({
    success: true,
    message: 'Exercises retrieved successfully',
    exercises: filtered
  });
});

// GET Meals Library API
app.get('/api/meals', (req, res) => {
  const { search, goal } = req.query;
  let filtered = [...mockMeals];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.preparation_steps.toLowerCase().includes(q) ||
      (m.ingredients && m.ingredients.some(ing => ing.toLowerCase().includes(q)))
    );
  }

  if (goal) {
    const g = goal.toLowerCase();
    filtered = filtered.filter(m =>
      (m.goal && m.goal.toLowerCase() === g) ||
      (m.meal_type && m.meal_type.toLowerCase() === g)
    );
  }

  // Convert the array into an object with numeric keys for compatibility
  const responseData = {
    success: true,
    message: 'Meals retrieved successfully',
    meals: filtered
  };

  filtered.forEach((meal, index) => {
    responseData[index.toString()] = meal;
  });

  res.json(responseData);
});
// In‑memory subscription data store
const subscriptionPlans = [
  {
    id: 1,
    name: 'Premium Both',
    description: 'Gym + Diet combo package',
    plan_type: 'both', // diet | gym | both
    price: 199.99
  }
];

const equipmentInventory = [
  {
    id: 1,
    name: 'Treadmill X2',
    description: 'Cardio treadmill with live heart-rate metrics.',
    status: 'available',
    booking_price: 25,
    image_url: ''
  },
  {
    id: 2,
    name: 'Cable Station Pro',
    description: 'Multi-function cable machine for full-body workouts.',
    status: 'busy',
    booking_price: 30,
    image_url: ''
  },
  {
    id: 3,
    name: 'Leg Press Elite',
    description: 'Heavy-duty lower body machine for quad and glute focus.',
    status: 'maintenance',
    booking_price: 28,
    image_url: ''
  }
];

const nutritionPlanMeals = {
  2001: [],
  2002: [
    {
      id: 1,
      meal_name: 'Greek Yogurt Berry Bowl',
      day_of_week: 'Monday',
      time_slot: 'Breakfast',
      calories: 410,
      protein: 32,
      carbs: 38,
      fat: 11,
      instructions: 'Top high-protein yogurt with oats, berries, and chia seeds.'
    },
    {
      id: 2,
      meal_name: 'Salmon Rice Power Plate',
      day_of_week: 'Monday',
      time_slot: 'Lunch',
      calories: 620,
      protein: 42,
      carbs: 55,
      fat: 24,
      instructions: 'Serve grilled salmon with rice and roasted vegetables.'
    }
  ]
};

const trainingPlanExercises = {
  1002: [
    {
      id: 1,
      day_of_week: 'Monday',
      muscle_group: 'Push',
      exercise_name: 'Barbell Bench Press',
      sets: 4,
      reps: '8-10'
    }
  ]
};

const userSubscriptions = [
  {
    id: 1,
    userId: 1,
    userName: 'Demo User',
    userEmail: 'user@goldfit.local',
    planId: 1,
    planName: 'Premium Both',
    amount: 199.99,
    status: 'Planning',
    goal: 'Cutting',
    description: 'Focus on fat loss while preserving lean muscle.',
    purchasedAt: new Date(),
    trainingPlanId: 1001,
    dietPlanId: 2001,
    trainerId: null,
    nutritionistId: 4,
    trainingStatus: 'Pending Assign',
    nutritionStatus: 'Planning'
  },
  {
    id: 2,
    userId: 1,
    userName: 'Demo User',
    userEmail: 'user@goldfit.local',
    planId: 1,
    planName: 'Premium Both',
    amount: 199.99,
    status: 'Active',
    goal: 'Performance',
    description: 'Build power output and improve recovery quality.',
    purchasedAt: new Date(),
    trainingPlanId: 1002,
    dietPlanId: 2002,
    trainerId: 3,
    nutritionistId: 4,
    trainingStatus: 'Pending Assign',
    nutritionStatus: 'Active'
  }
]; // { id, userId, planId, planName, amount, status, trainingPlanId, dietPlanId }
const walletTransactions = [];

// Helper to extract user info from headers (simple auth mock)
function getUser(req) {
  const userId = parseInt(req.headers['x-user-id'] || '0', 10);
  const role = req.headers['x-role'] || 'guest';
  return { userId, role };
}

function getAuthenticatedUser(req) {
  const { userId } = getUser(req);
  const resolvedUserId = userId || currentUserId;
  return users.find(user => user.id === resolvedUserId) || null;
}

function getPlanType(subscription) {
  return subscriptionPlans.find(plan => plan.id === subscription.planId)?.plan_type || 'both';
}

function requiresTrainer(subscription) {
  return ['gym', 'both'].includes(getPlanType(subscription));
}

function requiresNutritionist(subscription) {
  return ['diet', 'both'].includes(getPlanType(subscription));
}

function ensureSpecialistProfile(userId) {
  if (!specialistProfiles[userId]) {
    specialistProfiles[userId] = {
      bio: '',
      experience_years: 1,
      achievements: []
    };
  }

  return specialistProfiles[userId];
}

function deriveOverallStatus(subscription) {
  const statuses = [subscription.trainingStatus, subscription.nutritionStatus].filter(Boolean);

  if (statuses.includes('Planning')) return 'Planning';
  if (statuses.includes('Active')) return 'Active';
  if (statuses.includes('Pending Assign')) return 'Pending Assign';
  if (statuses.includes('Assigned')) return 'Assigned';

  return subscription.status || 'Pending Assign';
}

function syncSubscriptionStatus(subscription) {
  subscription.status = deriveOverallStatus(subscription);
  return subscription.status;
}

function buildSpecialistPlan(subscription, type) {
  const statusKey = type === 'nutritionist' ? 'nutritionStatus' : 'trainingStatus';
  const planIdKey = type === 'nutritionist' ? 'dietPlanId' : 'trainingPlanId';

  return {
    id: subscription.id,
    subscription_id: subscription.id,
    plan_id: subscription[planIdKey],
    user_id: subscription.userId,
    user_name: subscription.userName || 'Gym Member',
    user_email: subscription.userEmail || 'member@goldfit.local',
    plan_name: subscription.planName || 'Subscription Plan',
    goal: subscription.goal || '',
    description: subscription.description || '',
    status: String(subscription[statusKey] || subscription.status || 'Planning').toLowerCase()
  };
}

function listSpecialists(role) {
  return users
    .filter(user => user.role === role)
    .map(user => {
      const profile = ensureSpecialistProfile(user.id);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: profile.bio,
        experience_years: profile.experience_years,
        achievements: profile.achievements,
        image_url: ''
      };
    });
}

function findSubscriptionByPlanId(planId, type) {
  return userSubscriptions.find(subscription =>
    Number(type === 'nutritionist' ? subscription.dietPlanId : subscription.trainingPlanId) === Number(planId)
  );
}

function removeItemsInPlace(collection, predicate) {
  for (let index = collection.length - 1; index >= 0; index -= 1) {
    if (predicate(collection[index])) {
      collection.splice(index, 1);
    }
  }
}

function updateSpecialistAssignments(userId, role) {
  userSubscriptions.forEach(subscription => {
    if (role === 'trainer' && subscription.trainerId === userId) {
      subscription.trainerId = null;
      if (requiresTrainer(subscription)) {
        subscription.trainingStatus = 'Pending Assign';
      }
    }

    if (role === 'nutritionist' && subscription.nutritionistId === userId) {
      subscription.nutritionistId = null;
      if (requiresNutritionist(subscription)) {
        subscription.nutritionStatus = 'Pending Assign';
      }
    }

    syncSubscriptionStatus(subscription);
  });
}

function serializeUser(user) {
  return {
    ...user,
    role_name: user.role
  };
}

function assignSpecialistToSubscription(subscription, type, specialistId) {
  if (type === 'nutritionist') {
    subscription.nutritionistId = specialistId;
    // Set status to Planning when a specialist is assigned, unless it's already Active
    subscription.nutritionStatus = subscription.nutritionStatus === 'Active' ? 'Active' : 'Planning';
  } else {
    subscription.trainerId = specialistId;
    // Set status to Planning when a trainer is assigned, unless it's already Active
    subscription.trainingStatus = subscription.trainingStatus === 'Active' ? 'Active' : 'Planning';
  }

  syncSubscriptionStatus(subscription);
  return subscription;
}

// Specialist dashboard endpoint
app.get('/api/specialists/dashboard', (req, res) => {
  const currentUser = getAuthenticatedUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Authentication required' });
  if (!['trainer', 'nutritionist'].includes(currentUser.role)) {
    return res.status(403).json({ error: 'Specialist account required' });
  }

  const statusKey = currentUser.role === 'nutritionist' ? 'nutritionStatus' : 'trainingStatus';
  const assignedPlans = userSubscriptions
    .filter(subscription =>
      currentUser.role === 'nutritionist'
        ? subscription.nutritionistId === currentUser.id
        : subscription.trainerId === currentUser.id
    )
    .map(subscription => buildSpecialistPlan(subscription, currentUser.role));

  const activeClients = assignedPlans.filter(plan => ['planning', 'active'].includes(plan.status)).length;
  const activeStatuses = userSubscriptions.filter(subscription =>
    currentUser.role === 'nutritionist'
      ? subscription.nutritionistId === currentUser.id && ['Planning', 'Active'].includes(subscription[statusKey])
      : subscription.trainerId === currentUser.id && ['Planning', 'Active'].includes(subscription[statusKey])
  );

  res.json({
    success: true,
    active_clients: activeClients,
    rating: currentUser.role === 'nutritionist' ? 4.8 : 4.9,
    earnings: activeStatuses.length * (currentUser.role === 'nutritionist' ? 180 : 220),
    specialist_profile: ensureSpecialistProfile(currentUser.id),
    client_plans: assignedPlans
  });
});

// Specialist profile update
app.post('/api/auth/specialist-profile', (req, res) => {
  const currentUser = getAuthenticatedUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Authentication required' });
  if (!['trainer', 'nutritionist'].includes(currentUser.role)) {
    return res.status(403).json({ error: 'Specialist account required' });
  }

  const profile = ensureSpecialistProfile(currentUser.id);
  const { bio, achievements, experience_years } = req.body;

  specialistProfiles[currentUser.id] = {
    bio: bio ?? profile.bio,
    achievements: Array.isArray(achievements) ? achievements : profile.achievements,
    experience_years: experience_years ?? profile.experience_years
  };

  res.json({
    success: true,
    message: 'Specialist profile updated successfully',
    profile: specialistProfiles[currentUser.id]
  });
});

app.get('/api/trainers', (_req, res) => {
  res.json({ success: true, trainers: listSpecialists('trainer') });
});

app.get('/api/nutritionists', (_req, res) => {
  res.json({ success: true, nutritionists: listSpecialists('nutritionist') });
});

app.post('/api/specialists/create', (req, res) => {
  const currentUser = getAuthenticatedUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Authentication required' });
  if (currentUser.role !== 'admin') return res.status(403).json({ error: 'Admin required' });

  const { name, email, password, role_name, phone, bio } = req.body;
  const role = role_name || req.body.role;
  if (!name || !email || !password || !['trainer', 'nutritionist'].includes(role)) {
    return res.status(400).json({ error: 'name, email, password, and valid role_name are required' });
  }
  if (users.some(user => user.email === email)) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  const newUser = {
    id: users.length ? Math.max(...users.map(user => user.id)) + 1 : 1,
    name,
    email,
    password,
    phone: phone || '',
    age: null,
    gender: 'male',
    address: '',
    balance: 0,
    role,
    createdAt: new Date()
  };

  users.push(newUser);
  specialistProfiles[newUser.id] = {
    bio: bio || '',
    experience_years: 1,
    achievements: []
  };

  res.json({
    success: true,
    message: 'Specialist created successfully',
    specialist: listSpecialists(role).find(specialist => specialist.id === newUser.id)
  });
});

app.post('/api/specialists/update', (req, res) => {
  const currentUser = getAuthenticatedUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Authentication required' });
  if (currentUser.role !== 'admin') return res.status(403).json({ error: 'Admin required' });

  const userId = Number(req.body.id || req.body.user_id || req.body.userId);
  const specialist = users.find(user => user.id === userId);
  if (!specialist || !['trainer', 'nutritionist'].includes(specialist.role)) {
    return res.status(404).json({ error: 'Specialist not found' });
  }

  const nextRole = req.body.role_name || req.body.role || specialist.role;
  if (!['trainer', 'nutritionist'].includes(nextRole)) {
    return res.status(400).json({ error: 'Invalid specialist role' });
  }
  if (req.body.email && users.some(user => user.email === req.body.email && user.id !== specialist.id)) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  const previousRole = specialist.role;
  if (req.body.name !== undefined) specialist.name = req.body.name;
  if (req.body.email !== undefined) specialist.email = req.body.email;
  if (req.body.phone !== undefined) specialist.phone = req.body.phone;
  if (req.body.password) specialist.password = req.body.password;
  specialist.role = nextRole;

  const profile = ensureSpecialistProfile(specialist.id);
  if (req.body.bio !== undefined) profile.bio = req.body.bio;
  if (req.body.experience_years !== undefined) profile.experience_years = req.body.experience_years;
  if (req.body.achievements !== undefined) {
    profile.achievements = Array.isArray(req.body.achievements) ? req.body.achievements : profile.achievements;
  }

  if (previousRole !== nextRole) {
    updateSpecialistAssignments(specialist.id, previousRole);
  }

  res.json({
    success: true,
    message: 'Specialist updated successfully',
    specialist: listSpecialists(nextRole).find(entry => entry.id === specialist.id)
  });
});

app.post('/api/trainers/delete', (req, res) => {
  const currentUser = getAuthenticatedUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Authentication required' });
  if (currentUser.role !== 'admin') return res.status(403).json({ error: 'Admin required' });

  const userId = Number(req.body.user_id || req.body.userId || req.body.id);
  const index = users.findIndex(user => user.id === userId && user.role === 'trainer');
  if (index === -1) return res.status(404).json({ error: 'Trainer not found' });

  updateSpecialistAssignments(userId, 'trainer');
  delete specialistProfiles[userId];
  users.splice(index, 1);

  res.json({ success: true, message: 'Trainer deleted successfully' });
});

app.post('/api/nutritionists/delete', (req, res) => {
  const currentUser = getAuthenticatedUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Authentication required' });
  if (currentUser.role !== 'admin') return res.status(403).json({ error: 'Admin required' });

  const userId = Number(req.body.user_id || req.body.userId || req.body.id);
  const index = users.findIndex(user => user.id === userId && user.role === 'nutritionist');
  if (index === -1) return res.status(404).json({ error: 'Nutritionist not found' });

  updateSpecialistAssignments(userId, 'nutritionist');
  delete specialistProfiles[userId];
  users.splice(index, 1);

  res.json({ success: true, message: 'Nutritionist deleted successfully' });
});

app.get('/api/training/plans', (req, res) => {
  const currentUser = getAuthenticatedUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Authentication required' });

  const pendingPlans = userSubscriptions.filter(sub =>
    sub.userId === currentUser.id &&
    requiresTrainer(sub) &&
    !sub.trainerId
  );

  res.json({
    success: true,
    plans: pendingPlans.map(sub => ({
      id: sub.id,
      planName: sub.planName,
      goal: sub.goal,
      description: sub.description,
      status: sub.status
    }))
  });
});

app.post('/api/training/plans/assign', (req, res) => {
  const currentUser = getAuthenticatedUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Authentication required' });

  const trainerId = Number(req.body.trainerId);
  const subscriptionId = Number(req.body.subscriptionId || req.body.subscription_id);
  const trainer = users.find(user => user.id === trainerId && user.role === 'trainer');
  if (!trainer) return res.status(404).json({ error: 'Trainer not found' });

  const subscription = userSubscriptions.find(entry =>
    subscriptionId ? entry.id === subscriptionId : entry.userId === currentUser.id && requiresTrainer(entry) && !entry.trainerId
  );
  if (!subscription) return res.status(404).json({ error: 'Training subscription not found' });
  if (!requiresTrainer(subscription)) return res.status(400).json({ error: 'Selected subscription has no training plan' });

  assignSpecialistToSubscription(subscription, 'trainer', trainerId);
  res.json({ success: true, message: 'Trainer assigned successfully', subscription });
});

app.post('/api/nutrition/plans/assign', (req, res) => {
  const currentUser = getAuthenticatedUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Authentication required' });

  const nutritionistId = Number(req.body.nutritionistId);
  const subscriptionId = Number(req.body.subscriptionId || req.body.subscription_id);
  const nutritionist = users.find(user => user.id === nutritionistId && user.role === 'nutritionist');
  if (!nutritionist) return res.status(404).json({ error: 'Nutritionist not found' });

  const subscription = userSubscriptions.find(entry =>
    subscriptionId ? entry.id === subscriptionId : entry.userId === currentUser.id && requiresNutritionist(entry) && !entry.nutritionistId
  );
  if (!subscription) return res.status(404).json({ error: 'Nutrition subscription not found' });
  if (!requiresNutritionist(subscription)) return res.status(400).json({ error: 'Selected subscription has no nutrition plan' });

  assignSpecialistToSubscription(subscription, 'nutritionist', nutritionistId);
  nutritionPlanMeals[subscription.dietPlanId] = nutritionPlanMeals[subscription.dietPlanId] || [];

  res.json({
    success: true,
    message: 'Nutritionist assigned successfully',
    plan: buildSpecialistPlan(subscription, 'nutritionist'),
    subscription
  });
});

// Add exercises to training plan
app.post('/api/training/plans/add-exercises', (req, res) => {
  const currentUser = getAuthenticatedUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Authentication required' });

  const planId = Number(req.body.planId);
  const exercises = Array.isArray(req.body.exercises) ? req.body.exercises : [];
  const subscription = findSubscriptionByPlanId(planId, 'trainer');

  if (!subscription) return res.status(404).json({ error: 'Training plan not found' });
  if (currentUser.role === 'trainer' && subscription.trainerId !== currentUser.id) {
    return res.status(403).json({ error: 'This training plan is not assigned to you' });
  }

  trainingPlanExercises[planId] = exercises.map((exercise, index) => ({
    id: index + 1,
    ...exercise
  }));
  subscription.trainingStatus = exercises.length ? 'Active' : 'Planning';
  syncSubscriptionStatus(subscription);

  res.json({
    success: true,
    message: 'Exercises successfully published to plan',
    planId,
    count: exercises.length
  });
});

app.get('/api/nutrition/plans', (req, res) => {
  const currentUser = getAuthenticatedUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Authentication required' });
  if (currentUser.role !== 'nutritionist') {
    return res.status(403).json({ error: 'Nutritionist account required' });
  }

  const plans = userSubscriptions
    .filter(subscription => subscription.nutritionistId === currentUser.id && subscription.nutritionStatus === 'Planning')
    .map(subscription => buildSpecialistPlan(subscription, 'nutritionist'));

  res.json({ success: true, plans });
});

app.get('/api/nutrition/diet-meals', (req, res) => {
  const planId = Number(req.query.plan_id);
  if (!planId) return res.status(400).json({ error: 'plan_id is required' });

  const subscription = findSubscriptionByPlanId(planId, 'nutritionist');
  if (!subscription) return res.status(404).json({ error: 'Nutrition plan not found' });

  res.json({
    success: true,
    plan_id: planId,
    plan_name: subscription.planName || `Nutrition Plan #${planId}`,
    meals: nutritionPlanMeals[planId] || []
  });
});

app.get('/api/nutrition/user', (req, res) => {
  const currentUser = getAuthenticatedUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Authentication required' });

  const plan = [...userSubscriptions]
    .reverse()
    .find(subscription => subscription.userId === currentUser.id && requiresNutritionist(subscription));

  if (!plan) {
    return res.json({ success: true, plan: null });
  }

  res.json({
    success: true,
    plan: {
      subscription_id: plan.id,
      plan_id: plan.dietPlanId,
      plan_name: plan.planName,
      status: String(plan.nutritionStatus || plan.status || 'Planning').toLowerCase(),
      nutritionist_id: plan.nutritionistId
    }
  });
});

// Add meals to nutrition plan
app.post('/api/nutrition/plans/add-meals', (req, res) => {
  const currentUser = getAuthenticatedUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Authentication required' });
  if (currentUser.role !== 'nutritionist') {
    return res.status(403).json({ error: 'Nutritionist account required' });
  }

  const planId = Number(req.body.planId);
  const meals = Array.isArray(req.body.meals) ? req.body.meals : [];
  if (!planId) return res.status(400).json({ error: 'planId is required' });
  if (!meals.length) return res.status(400).json({ error: 'At least one meal is required' });

  const subscription = findSubscriptionByPlanId(planId, 'nutritionist');
  if (!subscription) return res.status(404).json({ error: 'Nutrition plan not found' });
  if (subscription.nutritionistId !== currentUser.id) {
    return res.status(403).json({ error: 'This nutrition plan is not assigned to you' });
  }

  const normalizedMeals = meals.map((meal, index) => {
    const mealName = String(meal?.meal_name || '').trim();
    const dayOfWeek = String(meal?.day_of_week || '').trim();
    const timeSlot = String(meal?.time_slot || '').trim();

    if (!mealName || !dayOfWeek || !timeSlot) {
      return null;
    }

    return {
      id: index + 1,
      meal_name: mealName,
      day_of_week: dayOfWeek,
      time_slot: timeSlot,
      calories: Number(meal?.calories) || 0,
      protein: Number(meal?.protein) || 0,
      carbs: Number(meal?.carbs) || 0,
      fat: Number(meal?.fat) || 0,
      instructions: String(meal?.instructions || '').trim()
    };
  });

  if (normalizedMeals.some(meal => meal === null)) {
    return res.status(400).json({ error: 'Each meal must include meal_name, day_of_week, and time_slot' });
  }

  nutritionPlanMeals[planId] = normalizedMeals;
  subscription.nutritionStatus = 'Active';
  syncSubscriptionStatus(subscription);

  res.json({
    success: true,
    message: 'Meals successfully published to plan',
    planId,
    count: meals.length,
    status: subscription.nutritionStatus
  });
});

// GET all subscription plans (public)
app.get('/api/subscriptions', (req, res) => {
  res.json({ success: true, subscriptions: subscriptionPlans });
});

app.get('/api/equipment', (_req, res) => {
  res.json({ success: true, equipment: equipmentInventory });
});

app.post('/api/equipment/create', (req, res) => {
  const currentUser = getAuthenticatedUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Authentication required' });
  if (currentUser.role !== 'admin') return res.status(403).json({ error: 'Admin required' });

  const { name, description, status, booking_price, image_url } = req.body;
  if (!name) return res.status(400).json({ error: 'Equipment name is required' });

  const equipment = {
    id: equipmentInventory.length ? Math.max(...equipmentInventory.map(item => item.id)) + 1 : 1,
    name,
    description: description || '',
    status: status || 'available',
    booking_price: Number(booking_price) || 0,
    image_url: image_url || ''
  };

  equipmentInventory.push(equipment);
  res.json({ success: true, message: 'Equipment created successfully', equipment });
});

app.post('/api/equipment/update', (req, res) => {
  const currentUser = getAuthenticatedUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Authentication required' });
  if (currentUser.role !== 'admin') return res.status(403).json({ error: 'Admin required' });

  const id = Number(req.body.id || req.body.equipmentId || req.body.equipment_id);
  const equipment = equipmentInventory.find(item => item.id === id);
  if (!equipment) return res.status(404).json({ error: 'Equipment not found' });

  if (req.body.name !== undefined) equipment.name = req.body.name;
  if (req.body.description !== undefined) equipment.description = req.body.description;
  if (req.body.status !== undefined) equipment.status = req.body.status;
  if (req.body.booking_price !== undefined) equipment.booking_price = Number(req.body.booking_price) || 0;
  if (req.body.image_url !== undefined) equipment.image_url = req.body.image_url;

  res.json({ success: true, message: 'Equipment updated successfully', equipment });
});

app.post('/api/equipment/delete', (req, res) => {
  const currentUser = getAuthenticatedUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Authentication required' });
  if (currentUser.role !== 'admin') return res.status(403).json({ error: 'Admin required' });

  const id = Number(req.body.id || req.body.equipmentId || req.body.equipment_id);
  const index = equipmentInventory.findIndex(item => item.id === id);
  if (index === -1) return res.status(404).json({ error: 'Equipment not found' });

  equipmentInventory.splice(index, 1);
  res.json({ success: true, message: 'Equipment deleted successfully' });
});

app.get('/api/users', (req, res) => {
  const currentUser = getAuthenticatedUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Authentication required' });
  if (currentUser.role !== 'admin') return res.status(403).json({ error: 'Admin required' });

  res.json({ success: true, users: users.map(serializeUser) });
});

app.post('/api/auth/update-user', (req, res) => {
  const currentUser = getAuthenticatedUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Authentication required' });
  if (currentUser.role !== 'admin') return res.status(403).json({ error: 'Admin required' });

  const userId = Number(req.body.user_id || req.body.userId || req.body.id);
  const user = users.find(entry => entry.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const nextRole = req.body.role_name || req.body.role || user.role;
  if (req.body.email && users.some(entry => entry.email === req.body.email && entry.id !== user.id)) {
    return res.status(409).json({ error: 'Email already registered.' });
  }
  if (nextRole && !['user', 'admin', 'trainer', 'nutritionist'].includes(nextRole)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const previousRole = user.role;
  if (req.body.name !== undefined) user.name = req.body.name;
  if (req.body.email !== undefined) user.email = req.body.email;
  if (req.body.phone !== undefined) user.phone = req.body.phone;
  if (req.body.address !== undefined) user.address = req.body.address;
  if (req.body.age !== undefined) user.age = req.body.age;
  if (req.body.gender !== undefined) user.gender = req.body.gender;
  if (req.body.password) user.password = req.body.password;
  user.role = nextRole;

  if (['trainer', 'nutritionist'].includes(user.role)) {
    ensureSpecialistProfile(user.id);
    if (req.body.bio !== undefined) {
      specialistProfiles[user.id].bio = req.body.bio;
    }
  } else if (['trainer', 'nutritionist'].includes(previousRole) && !['trainer', 'nutritionist'].includes(user.role)) {
    updateSpecialistAssignments(user.id, previousRole);
    delete specialistProfiles[user.id];
  }

  if (previousRole !== user.role && ['trainer', 'nutritionist'].includes(previousRole) && ['trainer', 'nutritionist'].includes(user.role)) {
    updateSpecialistAssignments(user.id, previousRole);
  }

  res.json({ success: true, message: 'User updated successfully', user: serializeUser(user) });
});

app.post('/api/auth/delete-user', (req, res) => {
  const currentUser = getAuthenticatedUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Authentication required' });
  if (currentUser.role !== 'admin') return res.status(403).json({ error: 'Admin required' });

  const userId = Number(req.body.user_id || req.body.userId || req.body.id);
  const index = users.findIndex(user => user.id === userId);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  if (users[index].role === 'admin' && users[index].id === currentUser.id) {
    return res.status(400).json({ error: 'You cannot delete your own admin account' });
  }

  const user = users[index];
  if (user.role === 'trainer' || user.role === 'nutritionist') {
    updateSpecialistAssignments(user.id, user.role);
    delete specialistProfiles[user.id];
  }

  removeItemsInPlace(userSubscriptions, subscription => subscription.userId === user.id);
  removeItemsInPlace(walletTransactions, transaction => transaction.userId === user.id);
  users.splice(index, 1);

  res.json({ success: true, message: 'User deleted successfully' });
});

app.get('/api/payments/history', (req, res) => {
  const { userId } = getUser(req);
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({
    success: true,
    balance: user.balance || 0,
    transactions: walletTransactions.filter(tx => tx.userId === userId)
  });
});

app.post('/api/payments/deposit', (req, res) => {
  const { userId } = getUser(req);
  if (!userId) return res.status(401).json({ error: 'Authentication required' });

  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid deposit amount' });

  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.balance = (Number(user.balance) || 0) + amount;
  const transaction = {
    id: walletTransactions.length ? walletTransactions[walletTransactions.length - 1].id + 1 : 1,
    userId,
    user_email: user.email,
    description: 'Wallet deposit',
    type: 'deposit',
    amount,
    created_at: new Date()
  };
  walletTransactions.push(transaction);

  res.json({ success: true, balance: user.balance, transaction });
});

// Purchase a subscription plan (any logged‑in user)
app.post('/api/subscriptions/purchase', (req, res) => {
  const { userId, role } = getUser(req);
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  const { plan_id, goal, description } = req.body;
  const plan = subscriptionPlans.find(p => p.id === plan_id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  // Mock user balance handling (assume user object exists in users array)
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.balance < plan.price) return res.status(400).json({ error: 'Insufficient balance' });
  user.balance -= plan.price;
  walletTransactions.push({
    id: walletTransactions.length ? walletTransactions[walletTransactions.length - 1].id + 1 : 1,
    userId,
    user_email: user.email,
    description: `${plan.name} purchase`,
    type: 'purchase',
    amount: Number(plan.price) || 0,
    created_at: new Date()
  });
  const newSub = {
    id: userSubscriptions.length ? userSubscriptions[userSubscriptions.length - 1].id + 1 : 1,
    userId,
    userName: user.name,
    userEmail: user.email,
    planId: plan.id,
    planName: plan.name,
    amount: Number(plan.price) || 0,
    status: 'Pending Assign',
    goal,
    description,
    purchasedAt: new Date(),
    trainingPlanId: plan.plan_type === 'gym' || plan.plan_type === 'both' ? Date.now() + Math.random() : null,
    dietPlanId: plan.plan_type === 'diet' || plan.plan_type === 'both' ? Date.now() + Math.random() : null,
    trainerId: null,
    nutritionistId: null,
    trainingStatus: plan.plan_type === 'gym' || plan.plan_type === 'both' ? 'Pending Assign' : null,
    nutritionStatus: plan.plan_type === 'diet' || plan.plan_type === 'both' ? 'Pending Assign' : null
  };
  syncSubscriptionStatus(newSub);
  if (newSub.dietPlanId) {
    nutritionPlanMeals[newSub.dietPlanId] = [];
  }
  if (newSub.trainingPlanId) {
    trainingPlanExercises[newSub.trainingPlanId] = [];
  }
  userSubscriptions.push(newSub);
  res.json({ success: true, subscription: newSub });
});

// Admin-only dashboard summary
app.get('/api/admin/dashboard', (req, res) => {
  const { role } = getUser(req);
  if (role !== 'admin') return res.status(403).json({ error: 'Admin required' });

  const revenue = userSubscriptions.reduce((total, subscription) => {
    const plan = subscriptionPlans.find(p => p.id === subscription.planId);
    const amount = subscription.amount ?? plan?.price ?? 0;
    return total + (Number(amount) || 0);
  }, 0);

  const activeSubscriptions = userSubscriptions.filter(subscription =>
    ['active', 'planning', 'pending assign', 'assigned', 'pending'].includes(String(subscription.status).toLowerCase())
  );

  const pendingAssignments = userSubscriptions
    .filter(subscription =>
      (requiresTrainer(subscription) && !subscription.trainerId) ||
      (requiresNutritionist(subscription) && !subscription.nutritionistId)
    )
    .map(subscription => {
      const plan = subscriptionPlans.find(p => p.id === subscription.planId);
      const planType = plan?.plan_type || 'both';

      return {
        id: subscription.id,
        subscription_id: subscription.id,
        user_id: subscription.userId,
        user_name: subscription.userName || 'Gym Member',
        plan_name: subscription.planName || plan?.name || 'Subscription Plan',
        has_trainer: planType === 'gym' || planType === 'both' ? 1 : 0,
        has_nutritionist: planType === 'diet' || planType === 'both' ? 1 : 0,
        trainer_id: subscription.trainerId,
        nutritionist_id: subscription.nutritionistId
      };
    });

  const transactions = userSubscriptions.map(subscription => ({
    id: subscription.id,
    user_email: subscription.userEmail || 'member@goldfit.local',
    description: `${subscription.planName || 'Subscription'} purchase`,
    type: 'purchase',
    amount: subscription.amount || 0,
    created_at: subscription.purchasedAt
  }));

  res.json({
    revenue,
    active_subscriptions: activeSubscriptions.length,
    equipment_utilization: 0,
    pending_assignments: pendingAssignments,
    transactions
  });
});

// Get current user's subscriptions (any logged‑in user)
app.get('/api/subscriptions/user', (req, res) => {
  const { userId } = getUser(req);
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  const subs = userSubscriptions.filter(s => s.userId === userId);
  res.json({ success: true, subscriptions: subs });
});

// Admin: create a new subscription plan
app.post('/api/subscriptions/create', (req, res) => {
  const { role } = getUser(req);
  if (role !== 'admin') return res.status(403).json({ error: 'Admin required' });
  const { name, description, plan_type, price } = req.body;
  if (!['diet', 'gym', 'both'].includes(plan_type)) {
    return res.status(400).json({ error: 'Invalid plan_type' });
  }
  const newPlan = {
    id: subscriptionPlans.length ? subscriptionPlans[subscriptionPlans.length - 1].id + 1 : 1,
    name,
    description,
    plan_type,
    price
  };
  subscriptionPlans.push(newPlan);
  res.json({ success: true, plan: newPlan });
});

// Admin: update an existing subscription plan
app.post('/api/subscriptions/update', (req, res) => {
  const { role } = getUser(req);
  if (role !== 'admin') return res.status(403).json({ error: 'Admin required' });
  const { id, name, description, plan_type, price } = req.body;
  const plan = subscriptionPlans.find(p => p.id === id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  if (name !== undefined) plan.name = name;
  if (description !== undefined) plan.description = description;
  if (plan_type !== undefined) {
    if (!['diet', 'gym', 'both'].includes(plan_type)) {
      return res.status(400).json({ error: 'Invalid plan_type' });
    }
    plan.plan_type = plan_type;
  }
  if (price !== undefined) plan.price = price;
  res.json({ success: true, plan });
});

// Admin: delete a subscription plan
app.post('/api/subscriptions/delete', (req, res) => {
  const { role } = getUser(req);
  if (role !== 'admin') return res.status(403).json({ error: 'Admin required' });
  const id = req.body.id || req.body.planId;
  const index = subscriptionPlans.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Plan not found' });
  subscriptionPlans.splice(index, 1);
  res.json({ success: true, message: 'Plan deleted' });
});

app.get('/api/subscriptions/ai-plans', (req, res) => {
  const { userId } = getUser(req);
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  res.json([]);
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
