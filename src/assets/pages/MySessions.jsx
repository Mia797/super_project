import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Dumbbell, Apple, Trash2, Edit2, User, ChevronRight, AlertCircle, Compass, Sparkles, CheckCircle2, TrendingUp, Activity, Shield } from 'lucide-react';
import { Modal, Button, Form, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { cancelBooking, getAllBookings, mapMachineBooking, normalizeBookings } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import {
  extractAssignedTrainers,
  extractAssignedNutritionists,
  clearLegacySpecialistStorage
} from '../../utils/assignedSpecialists';

// Default Sample Scheduled Sessions to show if localStorage is empty
const SAMPLE_SESSIONS = [
  {
    id: 'sample-1',
    name: 'HIIT Firestorm',
    coach: 'Coach Marcus',
    type: 'group',
    category: 'HIIT',
    duration: '45 mins',
    time: '09:00 AM - 09:45 AM',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    intensity: 'High',
    status: 'Upcoming',
    description: 'High-intensity interval training designed to burn maximum calories.'
  },
  {
    id: 'sample-2',
    name: '1-on-1 Personal Training',
    coach: 'Coach Alex',
    type: '1on1',
    category: 'Workout',
    duration: '60 mins',
    time: '04:00 PM - 05:00 PM',
    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days later
    notes: 'Focus on heavy deadlift form and lat engagement.',
    status: 'Upcoming'
  },
  {
    id: 'sample-3',
    name: 'Nutrition Consultation',
    coach: 'Sarah Miller, RD',
    type: '1on1',
    category: 'Nutrition',
    duration: '60 mins',
    time: '11:00 AM - 12:00 PM',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // 2 days ago
    notes: 'Keto adaptation discussion and grocery shopping list setup.',
    status: 'Completed'
  }
];

function MySessions() {
  const { user } = useAuth();
  const { mySubs, fetchMySubs } = useSubscription();
  const navigate = useNavigate();

  // State
  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [bookedMachines, setBookedMachines] = useState([]);
  const [cancellingMachineId, setCancellingMachineId] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past'

  const assignedTrainers = useMemo(() => extractAssignedTrainers(mySubs), [mySubs]);
  const assignedNutritionists = useMemo(() => extractAssignedNutritionists(mySubs), [mySubs]);

  const fetchBookedMachines = async () => {
    try {
      const response = await getAllBookings();
      const bookings = normalizeBookings(response.data);

      const machineBookings = bookings
        .filter((booking) => booking.status?.toLowerCase() !== 'cancelled')
        .map(mapMachineBooking)
        .filter((booking) => booking.booking_id);

      setBookedMachines(machineBookings);
      localStorage.setItem('bookedMachines', JSON.stringify(machineBookings));
      return machineBookings;
    } catch (error) {
      console.error('Failed to fetch booked machines:', error);
      const stored = JSON.parse(localStorage.getItem('bookedMachines') || '[]');
      setBookedMachines(stored);
      return stored;
    }
  };

  const resolveBookingId = async (machine) => {
    if (machine.booking_id) return machine.booking_id;

    const refreshed = await fetchBookedMachines();
    const equipmentId = machine.equipment_id ?? machine.id;
    const match = refreshed.find(
      (booking) =>
        String(booking.equipment_id) === String(equipmentId) ||
        booking.name === machine.name
    );

    return match?.booking_id || null;
  };

  const handleCancelMachineBooking = async (machine) => {
    if (!window.confirm(`Are you sure you want to cancel your booking for ${machine.name}?`)) {
      return;
    }

    const bookingId = await resolveBookingId(machine);
    if (!bookingId) {
      toast.error('Booking ID not found. Unable to cancel.');
      return;
    }

    setCancellingMachineId(bookingId);
    try {
      const response = await cancelBooking(bookingId);
      if (response.data?.success) {
        toast.success(response.data.message || `Cancelled booking for ${machine.name}`);
        await fetchBookedMachines();
      } else {
        toast.error(response.data?.message || 'Failed to cancel booking.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to cancel booking.');
    } finally {
      setCancellingMachineId(null);
    }
  };

  // Reschedule Modal State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [sessionToReschedule, setSessionToReschedule] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00 AM - 10:00 AM');

  // Load and initialize data
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Load from localStorage
    let storedSessions = JSON.parse(localStorage.getItem('scheduledSessions') || '[]');
    
    // If absolutely no sessions (never set before), pre-populate with samples
    if (!localStorage.getItem('scheduledSessions')) {
      storedSessions = SAMPLE_SESSIONS;
      localStorage.setItem('scheduledSessions', JSON.stringify(SAMPLE_SESSIONS));
    }
    
    setScheduledSessions(storedSessions);
    clearLegacySpecialistStorage();
    fetchBookedMachines();

    fetchMySubs();
  }, [user]);

  // Cancel a Session
  const handleCancelSession = (sessionId, sessionName) => {
    if (window.confirm(`Are you sure you want to cancel your booking for ${sessionName}?`)) {
      const updated = scheduledSessions.filter((s) => s.id !== sessionId);
      setScheduledSessions(updated);
      localStorage.setItem('scheduledSessions', JSON.stringify(updated));
      toast.success(`Cancelled reservation for ${sessionName}`);
    }
  };

  // Open Reschedule Modal
  const handleOpenReschedule = (session) => {
    setSessionToReschedule(session);
    setNewDate(session.date);
    setNewTime(session.time);
    setShowRescheduleModal(true);
  };

  // Submit Reschedule
  const handleSubmitReschedule = (e) => {
    e.preventDefault();
    if (!newDate) {
      toast.error('Please pick a date.');
      return;
    }

    const updated = scheduledSessions.map((s) => {
      if (s.id === sessionToReschedule.id) {
        return { ...s, date: newDate, time: newTime, status: 'Upcoming' }; // Reset to upcoming if rescheduled
      }
      return s;
    });

    setScheduledSessions(updated);
    localStorage.setItem('scheduledSessions', JSON.stringify(updated));
    toast.success(`Successfully rescheduled to ${newDate} at ${newTime}`);
    setShowRescheduleModal(false);
  };

  // Check and categorize sessions (Upcoming vs Past)
  const currentDateStr = new Date().toISOString().split('T')[0];
  
  const upcomingSessions = scheduledSessions.filter((s) => {
    // If status is explicitly completed or date is older than today
    if (s.status === 'Completed') return false;
    // For simple weekday strings in group classes (e.g. "Monday"), treat as upcoming
    if (!s.date.includes('-')) return true;
    return s.date >= currentDateStr;
  });

  const pastSessions = scheduledSessions.filter((s) => {
    if (s.status === 'Completed') return true;
    if (!s.date.includes('-')) return false;
    return s.date < currentDateStr;
  });

  const currentTabSessions = activeTab === 'upcoming' ? upcomingSessions : pastSessions;

  // Format Date Helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (!dateStr.includes('-')) return dateStr; // Return weekday names as is
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Get Badge for Session Category
  const getCategoryBadge = (category) => {
    const cat = category ? category.toLowerCase() : 'workout';
    let style = { background: 'rgba(255, 122, 0, 0.1)', border: '1px solid rgba(255, 122, 0, 0.3)', color: '#ff7a00' };
    
    if (cat === 'nutrition') {
      style = { background: 'rgba(155, 89, 182, 0.1)', border: '1px solid rgba(155, 89, 182, 0.3)', color: '#9b59b6' };
    } else if (cat === 'orientation') {
      style = { background: 'rgba(52, 152, 219, 0.1)', border: '1px solid rgba(52, 152, 219, 0.3)', color: '#3498db' };
    } else if (cat === 'hiit') {
      style = { background: 'rgba(231, 76, 60, 0.1)', border: '1px solid rgba(231, 76, 60, 0.3)', color: '#e74c3c' };
    } else if (cat === 'flexibility') {
      style = { background: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.3)', color: '#2ecc71' };
    }

    return (
      <span className="badge px-3 py-1.5 text-uppercase fw-black" style={{ ...style, borderRadius: '6px', fontSize: '0.62rem', letterSpacing: '0.5px' }}>
        {category || 'Workout'}
      </span>
    );
  };

  return (
    <div className="min-vh-100 text-white py-5 px-3" style={{ background: '#0a0a0a', backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255, 122, 0, 0.04) 0%, transparent 40%)' }}>
      <div className="mx-auto" style={{ maxWidth: '1000px', marginTop: '4rem' }}>

        {/* Header */}
        <div className="mb-5 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom border-secondary border-opacity-15 pb-4">
          <div>
            <h1 className="fw-black text-gradient display-5 mb-2">My Schedule</h1>
            <p className="text-secondary small m-0">Manage your custom training sessions, group fitness classes, and view assigned experts.</p>
          </div>
          <button
            onClick={() => navigate('/sessions')}
            className="btn-premium py-2.5 px-4 d-flex align-items-center gap-2"
            style={{ borderRadius: '8px', fontSize: '0.85rem' }}
          >
            <Sparkles size={16} /> Book New Session
          </button>
        </div>

        {/* My Plan Quick Card */}
        <div className="p-4 rounded-4 border border-secondary border-opacity-10 mb-5" style={{ background: 'rgba(255, 122, 0, 0.05)', backdropFilter: 'blur(8px)' }}>
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2 text-warning text-uppercase fw-black" style={{ letterSpacing: '1px', fontSize: '0.72rem' }}>
                <Shield size={14} /> My Plan
              </div>
              {mySubs.length > 0 ? (
                <>
                  <h3 className="fw-black text-white mb-1">{mySubs[0].plan_name || 'Active Package'}</h3>
                  <p className="text-secondary small mb-0">Status: {mySubs[0].status || 'Active'} • {mySubs[0].trainer_name ? `Trainer: ${mySubs[0].trainer_name}` : 'Trainer pending'} • {mySubs[0].nutritionist_name ? `Nutritionist: ${mySubs[0].nutritionist_name}` : 'Nutritionist pending'}</p>
                </>
              ) : (
                <>
                  <h3 className="fw-black text-white mb-1">No plan yet</h3>
                  <p className="text-secondary small mb-0">Choose a package to unlock your training plan and nutrition details here.</p>
                </>
              )}
            </div>
            <button
              onClick={() => navigate('/my-subscriptions')}
              className="btn btn-warning btn-sm fw-bold text-uppercase py-2 px-3"
              style={{ borderRadius: '8px', background: 'linear-gradient(135deg, #ff7a00 0%, #ff4400 100%)', color: '#000', border: 'none' }}
            >
              View Full Plan
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="row g-3 mb-5">
          <div className="col-6 col-md-2">
            <div className="p-3 rounded-3 border border-secondary border-opacity-10 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <span className="text-secondary small text-uppercase d-block mb-1" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>Sessions</span>
              <span className="fs-3 fw-black text-white">{scheduledSessions.length}</span>
            </div>
          </div>
          <div className="col-6 col-md-2">
            <div className="p-3 rounded-3 border border-secondary border-opacity-10 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <span className="text-secondary small text-uppercase d-block mb-1" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>Upcoming</span>
              <span className="fs-3 fw-black text-warning">{upcomingSessions.length}</span>
            </div>
          </div>
          <div className="col-6 col-md-2">
            <div className="p-3 rounded-3 border border-secondary border-opacity-10 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <span className="text-secondary small text-uppercase d-block mb-1" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>Completed</span>
              <span className="fs-3 fw-black text-success">{pastSessions.length}</span>
            </div>
          </div>
          <div className="col-6 col-md-2">
            <div className="p-3 rounded-3 border border-secondary border-opacity-10 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <span className="text-secondary small text-uppercase d-block mb-1" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>Machines</span>
              <span className="fs-3 fw-black text-warning">{bookedMachines.length}</span>
            </div>
          </div>
          <div className="col-6 col-md-2">
            <div className="p-3 rounded-3 border border-secondary border-opacity-10 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <span className="text-secondary small text-uppercase d-block mb-1" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>Specialists</span>
              <span className="fs-3 fw-black text-info">{assignedTrainers.length + assignedNutritionists.length}</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="d-flex gap-3 mb-4 p-1.5 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', width: 'fit-content' }}>
          <button
            onClick={() => setActiveTab('upcoming')}
            className="btn btn-sm px-4 py-2 fw-bold text-uppercase transition-all"
            style={{
              background: activeTab === 'upcoming' ? 'linear-gradient(135deg, #ff7a00, #ff4400)' : 'transparent',
              color: activeTab === 'upcoming' ? '#000' : '#888',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.72rem',
              letterSpacing: '0.5px'
            }}
          >
            Upcoming Workouts ({upcomingSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className="btn btn-sm px-4 py-2 fw-bold text-uppercase transition-all"
            style={{
              background: activeTab === 'past' ? 'linear-gradient(135deg, #ff7a00, #ff4400)' : 'transparent',
              color: activeTab === 'past' ? '#000' : '#888',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.72rem',
              letterSpacing: '0.5px'
            }}
          >
            Session History ({pastSessions.length})
          </button>
        </div>

        {/* Sessions List */}
        <div className="mb-5">
          <AnimatePresence mode="wait">
            {currentTabSessions.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-5 p-4 rounded-4"
                style={{
                  background: 'rgba(15, 15, 15, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <AlertCircle size={40} className="text-secondary mb-3 opacity-50" />
                <h4 className="fw-bold text-white mb-2">
                  {activeTab === 'upcoming' ? 'No Upcoming Sessions' : 'No Session History'}
                </h4>
                <p className="text-secondary small mb-4 mx-auto" style={{ maxWidth: '400px' }}>
                  {activeTab === 'upcoming'
                    ? "You don't have any classes or coaching sessions scheduled."
                    : "You haven't completed any sessions yet."}
                </p>
                {activeTab === 'upcoming' && (
                  <button
                    onClick={() => navigate('/sessions')}
                    className="btn btn-warning btn-sm px-4 py-2.5 fw-bold text-uppercase border-0"
                    style={{
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #ff7a00 0%, #ff4400 100%)',
                      color: '#000',
                      fontSize: '0.75rem',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Browse & Book Sessions
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="sessions-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="d-flex flex-column gap-3"
              >
                {currentTabSessions.map((session, idx) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-4 border border-secondary border-opacity-15"
                    style={{
                      background: 'rgba(20, 20, 20, 0.8)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <div className="row g-3 align-items-center">
                      {/* Name & Category */}
                      <div className="col-12 col-md-4">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          {getCategoryBadge(session.category || session.category)}
                          <span className="badge px-2.5 py-1 text-uppercase bg-secondary bg-opacity-25 text-white-50" style={{ fontSize: '0.58rem', borderRadius: '4px', letterSpacing: '0.5px' }}>
                            {session.type === 'group' ? 'Group Class' : '1-on-1'}
                          </span>
                        </div>
                        <h4 className="fw-black text-white m-0 fs-6">{session.name}</h4>
                        {session.description && (
                          <p className="text-secondary small m-0 mt-1.5 line-clamp-1">{session.description}</p>
                        )}
                      </div>

                      {/* Coach / Specialist */}
                      <div className="col-12 col-md-3">
                        <span className="text-secondary small text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>
                          Coach / Specialist
                        </span>
                        <div className="d-flex align-items-center gap-2">
                          <div className="p-1 rounded-circle bg-secondary bg-opacity-25 text-white">
                            <User size={14} />
                          </div>
                          <span className="text-white small fw-bold">{session.coach}</span>
                        </div>
                      </div>

                      {/* Time Slot & Date */}
                      <div className="col-12 col-md-3">
                        <span className="text-secondary small text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>
                          Schedule Details
                        </span>
                        <div className="text-white small d-flex flex-column gap-1">
                          <span className="d-flex align-items-center gap-1.5"><Calendar size={12} className="text-warning" /> {formatDate(session.date)}</span>
                          <span className="d-flex align-items-center gap-1.5 text-secondary"><Clock size={12} /> {session.time}</span>
                        </div>
                        {session.notes && (
                          <span className="d-block text-secondary small mt-1.5 italic" style={{ fontSize: '0.75rem' }}>"{session.notes}"</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-12 col-md-2 text-md-end">
                        {activeTab === 'upcoming' ? (
                          <div className="d-flex justify-content-md-end gap-2">
                            <button
                              onClick={() => handleOpenReschedule(session)}
                              className="btn btn-outline-secondary btn-sm p-2"
                              title="Reschedule Session"
                              style={{ borderRadius: '8px' }}
                            >
                              <Edit2 size={14} className="text-warning" />
                            </button>
                            <button
                              onClick={() => handleCancelSession(session.id, session.name)}
                              className="btn btn-outline-danger btn-sm p-2"
                              title="Cancel Reservation"
                              style={{ borderRadius: '8px' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="d-flex align-items-center justify-content-md-end gap-2 text-success">
                            <CheckCircle2 size={16} />
                            <span className="small fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* My Booked Machines Section */}
        <div className="pt-4 border-top border-secondary border-opacity-15 mb-5">
          <h3 className="fw-black mb-4 d-flex align-items-center gap-2 text-uppercase fs-5" style={{ letterSpacing: '1px' }}>
            <Dumbbell size={20} /> My Booked Machines
          </h3>
          
          {bookedMachines.length === 0 ? (
            <div className="p-4 rounded-4 border border-secondary border-opacity-10 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <p className="text-secondary small mb-3">You haven't booked any machines yet.</p>
              <button onClick={() => navigate('/machines')} className="btn btn-warning btn-sm fw-bold text-uppercase py-2 px-4" style={{ borderRadius: '8px', fontSize: '0.72rem', background: 'linear-gradient(135deg, #ff7a00 0%, #ff4400 100%)', color: '#000', border: 'none' }}>
                Browse Machines
              </button>
            </div>
          ) : (
            <div className="row g-3">
              {bookedMachines.map((machine, idx) => (
                <div key={machine.booking_id || machine.equipment_id || machine.id || idx} className="col-12 col-md-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-4 h-100"
                    style={{
                      background: 'rgba(255, 122, 0, 0.05)',
                      border: '1px solid rgba(255, 122, 0, 0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div className="d-flex gap-3">
                      {machine.image_url && (
                        <img 
                          src={machine.image_url} 
                          alt={machine.name}
                          style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '2px solid rgba(255, 122, 0, 0.3)' }}
                        />
                      )}
                      <div className="flex-grow-1 d-flex flex-column justify-content-between">
                        <div>
                          <h5 className="text-white fw-black mb-2">{machine.name}</h5>
                          <div className="d-flex flex-column gap-1 small text-secondary">
                            <span className="d-flex align-items-center gap-1.5">
                              <Calendar size={12} className="text-warning" />
                              {formatDate(machine.bookingTime?.split(' ')[0])}
                            </span>
                            <span className="d-flex align-items-center gap-1.5">
                              <Clock size={12} className="text-warning" />
                              {machine.bookingTime?.split(' ').slice(1).join(' ')}
                            </span>
                          </div>
                        </div>
                        <div className="d-flex gap-2 mt-3">
                          <button
                            onClick={() => handleCancelMachineBooking(machine)}
                            disabled={cancellingMachineId === machine.booking_id}
                            className="btn btn-outline-danger btn-sm px-3 py-1"
                            style={{ borderRadius: '6px', fontSize: '0.7rem' }}
                          >
                            <Trash2 size={12} className="me-1" />
                            {cancellingMachineId === machine.booking_id ? 'Cancelling...' : 'Cancel'}
                          </button>
                          <button
                            onClick={() => navigate('/machines')}
                            className="btn btn-outline-warning btn-sm px-3 py-1"
                            style={{ borderRadius: '6px', fontSize: '0.7rem', color: '#ff7a00', borderColor: '#ff7a00' }}
                          >
                            <Edit2 size={12} className="me-1" /> Reschedule
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Specialists / Assigned Section */}
        <div className="pt-4 border-top border-secondary border-opacity-15">
          <h3 className="fw-black mb-4 d-flex align-items-center gap-2 text-uppercase fs-5" style={{ letterSpacing: '1px' }}>
            🤝 My Assigned Gym Specialists
          </h3>
          
          {assignedTrainers.length === 0 && assignedNutritionists.length === 0 ? (
            <div className="p-4 rounded-4 border border-secondary border-opacity-10 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <p className="text-secondary small mb-3">You do not have any assigned elite trainers or nutritionists yet.</p>
              <div className="d-flex justify-content-center gap-3">
                <button onClick={() => navigate('/trainers')} className="btn btn-outline-warning btn-sm fw-bold text-uppercase py-2 px-3" style={{ borderRadius: '8px', fontSize: '0.72rem' }}>
                  Meet Trainers
                </button>
                <button onClick={() => navigate('/nutritionists')} className="btn btn-outline-success btn-sm fw-bold text-uppercase py-2 px-3" style={{ borderRadius: '8px', fontSize: '0.72rem' }}>
                  Meet Nutritionists
                </button>
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {/* Trainers */}
              {assignedTrainers.map((trainer, idx) => (
                <div key={trainer.id || idx} className="col-12 col-md-6">
                  <div className="p-3 rounded-4 h-100 d-flex align-items-center justify-content-between" style={{
                    background: 'rgba(0, 230, 115, 0.03)',
                    border: '1px solid rgba(0, 230, 115, 0.15)',
                  }}>
                    <div className="d-flex align-items-center gap-3">
                      <img 
                        src={trainer.image_url || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop'} 
                        alt={trainer.name}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0, 230, 115, 0.3)' }}
                      />
                      <div>
                        <h6 className="text-white fw-bold mb-0">{trainer.name}</h6>
                        <span className="text-success small fw-semibold">Elite Coach</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/trainers')} 
                      className="btn btn-link text-success p-0 hover-lift"
                      style={{ textDecoration: 'none' }}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Nutritionists */}
              {assignedNutritionists.map((pro, idx) => (
                <div key={pro.id || idx} className="col-12 col-md-6">
                  <div className="p-3 rounded-4 h-100 d-flex align-items-center justify-content-between" style={{
                    background: 'rgba(255, 193, 7, 0.03)',
                    border: '1px solid rgba(255, 193, 7, 0.15)',
                  }}>
                    <div className="d-flex align-items-center gap-3">
                      <img 
                        src={pro.image_url || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1453&auto=format&fit=crop'} 
                        alt={pro.name}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255, 193, 7, 0.3)' }}
                      />
                      <div>
                        <h6 className="text-white fw-bold mb-0">{pro.name}</h6>
                        <span className="text-warning small fw-semibold">Nutrition Expert</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/nutritionists')} 
                      className="btn btn-link text-warning p-0 hover-lift"
                      style={{ textDecoration: 'none' }}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Reschedule Modal */}
      <Modal 
        show={showRescheduleModal} 
        onHide={() => setShowRescheduleModal(false)} 
        centered
        contentClassName="bg-dark border-0 overflow-hidden shadow-lg"
        style={{ boxShadow: '0 25px 50px -12px rgba(255, 145, 0, 0.25)' }}
      >
        <Modal.Header closeButton closeVariant="white" className="border-0 p-4" style={{ backgroundColor: 'var(--accent-primary)' }}>
          <Modal.Title className="text-uppercase fw-black text-white" style={{ letterSpacing: '2px', fontSize: '1.1rem' }}>
            Reschedule Session
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitReschedule}>
          <Modal.Body className="p-4 bg-dark">
            {sessionToReschedule && (
              <div className="d-flex flex-column gap-4">
                <div>
                  <span className="text-secondary small text-uppercase d-block mb-1">Session Selected</span>
                  <h5 className="text-white fw-black m-0">{sessionToReschedule.name}</h5>
                  <span className="text-warning small fw-bold">with {sessionToReschedule.coach}</span>
                </div>

                <Form.Group>
                  <Form.Label className="text-secondary small text-uppercase fw-bold mb-2">New Date</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="bg-secondary bg-opacity-10 border border-secondary border-opacity-20 text-white rounded-3 py-2.5"
                    style={{ colorScheme: 'dark', outline: 'none' }}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className="text-secondary small text-uppercase fw-bold mb-2">New Time Slot</Form.Label>
                  <Form.Select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="bg-secondary bg-opacity-10 border border-secondary border-opacity-20 text-white rounded-3 py-2.5"
                    style={{ outline: 'none' }}
                  >
                    <option value="08:00 AM - 09:00 AM" className="bg-dark text-white">08:00 AM - 09:00 AM</option>
                    <option value="09:00 AM - 10:00 AM" className="bg-dark text-white">09:00 AM - 10:00 AM</option>
                    <option value="11:00 AM - 12:00 PM" className="bg-dark text-white">11:00 AM - 12:00 PM</option>
                    <option value="02:00 PM - 03:00 PM" className="bg-dark text-white">02:00 PM - 03:00 PM</option>
                    <option value="04:00 PM - 05:00 PM" className="bg-dark text-white">04:00 PM - 05:00 PM</option>
                    <option value="06:00 PM - 07:00 PM" className="bg-dark text-white">06:00 PM - 07:00 PM</option>
                  </Form.Select>
                </Form.Group>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 p-4 bg-dark border-top border-secondary border-opacity-10 d-flex gap-2">
            <Button variant="link" onClick={() => setShowRescheduleModal(false)} className="text-white opacity-50 text-decoration-none fw-bold text-uppercase small me-auto">
              Cancel
            </Button>
            <Button 
              type="submit"
              className="px-4 py-2.5 rounded-3 fw-black text-uppercase border-0 text-black btn-premium"
              style={{ fontSize: '0.85rem' }}
            >
              Confirm Reschedule
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  );
}

export default MySessions;
