import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";

import Navbar from "./assets/pages/Navbar";
import Footer from "./assets/pages/Footer";

// Lazy-loaded page components for bundle code splitting
const Home = lazy(() => import("./assets/pages/Home"));
const Login = lazy(() => import("./assets/pages/Login"));
const Register = lazy(() => import("./assets/pages/Register"));
const Trainers = lazy(() => import("./assets/pages/Trainers"));
const Nutritionists = lazy(() => import("./assets/pages/Nutritionists"));
const Machines = lazy(() => import("./assets/pages/Machines"));
const Dashboard = lazy(() => import("./assets/pages/Dashboard"));
const AdminManagement = lazy(() => import("./assets/pages/AdminManagement"));
const SpecialistDashboard = lazy(() => import("./assets/pages/SpecialistDashboard"));
const SpecialistClientPlans = lazy(() => import("./assets/pages/SpecialistClientPlans"));
const TrainerPlanEditor = lazy(() => import("./assets/pages/TrainerPlanEditor"));
const NutritionistPlanEditor = lazy(() => import("./assets/pages/NutritionistPlanEditor"));
const SpecialistProfile = lazy(() => import("./assets/pages/SpecialistProfile"));
const Profile = lazy(() => import("./assets/pages/Profile"));
const ProfileEdit = lazy(() => import("./assets/pages/ProfileEdit"));
const Subscriptions = lazy(() => import("./assets/pages/Subscriptions"));
const MySubscriptions = lazy(() => import("./assets/pages/MySubscriptions"));
const AIPlans = lazy(() => import("./assets/pages/AIPlans"));
const Wallet = lazy(() => import("./assets/pages/Wallet"));
const BookingHistory = lazy(() => import("./assets/pages/BookingHistory"));
const TrainingPlanDetail = lazy(() => import("./assets/pages/TrainingPlanDetail"));
const NutritionPlanDetail = lazy(() => import("./assets/pages/NutritionPlanDetail"));
const Sessions = lazy(() => import("./assets/pages/Sessions"));
const MySessions = lazy(() => import("./assets/pages/MySessions"));
const Exercises = lazy(() => import("./assets/pages/Exercises"));
const Meals = lazy(() => import("./assets/pages/Meals"));
const NotFound = lazy(() => import("./assets/pages/NotFound"));

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <SubscriptionProvider>
          <BrowserRouter>
            <div className="app-container">
              <Navbar />
              <main className="main-content">
                <Suspense fallback={
                  <div className="min-vh-100 text-center py-5 d-flex align-items-center justify-content-center" style={{ background: '#0a0a0a' }}>
                    <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }} />
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/trainers" element={<Trainers />} />
                    <Route path="/nutritionists" element={<Nutritionists />} />
                    <Route path="/machines" element={<Machines />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin/management" element={<AdminManagement />} />
                    <Route path="/specialist/dashboard" element={<SpecialistDashboard />} />
                    <Route path="/specialist/clients" element={<SpecialistClientPlans />} />
                    <Route path="/specialist/plan/:planId/workout" element={<TrainerPlanEditor />} />
                    <Route path="/specialist/plan/:planId/meals" element={<NutritionistPlanEditor />} />
                    <Route path="/specialist/profile/edit" element={<SpecialistProfile />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/edit" element={<ProfileEdit />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/my-subscriptions" element={<MySubscriptions />} />
                    <Route path="/ai-plans" element={<AIPlans />} />
                    <Route path="/wallet" element={<Wallet />} />
                    <Route path="/bookings/history" element={<BookingHistory />} />
                    <Route path="/training/:planId" element={<TrainingPlanDetail />} />
                    <Route path="/nutrition/:planId" element={<NutritionPlanDetail />} />
                    <Route path="/sessions" element={<Sessions />} />
                    <Route path="/my-sessions" element={<MySessions />} />
                    <Route path="/exercises" element={<Exercises />} />
                    <Route path="/meals" element={<Meals />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
          <ToastContainer position="top-right" theme="dark" autoClose={3000} />
        </SubscriptionProvider>
      </WalletProvider>
    </AuthProvider>
  );
}

export default App;