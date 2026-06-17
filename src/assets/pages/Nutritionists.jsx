import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Modal, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { bookNutritionist, SPECIALIST_BOOKING_TOKENS } from '../../api/specialistApi';
import { clearLegacySpecialistStorage } from '../../utils/assignedSpecialists';
import { toast } from 'react-toastify';
import './Nutritionists.css';

function Nutritionists() {
  const [nutritionists, setNutritionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(false);
  const [selectedNutritionist, setSelectedNutritionist] = useState(null);
  const [confirmBooking, setConfirmBooking] = useState(null);
  const [bookingGoal, setBookingGoal] = useState('');
  const [bookingDescription, setBookingDescription] = useState('');
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { fetchMySubs } = useSubscription();

  useEffect(() => {
    clearLegacySpecialistStorage();
  }, []);

  useEffect(() => {
    const fetchNutritionists = async () => {
      try {
        const response = await axios.get('/api/nutritionists');
        if (response.data && response.data.success && Array.isArray(response.data.nutritionists)) {
          setNutritionists(response.data.nutritionists);
        }
      } catch (error) {
        console.error('Failed to fetch nutritionists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNutritionists();
  }, []);

  const fallbackImages = [
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1453&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1470&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1470&auto=format&fit=crop'
  ];

  const handleSecurePlan = (nutritionistId, nutritionistName) => {
    if (!user) {
      toast.warning('Please log in to book a nutritionist.');
      navigate('/login');
      return;
    }
    setBookingGoal('');
    setBookingDescription('');
    setConfirmBooking({ nutritionistId, nutritionistName });
  };

  const confirmNutritionistBooking = async () => {
    if (!confirmBooking) return;

    const { nutritionistId, nutritionistName } = confirmBooking;
    setPlanLoading(true);

    try {
      const response = await bookNutritionist({
        nutritionist_id: nutritionistId,
        goal: bookingGoal.trim(),
        description: bookingDescription.trim()
      });

      if (response.data?.success || response.data?.message) {
        await refreshUser();
        await fetchMySubs();
        toast.success(response.data?.message || 'Nutritionist booked successfully!');
        setSelectedNutritionist(null);
        setConfirmBooking(null);
        setBookingGoal('');
        setBookingDescription('');
        setTimeout(() => navigate('/my-subscriptions'), 500);
      } else {
        toast.error(response.data?.message || 'Booking failed.');
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.response?.data?.error;

      if (status === 409) {
        toast.error(message || 'You already have an active or pending diet plan.');
      } else if (status === 401) {
        toast.warning('Please log in to book a nutritionist.');
        navigate('/login');
      } else {
        toast.error(message || 'Booking failed. Check your balance and try again.');
      }
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div className="nutritionists-container">
      <div className="nutritionists-content">
        <div className="text-center mb-5">
          <motion.h1
            className="display-3 fw-black text-uppercase section-title mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Fuel Your <span className="text-gradient">Fire</span>
          </motion.h1>
          <motion.p
            className="nutritionists-header-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            You can't out-train a bad diet. Our nutrition experts will tailor a meal plan specific to your goals.
          </motion.p>
        </div>

        {loading ? (
          <div className="text-center text-white mt-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row g-4 justify-content-center mt-4">
            {nutritionists.map((pro, idx) => (
              <div key={pro.id || idx} className="col-lg-5 col-md-6">
                <motion.div
                  className="nutritionist-card"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  onClick={() => setSelectedNutritionist(pro)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="nutritionist-img-wrapper">
                    <img
                      src={pro.image_url || fallbackImages[idx % fallbackImages.length]}
                      alt={pro.name}
                      className="nutritionist-img"
                    />
                    <div className="nutritionist-img-overlay"></div>
                  </div>

                  <div className="nutritionist-info">
                    <h3 className="nutritionist-title">{pro.name}</h3>
                    <p className="nutritionist-spec">{typeof pro.bio === 'string' ? pro.bio : (pro.bio?.text || 'Sports & Performance Nutrition')}</p>

                    <button
                      className="btn-premium w-100 mt-auto justify-content-center"
                      disabled={planLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSecurePlan(pro.id, pro.name);
                      }}
                    >
                      {planLoading ? 'Booking...' : `Book Now (${SPECIALIST_BOOKING_TOKENS} Tokens)`}
                    </button>
                  </div>
                </motion.div>
              </div>
            ))}

            {nutritionists.length === 0 && (
              <div className="text-center text-secondary w-100 mt-4">
                <p>No nutritionists available at the moment.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        show={!!selectedNutritionist}
        onHide={() => setSelectedNutritionist(null)}
        centered
        size="lg"
        contentClassName="bg-dark border-0 overflow-hidden shadow-lg"
        style={{ boxShadow: '0 25px 50px -12px rgba(255, 145, 0, 0.25)' }}
      >
        {selectedNutritionist && (
          <>
            <Modal.Header closeButton closeVariant="white" className="border-0 p-4" style={{ backgroundColor: 'var(--accent-primary)' }}>
              <Modal.Title className="text-uppercase fw-black" style={{ color: 'white', letterSpacing: '2px', fontSize: '1.2rem' }}>
                Specialist Profile
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0 bg-dark">
              <div className="row g-0">
                <div className="col-md-5 position-relative">
                  <img
                    src={selectedNutritionist.image_url || fallbackImages[nutritionists.indexOf(selectedNutritionist) % fallbackImages.length]}
                    alt={selectedNutritionist.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '400px' }}
                  />
                  <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                    <h2 className="fw-black text-white mb-0 text-uppercase">{selectedNutritionist.name}</h2>
                  </div>
                </div>
                <div className="col-md-7 p-5 bg-dark">
                  <div className="d-flex align-items-center mb-4">
                    <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--accent-primary)', marginRight: '15px' }}></div>
                    <p className="mb-0 text-uppercase fw-bold" style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', letterSpacing: '1px' }}>
                      {selectedNutritionist.experience_years ? `${selectedNutritionist.experience_years}+ Years Professional` : 'Certified Nutritionist'}
                    </p>
                  </div>

                  <h5 className="fw-black text-white mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>The Biography</h5>
                  <p className="text-white opacity-75 mb-5" style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
                    {typeof selectedNutritionist.bio === 'string' ? selectedNutritionist.bio : (selectedNutritionist.bio?.text || 'Expert nutritional guidance for high-performance lifestyles.')}
                  </p>

                  <div className="row mb-5 g-4 text-white">
                    {selectedNutritionist.email && (
                      <div className="col-sm-6">
                        <strong className="d-block mb-1 small text-uppercase fw-black opacity-50">Contact Email</strong>
                        <span className="fw-bold" style={{ color: 'var(--accent-primary)' }}>{selectedNutritionist.email}</span>
                      </div>
                    )}
                    {selectedNutritionist.phone && (
                      <div className="col-sm-6">
                        <strong className="d-block mb-1 small text-uppercase fw-black opacity-50">Direct Line</strong>
                        <span className="fw-bold text-white">{selectedNutritionist.phone}</span>
                      </div>
                    )}
                  </div>

                  {selectedNutritionist.achievements && (
                    <div className="pt-4 border-top border-secondary border-opacity-25">
                      <h5 className="fw-black text-white mb-3 text-uppercase" style={{ letterSpacing: '1px' }}>Certifications</h5>
                      <div className="d-flex flex-wrap gap-2">
                        {Array.isArray(selectedNutritionist.achievements) ? (
                          selectedNutritionist.achievements.length > 0 ? (
                            selectedNutritionist.achievements.map((ach, i) => (
                              <Badge key={i} bg="transparent" className="border border-white text-white px-3 py-2 rounded-0" style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                                {ach}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-white opacity-50 small italic">General Certification</span>
                          )
                        ) : typeof selectedNutritionist.achievements === 'string' ? (
                          <Badge bg="transparent" className="border border-white text-white px-3 py-2 rounded-0" style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                            {selectedNutritionist.achievements}
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
            <Modal.Footer className="border-0 p-4 bg-dark border-top border-secondary border-opacity-25">
              <Button variant="link" onClick={() => setSelectedNutritionist(null)} className="text-white opacity-50 text-decoration-none fw-bold text-uppercase small">
                Back to List
              </Button>
              <Button
                onClick={() => handleSecurePlan(selectedNutritionist.id, selectedNutritionist.name)}
                disabled={planLoading}
                className="px-5 py-3 rounded-0 fw-black text-uppercase shadow-sm"
                style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', letterSpacing: '1px' }}
              >
                {planLoading ? 'Booking...' : `Book Now (${SPECIALIST_BOOKING_TOKENS} Tokens)`}
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

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
                <h5 className="text-white fw-bold mb-2">Book this nutritionist for your diet plan?</h5>
                <p className="text-secondary mb-0">
                  {SPECIALIST_BOOKING_TOKENS} tokens will be charged from your balance. Your specialist will start planning immediately.
                </p>
              </div>
              <div className="p-4 rounded border border-success border-opacity-25 mb-4" style={{ backgroundColor: 'rgba(0, 230, 115, 0.05)' }}>
                <div className="text-center">
                  <p className="text-white-50 small mb-1">SELECTED NUTRITIONIST</p>
                  <h4 className="text-white fw-black text-uppercase mb-2">{confirmBooking.nutritionistName}</h4>
                  <p className="text-warning fw-bold mb-0">{SPECIALIST_BOOKING_TOKENS} Tokens</p>
                </div>
              </div>
              <div className="mb-3">
                <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Goal (optional)</label>
                <input
                  type="text"
                  value={bookingGoal}
                  onChange={(e) => setBookingGoal(e.target.value)}
                  placeholder="e.g. Weight loss"
                  className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                />
              </div>
              <div>
                <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Description (optional)</label>
                <textarea
                  value={bookingDescription}
                  onChange={(e) => setBookingDescription(e.target.value)}
                  placeholder="e.g. Low carb preference"
                  rows={3}
                  className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                />
              </div>
            </Modal.Body>
            <Modal.Footer className="border-0 p-4 bg-dark border-top border-secondary border-opacity-25 d-flex gap-2">
              <Button variant="link" onClick={() => setConfirmBooking(null)} className="text-white opacity-50 text-decoration-none fw-bold text-uppercase small me-auto">
                Cancel
              </Button>
              <Button
                onClick={confirmNutritionistBooking}
                disabled={planLoading}
                className="px-4 py-3 rounded-0 fw-black text-uppercase shadow-sm"
                style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', letterSpacing: '1px' }}
              >
                {planLoading ? 'Booking...' : `Confirm (${SPECIALIST_BOOKING_TOKENS} Tokens)`}
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Nutritionists;
