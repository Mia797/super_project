import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Dumbbell, Apple, Sparkles, User, Users, MapPin, Search, Filter, Compass, Flame, AlertCircle } from 'lucide-react';
import { Modal, Button, Form, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import {
  extractAssignedTrainers,
  extractAssignedNutritionists,
  clearLegacySpecialistStorage
} from '../../utils/assignedSpecialists';
import axios from 'axios';

// Group Classes Catalog
const GROUP_CLASSES = [
  {
    id: 'gc-1',
    name: 'HIIT Firestorm',
    coach: 'Coach Marcus',
    type: 'group',
    category: 'HIIT',
    duration: '45 mins',
    intensity: 'High',
    capacity: 15,
    spotsLeft: 4,
    time: '09:00 AM - 09:45 AM',
    day: 'Monday',
    description: 'High-intensity interval training designed to burn maximum calories and boost metabolic rate.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1470&auto=format&fit=crop'
  },
  {
    id: 'gc-2',
    name: 'Powerlifting Foundation',
    coach: 'Coach Alex',
    type: 'group',
    category: 'Strength',
    duration: '60 mins',
    intensity: 'High',
    capacity: 10,
    spotsLeft: 2,
    time: '04:00 PM - 05:00 PM',
    day: 'Tuesday',
    description: 'Master the big three lifts (Squat, Bench, Deadlift) with correct form and progression methods.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1470&auto=format&fit=crop'
  },
  {
    id: 'gc-3',
    name: 'Zen Yoga Flow',
    coach: 'Diana Prince',
    type: 'group',
    category: 'Flexibility',
    duration: '60 mins',
    intensity: 'Low',
    capacity: 20,
    spotsLeft: 12,
    time: '08:00 AM - 09:00 AM',
    day: 'Wednesday',
    description: 'A vinyasa flow connecting movement with breath to build flexibility, balance, and mental clarity.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1520&auto=format&fit=crop'
  },
  {
    id: 'gc-4',
    name: 'Spinning Pulse',
    coach: 'Chloe Bennet',
    type: 'group',
    category: 'Cardio',
    duration: '45 mins',
    intensity: 'Medium',
    capacity: 18,
    spotsLeft: 7,
    time: '06:00 PM - 06:45 PM',
    day: 'Thursday',
    description: 'Rhythm-based indoor cycling experience featuring steep climbs, sprints, and epic music.',
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=1470&auto=format&fit=crop'
  },
  {
    id: 'gc-5',
    name: 'Core Crusher',
    coach: 'Coach Marcus',
    type: 'group',
    category: 'Core',
    duration: '30 mins',
    intensity: 'Medium',
    capacity: 15,
    spotsLeft: 5,
    time: '10:00 AM - 10:30 AM',
    day: 'Friday',
    description: 'Targeted core conditioning session to build stability, posture, and rotational power.',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop'
  }
];

function Sessions() {
  const { user } = useAuth();
  const { mySubs, fetchMySubs } = useSubscription();
  const navigate = useNavigate();

  // Specialist lists
  const [trainers, setTrainers] = useState([]);
  const [nutritionists, setNutritionists] = useState([]);
  const [loadingSpecialists, setLoadingSpecialists] = useState(false);

  // User bookings
  const [scheduledSessions, setScheduledSessions] = useState([]);

  const assignedTrainers = useMemo(() => extractAssignedTrainers(mySubs), [mySubs]);
  const assignedNutritionists = useMemo(() => extractAssignedNutritionists(mySubs), [mySubs]);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'group' | '1on1'

  // 1-on-1 Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingType, setBookingType] = useState('workout'); // 'workout' | 'nutrition' | 'orientation'
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('09:00 AM - 10:00 AM');
  const [bookingNotes, setBookingNotes] = useState('');

  // Initializing and loading data
  useEffect(() => {
    // Fetch specialists to populate 1-on-1 dropdowns
    const fetchSpecialists = async () => {
      setLoadingSpecialists(true);
      try {
        const [trainersRes, nutritionistsRes] = await Promise.allSettled([
          axios.get('/api/trainers'),
          axios.get('/api/nutritionists')
        ]);
        
        if (trainersRes.status === 'fulfilled' && trainersRes.value.data?.success) {
          setTrainers(trainersRes.value.data.trainers || []);
        }
        if (nutritionistsRes.status === 'fulfilled' && nutritionistsRes.value.data?.success) {
          setNutritionists(nutritionistsRes.value.data.nutritionists || []);
        }
      } catch (err) {
        console.error('Failed to load specialists', err);
      } finally {
        setLoadingSpecialists(false);
      }
    };

    fetchSpecialists();
    clearLegacySpecialistStorage();

    if (user) {
      fetchMySubs();
    }

    // Load scheduled sessions
    const storedSessions = JSON.parse(localStorage.getItem('scheduledSessions') || '[]');
    setScheduledSessions(storedSessions);
  }, [user]);

  // Set default specialist when booking modal opens or type changes
  useEffect(() => {
    if (bookingType === 'workout') {
      if (assignedTrainers.length > 0) {
        setSelectedSpecialist(assignedTrainers[0].name);
      } else if (trainers.length > 0) {
        setSelectedSpecialist(trainers[0].name);
      } else {
        setSelectedSpecialist('Coach Alex');
      }
    } else if (bookingType === 'nutrition') {
      if (assignedNutritionists.length > 0) {
        setSelectedSpecialist(assignedNutritionists[0].name);
      } else if (nutritionists.length > 0) {
        setSelectedSpecialist(nutritionists[0].name);
      } else {
        setSelectedSpecialist('Sarah Miller, RD');
      }
    } else {
      setSelectedSpecialist('Gym Staff Marshal');
    }
  }, [bookingType, assignedTrainers, assignedNutritionists, trainers, nutritionists, showBookingModal]);

  // Join a Group Class
  const handleJoinGroupClass = (classItem) => {
    if (!user) {
      toast.warning('Please log in to book a session.');
      navigate('/login');
      return;
    }

    // Check if already booked
    const isAlreadyBooked = scheduledSessions.some(
      (s) => s.classId === classItem.id || (s.name === classItem.name && s.time === classItem.time && s.date === classItem.day)
    );

    if (isAlreadyBooked) {
      toast.info('You are already booked for this session.');
      return;
    }

    const newSession = {
      id: `session-${Date.now()}`,
      classId: classItem.id,
      name: classItem.name,
      coach: classItem.coach,
      type: 'group',
      category: classItem.category,
      duration: classItem.duration,
      time: classItem.time,
      date: classItem.day, // Using day name for simple mock scheduler
      intensity: classItem.intensity,
      status: 'Upcoming',
      description: classItem.description,
      bookedAt: new Date().toISOString()
    };

    const updatedSessions = [...scheduledSessions, newSession];
    setScheduledSessions(updatedSessions);
    localStorage.setItem('scheduledSessions', JSON.stringify(updatedSessions));

    toast.success(`Successfully booked a spot in ${classItem.name}!`);
  };

  // Submit 1-on-1 Custom Booking
  const handleBookOneOnOne = (e) => {
    e.preventDefault();

    if (!user) {
      toast.warning('Please log in to book.');
      navigate('/login');
      return;
    }

    if (!bookingDate) {
      toast.error('Please select a date.');
      return;
    }

    let category = 'Workout';
    let iconName = 'workout';
    if (bookingType === 'nutrition') {
      category = 'Nutrition';
      iconName = 'nutrition';
    } else if (bookingType === 'orientation') {
      category = 'Orientation';
      iconName = 'orientation';
    }

    const newSession = {
      id: `session-${Date.now()}`,
      name: `${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)} Consultation`,
      coach: selectedSpecialist,
      type: '1on1',
      category: category,
      duration: '60 mins',
      time: bookingTime,
      date: bookingDate,
      notes: bookingNotes,
      status: 'Upcoming',
      bookedAt: new Date().toISOString()
    };

    const updatedSessions = [...scheduledSessions, newSession];
    setScheduledSessions(updatedSessions);
    localStorage.setItem('scheduledSessions', JSON.stringify(updatedSessions));

    toast.success(`Successfully booked 1-on-1 session with ${selectedSpecialist}!`);
    setShowBookingModal(false);
    setBookingNotes('');
    setBookingDate('');
  };

  // Filter Catalog Items
  const filteredGroupClasses = GROUP_CLASSES.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.coach.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || activeTab === 'group';
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-vh-100 text-white py-5 px-3" style={{ background: '#0a0a0a', backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(255, 122, 0, 0.05) 0%, transparent 50%)' }}>
      <div className="mx-auto" style={{ maxWidth: '1200px', marginTop: '4rem' }}>
        
        {/* Banner Head */}
        <div className="mb-5 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="d-flex align-items-center gap-2 mb-2 px-3 py-1.5 rounded-pill border border-warning border-opacity-25"
              style={{ background: 'rgba(255, 122, 0, 0.05)', width: 'fit-content' }}
            >
              <Sparkles size={14} className="text-warning animate-pulse" />
              <span className="small fw-bold text-warning text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.7rem' }}>Session Booking Hub</span>
            </motion.div>
            <h1 className="fw-black m-0 display-5 text-gradient">
              Book Your Sessions
            </h1>
            <p className="text-secondary small m-0 mt-1">Schedule elite coaching, diet consultations, or book slots in our intense group classes.</p>
          </div>
          
          <div className="d-flex gap-3">
            <button
              onClick={() => navigate('/my-sessions')}
              className="btn btn-outline py-2.5 px-4 small d-flex align-items-center gap-2"
              style={{ borderRadius: '8px', fontSize: '0.85rem' }}
            >
              <Calendar size={16} /> My Schedule
            </button>
            <button
              onClick={() => setShowBookingModal(true)}
              className="btn-premium py-2.5 px-4 d-flex align-items-center gap-2"
              style={{ borderRadius: '8px', fontSize: '0.85rem' }}
            >
              <User size={16} /> Book 1-on-1
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="p-4 mb-5 rounded-4 border border-secondary border-opacity-15" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)' }}>
          <div className="row g-3 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-md-6 position-relative">
              <Search className="position-absolute text-muted" size={18} style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="w-100 py-2.5 px-5 bg-dark border-0 rounded-3 text-white placeholder-secondary"
                placeholder="Search classes, trainers, categories..."
                style={{ fontSize: '0.9rem', outline: 'none', border: '1px solid rgba(255,255,255,0.05)' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Tabs */}
            <div className="col-12 col-md-6 d-flex justify-content-md-end gap-2">
              {[
                { id: 'all', label: 'All Catalog' },
                { id: 'group', label: 'Group Classes' },
                { id: '1on1', label: '1-on-1 Options' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`btn btn-sm px-4 py-2 fw-bold text-uppercase transition-all`}
                  style={{
                    background: activeTab === tab.id ? 'linear-gradient(135deg, #ff7a00, #ff4400)' : 'transparent',
                    color: activeTab === tab.id ? '#000' : '#888',
                    border: activeTab === tab.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    letterSpacing: '0.5px'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 1-on-1 Fast Booking Options */}
        {(activeTab === 'all' || activeTab === '1on1') && (
          <div className="mb-5">
            <h3 className="fw-black mb-4 d-flex align-items-center gap-2 text-uppercase fs-5" style={{ letterSpacing: '1px' }}>
              🎯 Personal 1-on-1 Coaching
            </h3>
            <div className="row g-4">
              {/* Card 1: Personal Trainer */}
              <div className="col-12 col-md-4">
                <motion.div 
                  className="p-4 rounded-4 border border-secondary border-opacity-20 h-100 d-flex flex-column"
                  style={{ background: 'linear-gradient(135deg, rgba(255, 122, 0, 0.03) 0%, rgba(20,20,20,0.8) 100%)' }}
                  whileHover={{ y: -6, borderColor: 'rgba(255, 122, 0, 0.4)' }}
                >
                  <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-3 mb-3" style={{ width: 'fit-content' }}>
                    <Dumbbell size={24} />
                  </div>
                  <h4 className="fw-bold text-white mb-2 fs-6">PERSONAL TRAINING</h4>
                  <p className="text-secondary small mb-4 flex-grow-1">Work 1-on-1 with an elite trainer to perfect your form, build muscle, or maximize power output.</p>
                  <button
                    onClick={() => {
                      setBookingType('workout');
                      setShowBookingModal(true);
                    }}
                    className="btn btn-outline-warning btn-sm py-2 px-3 fw-bold text-uppercase w-100 mt-auto"
                    style={{ borderRadius: '8px', border: '1px solid rgba(255, 122, 0, 0.4)' }}
                  >
                    Schedule Trainer
                  </button>
                </motion.div>
              </div>

              {/* Card 2: Nutritionist */}
              <div className="col-12 col-md-4">
                <motion.div 
                  className="p-4 rounded-4 border border-secondary border-opacity-20 h-100 d-flex flex-column"
                  style={{ background: 'linear-gradient(135deg, rgba(0, 230, 115, 0.03) 0%, rgba(20,20,20,0.8) 100%)' }}
                  whileHover={{ y: -6, borderColor: 'rgba(0, 230, 115, 0.4)' }}
                >
                  <div className="p-3 bg-success bg-opacity-10 text-success rounded-3 mb-3" style={{ width: 'fit-content' }}>
                    <Apple size={24} />
                  </div>
                  <h4 className="fw-bold text-white mb-2 fs-6">NUTRITION CONSULTATION</h4>
                  <p className="text-secondary small mb-4 flex-grow-1">Align your diet with your fitness goals. Get expert meal-prep, calorie tracking, and diet split reviews.</p>
                  <button
                    onClick={() => {
                      setBookingType('nutrition');
                      setShowBookingModal(true);
                    }}
                    className="btn btn-outline-success btn-sm py-2 px-3 fw-bold text-uppercase w-100 mt-auto"
                    style={{ borderRadius: '8px', border: '1px solid rgba(0, 230, 115, 0.4)' }}
                  >
                    Schedule Dietitian
                  </button>
                </motion.div>
              </div>

              {/* Card 3: Machine Orientation */}
              <div className="col-12 col-md-4">
                <motion.div 
                  className="p-4 rounded-4 border border-secondary border-opacity-20 h-100 d-flex flex-column"
                  style={{ background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.03) 0%, rgba(20,20,20,0.8) 100%)' }}
                  whileHover={{ y: -6, borderColor: 'rgba(0, 191, 255, 0.4)' }}
                >
                  <div className="p-3 bg-info bg-opacity-10 text-info rounded-3 mb-3" style={{ width: 'fit-content' }}>
                    <Compass size={24} />
                  </div>
                  <h4 className="fw-bold text-white mb-2 fs-6">MACHINE ORIENTATION</h4>
                  <p className="text-secondary small mb-4 flex-grow-1">Learn to operate high-end gym machines, adjust settings correctly, and select weights safely.</p>
                  <button
                    onClick={() => {
                      setBookingType('orientation');
                      setShowBookingModal(true);
                    }}
                    className="btn btn-outline-info btn-sm py-2 px-3 fw-bold text-uppercase w-100 mt-auto"
                    style={{ borderRadius: '8px', border: '1px solid rgba(0, 191, 255, 0.4)' }}
                  >
                    Schedule Orientation
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        )}

        {/* Group Classes Section */}
        {(activeTab === 'all' || activeTab === 'group') && (
          <div className="mb-5">
            <h3 className="fw-black mb-4 d-flex align-items-center gap-2 text-uppercase fs-5" style={{ letterSpacing: '1px' }}>
              🔥 Upcoming Group Classes
            </h3>
            {filteredGroupClasses.length === 0 ? (
              <div className="text-center py-5 rounded-4 border border-secondary border-opacity-10" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <p className="text-secondary mb-0">No classes found matching search criteria.</p>
              </div>
            ) : (
              <div className="row g-4">
                {filteredGroupClasses.map((item, idx) => {
                  const isJoined = scheduledSessions.some((s) => s.classId === item.id);
                  return (
                    <div key={item.id} className="col-12 col-md-6 col-lg-4">
                      <motion.div
                        className="rounded-4 overflow-hidden border border-secondary border-opacity-15 h-100 d-flex flex-column"
                        style={{ background: 'rgba(15,15,15,0.85)', backdropFilter: 'blur(8px)' }}
                        whileHover={{ y: -5, borderColor: 'rgba(255,122,0,0.3)' }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Class Header Banner Image */}
                        <div className="position-relative" style={{ height: '140px' }}>
                          <img src={item.image} alt={item.name} className="w-100 h-100 object-fit-cover opacity-75" />
                          <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(15,15,15,0.9))' }}></div>
                          <Badge 
                            bg="transparent" 
                            className="position-absolute top-3 end-3 px-3 py-1.5 border"
                            style={{ 
                              borderColor: item.intensity === 'High' ? '#ff3d00' : item.intensity === 'Medium' ? '#ff7a00' : '#00e673',
                              color: item.intensity === 'High' ? '#ff3d00' : item.intensity === 'Medium' ? '#ff7a00' : '#00e673',
                              fontSize: '0.65rem',
                              fontWeight: '900',
                              borderRadius: '20px'
                            }}
                          >
                            {item.intensity} Intensity
                          </Badge>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 d-flex flex-column flex-grow-1">
                          <span className="text-warning small fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>{item.category}</span>
                          <h4 className="fw-black text-white mb-2 fs-5">{item.name}</h4>
                          <p className="text-secondary small mb-3 flex-grow-1" style={{ lineHeight: '1.6' }}>{item.description}</p>
                          
                          <div className="d-flex flex-column gap-2 mb-4 pt-3 border-top border-secondary border-opacity-10">
                            <span className="small text-secondary d-flex align-items-center gap-2">
                              <User size={14} className="text-warning" /> Coach: <span className="text-white fw-semibold">{item.coach}</span>
                            </span>
                            <span className="small text-secondary d-flex align-items-center gap-2">
                              <Calendar size={14} className="text-warning" /> Schedule: <span className="text-white fw-semibold">{item.day} at {item.time}</span>
                            </span>
                            <span className="small text-secondary d-flex align-items-center gap-2">
                              <Clock size={14} className="text-warning" /> Duration: <span className="text-white fw-semibold">{item.duration}</span>
                            </span>
                          </div>

                          <button
                            onClick={() => handleJoinGroupClass(item)}
                            disabled={isJoined}
                            className={`w-100 py-2.5 px-4 rounded-3 fw-bold text-uppercase text-center small mt-auto border-0 ${
                              isJoined 
                                ? 'bg-secondary bg-opacity-20 text-muted cursor-not-allowed' 
                                : 'btn-premium text-black'
                            }`}
                          >
                            {isJoined ? 'Joined Class' : `Join Class (${item.spotsLeft} Spots left)`}
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* 1-on-1 Booking Modal */}
      <Modal 
        show={showBookingModal} 
        onHide={() => setShowBookingModal(false)} 
        centered
        size="lg"
        contentClassName="bg-dark border-0 overflow-hidden shadow-lg"
        style={{ boxShadow: '0 25px 50px -12px rgba(255, 145, 0, 0.25)' }}
      >
        <Modal.Header closeButton closeVariant="white" className="border-0 p-4" style={{ backgroundColor: 'var(--accent-primary)' }}>
          <Modal.Title className="text-uppercase fw-black text-white" style={{ letterSpacing: '2px', fontSize: '1.2rem' }}>
            Book 1-on-1 Private Session
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleBookOneOnOne}>
          <Modal.Body className="p-4 bg-dark">
            <div className="row g-4">
              
              {/* Type Select */}
              <div className="col-12 col-md-6">
                <Form.Group>
                  <Form.Label className="text-secondary small text-uppercase fw-bold mb-2">Session Category</Form.Label>
                  <Form.Select 
                    value={bookingType}
                    onChange={(e) => setBookingType(e.target.value)}
                    className="bg-secondary bg-opacity-10 border border-secondary border-opacity-20 text-white rounded-3 py-2.5"
                    style={{ outline: 'none' }}
                  >
                    <option value="workout" className="bg-dark text-white">Workout & Strength (Trainer)</option>
                    <option value="nutrition" className="bg-dark text-white">Nutrition Advice (Consultant)</option>
                    <option value="orientation" className="bg-dark text-white">Gym Floor Orientation</option>
                  </Form.Select>
                </Form.Group>
              </div>

              {/* Specialist Select */}
              <div className="col-12 col-md-6">
                <Form.Group>
                  <Form.Label className="text-secondary small text-uppercase fw-bold mb-2">Select Expert</Form.Label>
                  <Form.Select
                    value={selectedSpecialist}
                    onChange={(e) => setSelectedSpecialist(e.target.value)}
                    className="bg-secondary bg-opacity-10 border border-secondary border-opacity-20 text-white rounded-3 py-2.5"
                    style={{ outline: 'none' }}
                  >
                    {bookingType === 'workout' && (
                      <>
                        {assignedTrainers.length > 0 ? (
                          assignedTrainers.map((t) => <option key={t.id} value={t.name} className="bg-dark text-white">{t.name} (Assigned)</option>)
                        ) : null}
                        {trainers.map((t) => (
                          <option key={t.id} value={t.name} className="bg-dark text-white">{t.name} ({t.experience_years ? `${t.experience_years}y exp` : 'Master Trainer'})</option>
                        ))}
                        {trainers.length === 0 && <option value="Coach Alex" className="bg-dark text-white">Coach Alex (Strength)</option>}
                        <option value="Coach Marcus" className="bg-dark text-white">Coach Marcus (HIIT)</option>
                      </>
                    )}
                    {bookingType === 'nutrition' && (
                      <>
                        {assignedNutritionists.length > 0 ? (
                          assignedNutritionists.map((n) => <option key={n.id} value={n.name} className="bg-dark text-white">{n.name} (Assigned)</option>)
                        ) : null}
                        {nutritionists.map((n) => (
                          <option key={n.id} value={n.name} className="bg-dark text-white">{n.name} ({n.experience_years ? `${n.experience_years}y exp` : 'Dietitian'})</option>
                        ))}
                        {nutritionists.length === 0 && <option value="Sarah Miller, RD" className="bg-dark text-white">Sarah Miller, RD (Keto/Macros)</option>}
                        <option value="David Finch" className="bg-dark text-white">David Finch (Sports Performance)</option>
                      </>
                    )}
                    {bookingType === 'orientation' && (
                      <option value="Gym Staff Marshal" className="bg-dark text-white">Gym Staff Marshal</option>
                    )}
                  </Form.Select>
                </Form.Group>
              </div>

              {/* Date Select */}
              <div className="col-12 col-md-6">
                <Form.Group>
                  <Form.Label className="text-secondary small text-uppercase fw-bold mb-2">Select Date</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="bg-secondary bg-opacity-10 border border-secondary border-opacity-20 text-white rounded-3 py-2.5"
                    style={{ colorScheme: 'dark', outline: 'none' }}
                  />
                </Form.Group>
              </div>

              {/* Time Slot Select */}
              <div className="col-12 col-md-6">
                <Form.Group>
                  <Form.Label className="text-secondary small text-uppercase fw-bold mb-2">Select Time Slot</Form.Label>
                  <Form.Select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
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

              {/* Session Notes */}
              <div className="col-12">
                <Form.Group>
                  <Form.Label className="text-secondary small text-uppercase fw-bold mb-2">Goals or Notes (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="E.g., I want to focus on deadlift alignment, need advice on keto transition..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className="bg-secondary bg-opacity-10 border border-secondary border-opacity-20 text-white rounded-3 p-3 placeholder-secondary"
                    style={{ outline: 'none', resize: 'none' }}
                  />
                </Form.Group>
              </div>

            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 p-4 bg-dark border-top border-secondary border-opacity-10 d-flex gap-2">
            <Button variant="link" onClick={() => setShowBookingModal(false)} className="text-white opacity-50 text-decoration-none fw-bold text-uppercase small me-auto">
              Cancel
            </Button>
            <Button 
              type="submit"
              className="px-4 py-2.5 rounded-3 fw-black text-uppercase border-0 text-black btn-premium"
              style={{ fontSize: '0.85rem' }}
            >
              Book Session
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  );
}

export default Sessions;
