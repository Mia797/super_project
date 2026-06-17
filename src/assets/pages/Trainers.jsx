import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Twitter } from 'lucide-react';
import axios from 'axios';
import { Modal, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './Trainers.css';

function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [pendingPlans, setPendingPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [confirmBooking, setConfirmBooking] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trainersRes, plansRes] = await Promise.all([
          axios.get('/api/trainers'),
          axios.get('/api/training/plans')
        ]);

        if (trainersRes.data && trainersRes.data.success && Array.isArray(trainersRes.data.trainers)) {
          setTrainers(trainersRes.data.trainers);
        }

        if (plansRes.data && plansRes.data.success && Array.isArray(plansRes.data.plans)) {
          setPendingPlans(plansRes.data.plans);
          if (plansRes.data.plans.length === 1) {
            setSelectedPlanId(plansRes.data.plans[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch trainers or plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fallback images based on index
  const fallbackImages = [
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1469&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1374&auto=format&fit=crop'
  ];

  const handleSecureSession = async (trainerId, trainerName) => {
    // Open confirmation modal
    setConfirmBooking({ trainerId, trainerName });
  };

  const confirmTrainerBooking = async () => {
    if (!confirmBooking) return;
    if (pendingPlans.length > 0 && !selectedPlanId) {
      alert('Please select a training plan to assign this trainer to.');
      return;
    }
    
    const { trainerId, trainerName } = confirmBooking;
    setBookingLoading(true);
    
    try {
      // API call to assign trainer
      const response = await axios.post('/api/training/plans/assign', {
        trainerId,
        subscriptionId: selectedPlanId
      });
      
      if (response.data && (response.data.success || response.data.subscription)) {
        // Save booked trainer to localStorage
        const bookedTrainersData = JSON.parse(localStorage.getItem('bookedTrainers') || '[]');
        const trainer = trainers.find(t => t.id === trainerId);
        
        if (!bookedTrainersData.find(t => t.id === trainerId)) {
          bookedTrainersData.push({ 
            id: trainerId, 
            name: trainerName, 
            image_url: trainer?.image_url,
            bio: trainer?.bio,
            bookedAt: new Date().toISOString()
          });
          localStorage.setItem('bookedTrainers', JSON.stringify(bookedTrainersData));
        }
        
        setSelectedTrainer(null);
        setConfirmBooking(null);
        // Redirect to sessions page
        setTimeout(() => navigate('/sessions'), 500);
      }
    } catch (error) {
      console.error('Booking error:', error);
      // Still save the booking intent even if API has error
      const bookedTrainersData = JSON.parse(localStorage.getItem('bookedTrainers') || '[]');
      const trainer = trainers.find(t => t.id === trainerId);
      
      if (!bookedTrainersData.find(t => t.id === trainerId)) {
        bookedTrainersData.push({ 
          id: trainerId, 
          name: confirmBooking.trainerName, 
          image_url: trainer?.image_url,
          bio: trainer?.bio,
          bookedAt: new Date().toISOString()
        });
        localStorage.setItem('bookedTrainers', JSON.stringify(bookedTrainersData));
      }
      
      setSelectedTrainer(null);
      setConfirmBooking(null);
      setTimeout(() => navigate('/sessions'), 500);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="trainers-container">
      <div className="trainers-content">
        <div className="text-center mb-5">
          <motion.h1 
            className="display-3 fw-black text-uppercase section-title mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Our <span className="text-gradient">Elite</span> Trainers
          </motion.h1>
          <motion.p 
            className="trainers-header-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Push past your limits with our world-class coaches. They're here to break you down and build you back up.
          </motion.p>
        </div>

        {loading ? (
          <div className="text-center text-white mt-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row g-4 justify-content-center">
            {trainers.map((trainer, idx) => (
              <div key={trainer.id || idx} className="col-lg-4 col-md-6">
                <motion.div 
                  className="trainer-card"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  onClick={() => setSelectedTrainer(trainer)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="trainer-img-wrapper">
                    <img 
                      src={trainer.image_url || fallbackImages[idx % fallbackImages.length]} 
                      alt={trainer.name} 
                      className="trainer-img" 
                    />
                    <div className="trainer-img-overlay"></div>
                  </div>
                  
                  <div className="trainer-info">
                    <h3 className="trainer-title">{trainer.name}</h3>
                    <p className="trainer-role">{typeof trainer.bio === 'string' ? trainer.bio : (trainer.bio?.text || 'Certified Fitness Trainer')}</p>
                    
                    <div className="d-flex justify-content-center gap-4 mb-4">
                      <a href="#" className="text-muted" style={{ transition: 'color 0.3s' }} onMouseOver={(e)=>e.currentTarget.style.color='var(--accent-primary)'} onMouseOut={(e)=>e.currentTarget.style.color='var(--text-muted)'}>
                        <Instagram size={22} />
                      </a>
                      <a href="#" className="text-muted" style={{ transition: 'color 0.3s' }} onMouseOver={(e)=>e.currentTarget.style.color='var(--accent-primary)'} onMouseOut={(e)=>e.currentTarget.style.color='var(--text-muted)'}>
                        <Twitter size={22} />
                      </a>
                    </div>
                    
                    <button 
                      className="btn-outline w-100 mt-auto" 
                      disabled={bookingLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSecureSession(trainer.id, trainer.name);
                      }}
                    >
                      {bookingLoading ? 'Booking...' : 'Book Now'}
                    </button>
                  </div>
                </motion.div>
              </div>
            ))}
            
            {trainers.length === 0 && (
              <div className="text-center text-secondary w-100 mt-4">
                <p>No trainers available at the moment.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal 
        show={!!selectedTrainer} 
        onHide={() => setSelectedTrainer(null)} 
        centered
        size="lg"
        contentClassName="bg-dark border-0 overflow-hidden shadow-lg"
        style={{ boxShadow: '0 25px 50px -12px rgba(255, 145, 0, 0.25)' }}
      >
        {selectedTrainer && (
          <>
            <Modal.Header closeButton closeVariant="white" className="border-0 p-4" style={{ backgroundColor: 'var(--accent-primary)' }}>
              <Modal.Title className="text-uppercase fw-black" style={{ color: 'white', letterSpacing: '2px', fontSize: '1.2rem' }}>
                Elite Trainer Profile
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0 bg-dark">
              <div className="row g-0">
                <div className="col-md-5 position-relative">
                  <img 
                    src={selectedTrainer.image_url || fallbackImages[trainers.indexOf(selectedTrainer) % fallbackImages.length]} 
                    alt={selectedTrainer.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '400px' }}
                  />
                  <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                     <h2 className="fw-black text-white mb-0 text-uppercase">{selectedTrainer.name}</h2>
                  </div>
                </div>
                <div className="col-md-7 p-5 bg-dark">
                  <div className="d-flex align-items-center mb-4">
                    <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--accent-primary)', marginRight: '15px' }}></div>
                    <p className="mb-0 text-uppercase fw-bold" style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', letterSpacing: '1px' }}>
                      {selectedTrainer.experience_years ? `${selectedTrainer.experience_years}+ Years Professional` : 'Master Trainer'}
                    </p>
                  </div>
                  
                  <h5 className="fw-black text-white mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>The Biography</h5>
                  <p className="text-white opacity-75 mb-5" style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
                    {typeof selectedTrainer.bio === 'string' ? selectedTrainer.bio : (selectedTrainer.bio?.text || 'Redefining fitness through precision training and elite coaching methodologies.')}
                  </p>

                  <div className="row mb-5 g-4 text-white">
                    {selectedTrainer.email && (
                      <div className="col-sm-6">
                        <strong className="d-block mb-1 small text-uppercase fw-black opacity-50">Contact Email</strong>
                        <span className="fw-bold" style={{ color: 'var(--accent-primary)' }}>{selectedTrainer.email}</span>
                      </div>
                    )}
                    {selectedTrainer.phone && (
                      <div className="col-sm-6">
                        <strong className="d-block mb-1 small text-uppercase fw-black opacity-50">Direct Line</strong>
                        <span className="fw-bold text-white">{selectedTrainer.phone}</span>
                      </div>
                    )}
                  </div>

                  {selectedTrainer.achievements && (
                    <div className="pt-4 border-top border-secondary border-opacity-25">
                      <h5 className="fw-black text-white mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>Hall of Fame</h5>
                      <div className="d-flex flex-wrap gap-2">
                        {Array.isArray(selectedTrainer.achievements) ? (
                          selectedTrainer.achievements.length > 0 ? (
                            selectedTrainer.achievements.map((ach, i) => (
                              <Badge key={i} bg="transparent" className="border border-white text-white px-3 py-2 rounded-0" style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                                {ach}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-white opacity-50 small italic">General Certification</span>
                          )
                        ) : typeof selectedTrainer.achievements === 'string' ? (
                          <Badge key={0} bg="transparent" className="border border-white text-white px-3 py-2 rounded-0" style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                            {selectedTrainer.achievements}
                          </Badge>
                        ) : (
                          <span className="text-white opacity-50 small italic">General Certification</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="border-0 p-4 bg-dark border-top border-secondary border-opacity-25 d-flex gap-2">
              <Button variant="link" onClick={() => setSelectedTrainer(null)} className="text-white opacity-50 text-decoration-none fw-bold text-uppercase small me-auto">
                Back to List
              </Button>
              <Button 
                onClick={() => {
                  setSelectedTrainer(null);
                  navigate('/sessions');
                }}
                className="px-4 py-3 rounded-0 fw-black text-uppercase shadow-sm"
                style={{ 
                  background: 'transparent', 
                  border: '2px solid var(--accent-primary)', 
                  color: 'var(--accent-primary)', 
                  letterSpacing: '1px' 
                }}
              >
                Book 1-on-1 Session
              </Button>
              <Button 
                onClick={() => handleSecureSession(selectedTrainer.id, selectedTrainer.name)} 
                disabled={bookingLoading}
                className="px-4 py-3 rounded-0 fw-black text-uppercase shadow-sm"
                style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', letterSpacing: '1px' }}
              >
                {bookingLoading ? 'Assigning...' : 'Assign Coach'}
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* Confirmation Modal for Booking */}
      <Modal 
        show={!!confirmBooking} 
        onHide={() => setConfirmBooking(null)} 
        centered
        size="lg"
        contentClassName="bg-dark border-0 overflow-hidden shadow-lg"
        style={{ boxShadow: '0 25px 50px -12px rgba(255, 145, 0, 0.25)' }}
      >
        {confirmBooking && (
          <>
            <Modal.Header closeButton closeVariant="white" className="border-0 p-4" style={{ backgroundColor: 'var(--accent-primary)' }}>
              <Modal.Title className="text-uppercase fw-black" style={{ color: 'white', letterSpacing: '2px', fontSize: '1.2rem' }}>
                Confirm Booking
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-dark">
              <div className="text-center mb-4">
                <h5 className="text-white fw-bold mb-2">Are you sure you want to book with this trainer?</h5>
                <p className="text-secondary mb-0">This trainer will be added to your sessions list.</p>
              </div>

              {pendingPlans.length === 0 ? (
                <div className="alert alert-warning border-0 rounded-0">
                  <p className="mb-0 fw-bold">No pending training subscriptions found.</p>
                  <p className="small mb-0">You need an active subscription that requires a trainer before you can assign one.</p>
                  <Button
                    variant="warning"
                    className="mt-3 w-100 rounded-0 fw-bold"
                    onClick={() => navigate('/subscriptions')}
                  >
                    View Subscriptions
                  </Button>
                </div>
              ) : (
                <>
                  {pendingPlans.length > 1 && (
                    <div className="mb-4">
                      <label className="text-white-50 small mb-2 text-uppercase fw-bold">Select Training Plan</label>
                      <select
                        className="form-select bg-dark text-white border-secondary rounded-0"
                        value={selectedPlanId}
                        onChange={(e) => setSelectedPlanId(e.target.value)}
                      >
                        <option value="">-- Choose a plan --</option>
                        {pendingPlans.map(plan => (
                          <option key={plan.id} value={plan.id}>
                            {plan.planName} ({plan.goal})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="p-4 rounded border border-warning border-opacity-25" style={{ backgroundColor: 'rgba(255, 122, 0, 0.05)' }}>
                    <div className="text-center">
                      <p className="text-white-50 small mb-1">SELECTED TRAINER</p>
                      <h4 className="text-white fw-black text-uppercase">{confirmBooking.trainerName}</h4>
                      {selectedPlanId && (
                        <div className="mt-2 pt-2 border-top border-warning border-opacity-10">
                          <p className="text-white-50 small mb-0">FOR PLAN</p>
                          <p className="text-warning fw-bold mb-0">
                            {pendingPlans.find(p => String(p.id) === String(selectedPlanId))?.planName}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </Modal.Body>
            <Modal.Footer className="border-0 p-4 bg-dark border-top border-secondary border-opacity-25 d-flex gap-2">
              <Button variant="link" onClick={() => setConfirmBooking(null)} className="text-white opacity-50 text-decoration-none fw-bold text-uppercase small me-auto">
                Cancel
              </Button>
              <Button 
                onClick={confirmTrainerBooking}
                disabled={bookingLoading || (pendingPlans.length > 0 && !selectedPlanId) || pendingPlans.length === 0}
                className="px-4 py-3 rounded-0 fw-black text-uppercase shadow-sm"
                style={{
                  background: 'var(--accent-primary)',
                  border: 'none',
                  color: 'white',
                  letterSpacing: '1px',
                  opacity: (bookingLoading || (pendingPlans.length > 0 && !selectedPlanId) || pendingPlans.length === 0) ? 0.5 : 1
                }}
              >
                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Trainers;
