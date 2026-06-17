// // src/api/exerciseApi.js
// import api from './axios';

// // Curated high-quality exercise library fallbacks


// // Fetch exercises (with optional filters)
// export const getExercises = async (search = '', category = '', difficulty = '') => {
//   try {
//     const params = new URLSearchParams();
//     if (search) params.append('search', search);
//     if (category) params.append('category', category);
//     if (difficulty) params.append('difficulty', difficulty);

//     const res = await api.get(`/exercises?${params.toString()}`);
//     return res;
//   } catch (error) {
//     console.warn('Backend exercise endpoint failed or missing. Using curated client library.');
//     // Perform client-side filtering on fallback data
//     let filtered = [...defaultExercises];
    
//     if (search) {
//       const q = search.toLowerCase();
//       filtered = filtered.filter(e => 
//         e.name.toLowerCase().includes(q) || 
//         e.description.toLowerCase().includes(q)
//       );
//     }
    
//     if (category) {
//       filtered = filtered.filter(e => e.category.toLowerCase() === category.toLowerCase());
//     }
    
//     if (difficulty) {
//       filtered = filtered.filter(e => e.difficulty.toLowerCase() === difficulty.toLowerCase());
//     }

//     return {
//       data: {
//         success: true,
//         exercises: filtered
//       }
//     };
//   }
// };
// src/api/exerciseApi.js
// src/api/exerciseApi.js
// src/api/exerciseApi.js
import api from './axios';

// Fetch exercises from backend
export const getExercises = async (search = '', category = '', difficulty = '') => {
  try {
    const params = new URLSearchParams();

    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);

    // ❌ IMPORTANT: no /api هنا
    const res = await api.get(`/exercises?${params.toString()}`);

    return res;
  } catch (error) {
    console.error('❌ Error fetching exercises:', error.response?.data || error.message);

    return {
      data: {
        success: false,
        exercises: []
      }
    };
  }
};