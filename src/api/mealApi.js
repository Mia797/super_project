// src/api/mealApi.js
import api from './axios';

// Curated high-performance recipes / meal plan catalog fallbacks
export const defaultMeals = [
  // Bulking (High Calorie / Heavy Compound Fuel)
  {
    id: 'meal-1',
    name: 'Gladiator Beef & Rice Skillet',
    goal: 'Bulking',
    calories: 680,
    protein: 45,
    carbs: 60,
    fats: 15,
    prepTime: '20 mins',
    description: 'A heavy-duty clean bulking staple loaded with lean beef, jasmine rice, and healthy micronutrients to fuel maximum recovery.',
    ingredients: [
      '200g Lean Ground Beef (93/7)',
      '1.5 cups Cooked Jasmine Rice',
      '1/2 cup Bell Peppers (chopped)',
      '1/4 cup Low-Sodium Beef Broth',
      '1 tbsp Olive Oil',
      'Garlic powder, salt, and black pepper to taste'
    ],
    instructions: [
      'Heat olive oil in a large skillet over medium-high heat.',
      'Add ground beef and chopped bell peppers, cooking until beef is fully browned.',
      'Drain excess fat if necessary, then add seasonings (garlic, salt, pepper).',
      'Pour in the jasmine rice and beef broth, stirring continuously for 3-5 minutes until heated through and broth is fully absorbed.',
      'Serve hot in a bowl and garnish with green onions if desired.'
    ]
  },
  {
    id: 'meal-2',
    name: 'Powerhouse Oats & Peanut Butter Bowl',
    goal: 'Bulking',
    calories: 580,
    protein: 26,
    carbs: 68,
    fats: 20,
    prepTime: '10 mins',
    description: 'A high-calorie, carb-dense breakfast bowl packed with complex carbs, fiber, and premium proteins.',
    ingredients: [
      '1 cup Rolled Oats',
      '1.5 cups Whole Milk (or Almond Milk)',
      '1 scoop Whey Protein (Chocolate/Vanilla)',
      '2 tbsp Organic Peanut Butter',
      '1/2 cup Sliced Banana',
      '1 tsp Honey'
    ],
    instructions: [
      'Combine rolled oats and milk in a pot, bringing it to a light boil over medium heat.',
      'Reduce heat and simmer for 5 minutes, stirring occasionally until oats are thick and creamy.',
      'Remove from heat and let cool for 1 minute, then vigorously stir in the protein powder.',
      'Transfer to a bowl, swirl in the peanut butter, and top with sliced bananas and a drizzle of honey.'
    ]
  },
  {
    id: 'meal-3',
    name: 'Avocado & Salmon Quinoa Plate',
    goal: 'Bulking',
    calories: 630,
    protein: 38,
    carbs: 45,
    fats: 24,
    prepTime: '25 mins',
    description: 'Rich in Omega-3 fatty acids, amino acids, and high-quality complex carbohydrates for clean mass gains.',
    ingredients: [
      '150g Grilled Salmon Fillet',
      '1 cup Cooked Quinoa',
      '1/2 Medium Avocado (sliced)',
      '1 cup Steamed Broccoli',
      '1 tbsp Lemon Juice',
      'Sea salt and dill to taste'
    ],
    instructions: [
      'Season the salmon fillet with sea salt, dill, and lemon juice.',
      'Grill or pan-sear the salmon for 4-5 minutes per side until it flakes easily with a fork.',
      'Place cooked quinoa as the base of the plate.',
      'Arrange the salmon, broccoli, and fresh avocado slices on top, then serve.'
    ]
  },

  // Cutting (Low Calorie / High Protein)
  {
    id: 'meal-4',
    name: 'Lemon Herb Grilled Chicken & Asparagus',
    goal: 'Cutting',
    calories: 340,
    protein: 42,
    carbs: 12,
    fats: 6,
    prepTime: '15 mins',
    description: 'The ultimate cutting classic. Low in fat and carbs, but packed with lean chicken breast protein to preserve muscle tissue.',
    ingredients: [
      '180g Boneless Skinless Chicken Breast',
      '10-12 Asparagus Spears',
      '1 tsp Olive Oil',
      '1/2 Lemon (squeezed)',
      'Italian seasoning, garlic salt, paprika'
    ],
    instructions: [
      'Butterfly the chicken breast and season both sides with Italian seasoning, garlic salt, and paprika.',
      'Toss asparagus in olive oil, salt, and pepper.',
      'Heat a grill pan over medium-high heat and grill chicken for 5-6 minutes on each side.',
      'Grill the asparagus alongside the chicken for 3-4 minutes until tender-crisp.',
      'Plate the chicken and asparagus, and squeeze fresh lemon juice over everything before serving.'
    ]
  },
  {
    id: 'meal-5',
    name: 'Shredder\'s Egg White & Spinach Omelet',
    goal: 'Cutting',
    calories: 220,
    protein: 32,
    carbs: 6,
    fats: 3,
    prepTime: '8 mins',
    description: 'An incredibly high-protein, calorie-sparse breakfast to jumpstart your metabolism during a fat-loss cycle.',
    ingredients: [
      '1 cup Liquid Egg Whites',
      '1 Whole Large Egg',
      '1 cup Fresh Spinach (chopped)',
      '1/4 cup Mushrooms (sliced)',
      'Cooking Spray (zero calorie olive oil spray)'
    ],
    instructions: [
      'Spray a non-stick skillet with cooking spray and heat over medium.',
      'Sauté the spinach and mushrooms for 2 minutes until softened.',
      'Whisk the liquid egg whites and whole egg together in a bowl, then pour into the skillet over the vegetables.',
      'Cook for 3-4 minutes until the edges are firm, carefully flip, and cook for another 1-2 minutes.',
      'Fold in half and serve immediately.'
    ]
  },

  // Maintenance (Balanced Fuel / Body Recomposition)
  {
    id: 'meal-6',
    name: 'Harvest Sweet Potato & Turkey Skillet',
    goal: 'Maintenance',
    calories: 450,
    protein: 36,
    carbs: 35,
    fats: 10,
    prepTime: '20 mins',
    description: 'An exceptionally balanced, nutrient-rich dish suitable for body recomposition and steady energy.',
    ingredients: [
      '150g Lean Ground Turkey (93/7)',
      '1 cup Sweet Potato (diced into small cubes)',
      '1/2 cup Zucchini (sliced)',
      '1 tsp Coconut Oil',
      'Smoked paprika, onion powder, cumin, salt'
    ],
    instructions: [
      'Microwave the diced sweet potatoes for 2 minutes to soften them slightly.',
      'Melt coconut oil in a pan, add sweet potatoes, and cook for 5 minutes until lightly browned.',
      'Add ground turkey and seasonings, cooking and breaking up the meat for 6-8 minutes.',
      'Toss in sliced zucchini and cook for another 3 minutes until tender. Serve hot.'
    ]
  },
  {
    id: 'meal-7',
    name: 'Greek Yogurt Protein Berry Parfait',
    goal: 'Maintenance',
    calories: 320,
    protein: 25,
    carbs: 30,
    fats: 4,
    prepTime: '5 mins',
    description: 'A creamy, high-protein dessert or mid-day snack featuring slow-digesting casein from Greek yogurt.',
    ingredients: [
      '1 cup Non-Fat Plain Greek Yogurt',
      '1/2 cup Mixed Berries (blueberries, raspberries)',
      '1/4 cup Low-Fat Granola',
      '1 tbsp Chia Seeds',
      '2 drops Liquid Stevia (optional)'
    ],
    instructions: [
      'Place half of the Greek yogurt in a glass or bowl, and mix in stevia if desired.',
      'Add a layer of mixed berries and half of the granola.',
      'Top with the remaining Greek yogurt, followed by the rest of the berries, granola, and a sprinkle of chia seeds.'
    ]
  }
];

// Fetch meals (with optional filters)
export const getMeals = async (search = '', goal = '') => {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (goal) params.append('goal', goal);

    const res = await api.get(`/meals?${params.toString()}`);
    
    if (!res.data || typeof res.data !== 'object') {
      throw new Error('Invalid response data');
    }

    let mealsList = [];
    if (Array.isArray(res.data.meals)) {
      mealsList = res.data.meals;
    } else if (Array.isArray(res.data)) {
      mealsList = res.data;
    } else {
      const keys = Object.keys(res.data).filter(key => !isNaN(key));
      if (keys.length > 0) {
        mealsList = keys.map(key => res.data[key]);
      } else {
        throw new Error('No meals found in response');
      }
    }
    
    return {
      data: {
        success: true,
        meals: mealsList
      }
    };
  } catch (error) {
    console.warn('Backend meals endpoint failed or missing. Using curated client library.');
    // Perform client-side filtering on fallback data
    let filtered = [...defaultMeals];
    
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(m => 
        (m.name && m.name.toLowerCase().includes(q)) || 
        (m.description && m.description.toLowerCase().includes(q)) ||
        (m.goal && m.goal.toLowerCase().includes(q)) ||
        (m.meal_type && m.meal_type.toLowerCase().includes(q)) ||
        (m.ingredients && m.ingredients.some(i => i.toLowerCase().includes(q)))
      );
    }
    
    if (goal) {
      filtered = filtered.filter(m => m.goal.toLowerCase() === goal.toLowerCase());
    }

    return {
      data: {
        success: true,
        meals: filtered
      }
    };
  }
};
