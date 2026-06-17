import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Configure Axios defaults
// axios.defaults.baseURL = 'https://test.oralpharm.com'; // Removed to use Vite proxy
axios.defaults.withCredentials = true;

const AUTH_USER_STORAGE_KEY = 'goldfit_auth_user';
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

const normalizeUser = (user) => {
  if (!user?.id) return null;

  return {
    ...user,
    role: user.role_name || user.role || 'user',
    firstName: user.name ? user.name.split(' ')[0] : '',
  };
};

const syncAuthState = (authUser) => {
  if (!USE_MOCK_AUTH) {
    if (authUser?.id) {
      window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(authUser));
      return;
    }

    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return;
  }

  if (authUser?.id) {
    axios.defaults.headers.common['x-user-id'] = String(authUser.id);
    axios.defaults.headers.common['x-role'] = authUser.role || 'user';
    window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(authUser));
    return;
  }

  delete axios.defaults.headers.common['x-user-id'];
  delete axios.defaults.headers.common['x-role'];
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  console.log("AuthContext mounted → checking session...");

  const checkSession = async () => {
    let storedUser = null;

    try {
      storedUser = normalizeUser(
        JSON.parse(window.localStorage.getItem(AUTH_USER_STORAGE_KEY) || 'null')
      );

      console.log("Stored user from localStorage:", storedUser);
    } catch (error) {
      console.error('Failed to read saved auth user:', error);
    }

    if (storedUser) {
      console.log("Using stored user");
      syncAuthState(storedUser);
      setUser(storedUser);
    }

    try {
      const response = await axios.get('/api/auth/profile');

      console.log("Profile API response:", response.data);

      if (response.data && response.data.user && response.data.user.id) {
        const loggedInUser = normalizeUser(response.data.user);

        console.log("Logged-in user from API:", loggedInUser);

        syncAuthState(loggedInUser);
        setUser(loggedInUser);
      }
    } catch (error) {
      console.error("Profile request failed:", error);

      if (!storedUser) {
        syncAuthState(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  checkSession();
}, []);

  const refreshUser = async () => {
    try {
      const response = await axios.get('/api/auth/profile');
      if (response.data && response.data.user && response.data.user.id) {
        const loggedInUser = normalizeUser(response.data.user);
        syncAuthState(loggedInUser);
        setUser(loggedInUser);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const login = async (email, password) => {
    try {
      // The API expects 'email' and 'password'
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      if (response.data && response.data.message === 'Login successful' && response.data.user?.id) {
          const loggedInUser = normalizeUser(response.data.user);
          syncAuthState(loggedInUser);
          setUser(loggedInUser);
          return { success: true, user: loggedInUser, redirectPath: response.data.redirectPath };
      }
      return { success: false, message: response.data?.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      // The API expects name, email, password, phone, age, gender, address
      const apiPayload = {
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        email: userData.email,
        password: userData.password,
        phone: userData.phone || '0000000000', // Default if missing
        age: parseInt(userData.age) || 18,
        gender: userData.gender || 'male',
        address: userData.address || 'Not Provided',
        role: userData.role || 'user'
      };

      const response = await axios.post('/api/auth/register', apiPayload);
      if (response.data && (response.data.message === 'User registered successfully' || response.data.id)) {
        return { success: true, message: 'Registration successful' };
      }
      return { success: false, message: response.data?.message || response.data?.error || 'Registration failed' };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || error.response?.data?.message || 'Registration failed' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.post('/api/auth/update', profileData);
      if (response.data) {
        await refreshUser();
        return { success: true, message: response.data.message || 'Profile updated successfully' };
      }
      return { success: false, message: 'Update failed' };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || error.response?.data?.message || 'Update failed' };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      syncAuthState(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateProfile, loading, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
