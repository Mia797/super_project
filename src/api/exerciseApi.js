import api from './axios';

// Curated high-quality exercise library fallbacks
export const defaultExercises = [
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

// Fetch exercises (with optional filters)
export const getExercises = async (search = '', category = '', difficulty = '') => {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);

    const res = await api.get(`/exercises?${params.toString()}`);

    if (!res.data || typeof res.data !== 'object') {
      throw new Error('Invalid response data');
    }

    let exercisesList = [];
    if (Array.isArray(res.data.exercises)) {
      exercisesList = res.data.exercises;
    } else if (Array.isArray(res.data)) {
      exercisesList = res.data;
    } else {
      const keys = Object.keys(res.data)
        .filter((key) => key !== 'success' && key !== 'message' && !Number.isNaN(Number(key)));
      if (keys.length > 0) {
        exercisesList = keys.map((key) => res.data[key]);
      } else {
        throw new Error('No exercises found in response');
      }
    }

    return {
      data: {
        success: true,
        exercises: exercisesList,
      },
    };
  } catch (error) {
    console.warn('Backend exercise endpoint failed or missing. Using curated client library.');
    let filtered = [...defaultExercises];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(e =>
        (e.name && e.name.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.category && e.category.toLowerCase().includes(q)) ||
        (e.muscle_name && e.muscle_name.toLowerCase().includes(q)) ||
        (e.difficulty && e.difficulty.toLowerCase().includes(q)) ||
        (e.equipment && e.equipment.toLowerCase().includes(q)) ||
        (e.equipment_name && e.equipment_name.toLowerCase().includes(q))
      );
    }

    if (category) {
      filtered = filtered.filter(e => e.category.toLowerCase() === category.toLowerCase());
    }

    if (difficulty) {
      filtered = filtered.filter(e => e.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    return {
      data: {
        success: true,
        exercises: filtered
      }
    };
  }
};