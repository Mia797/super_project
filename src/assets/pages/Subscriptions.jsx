import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Award, Shield, Sparkles, X } from 'lucide-react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useSubscription } from '../../context/SubscriptionContext';
import { useWallet } from '../../context/WalletContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function Subscriptions() {
  const { catalog, purchase, fetchCatalog, loading } = useSubscription();
  const { balance } = useWallet();
  const navigate = useNavigate();

  // Goal Modal State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [goal, setGoal] = useState('');
  const [description, setDescription] = useState('');
  const [purchasingLoading, setPurchasingLoading] = useState(false);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handlePurchaseClick = (plan) => {
    if (balance < parseFloat(plan.price)) {
     toast.error(
  `Insufficient wallet balance. You need ${plan.price * 5} Tokens but have ${balance} Tokens. Please fund your wallet.`
);
      return;
    }
    
    setSelectedPlan(plan);
    setGoal('');
    setDescription('');
    setShowGoalModal(true);
  };

  const handleConfirmPurchase = async (e) => {
    e.preventDefault();
    
    if (!goal.trim()) {
      toast.error('Please select a fitness goal');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Please add a description of your fitness goals');
      return;
    }

    setPurchasingLoading(true);
    const result = await purchase(selectedPlan.id, goal, description);
    setPurchasingLoading(false);

    if (result.success) {
      setShowGoalModal(false);
      toast.success('Subscription successful! Opening your plan now.');
      navigate('/my-subscriptions', { replace: true });
    }
  };

  const getPlanIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('vip') || lowerName.includes('gold')) return <Award size={32} className="text-warning" />;
    if (lowerName.includes('coach') || lowerName.includes('trainer') || lowerName.includes('pro')) return <Sparkles size={32} className="text-info" />;
    return <Flame size={32} className="text-danger" />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 80 } }
  };

  return (
    <div className="profile-container text-white py-5 px-3 min-vh-100" style={{ background: '#0a0a0a' }}>
      <div className="text-center mb-5">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          className="text-warning text-uppercase fw-bold small d-inline-block mb-2"
          style={{ letterSpacing: '2px' }}
        >
          Premium Packages
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fw-black text-gradient display-5 mb-3"
          style={{ fontWeight: 900 }}
        >
          Choose Your Destiny
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          className="lead text-secondary mx-auto"
          style={{ maxWidth: '600px', fontSize: '1rem' }}
        >
          Fund your wallet to unlock pro coaching, tailored diet programs, and full access to elite machinery.
        </motion.p>
      </div>

      {loading && catalog.length === 0 ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading plans...</span>
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="row g-4 justify-content-center max-width-lg mx-auto"
          style={{ maxWidth: '1200px' }}
        >
          {catalog.map((plan) => (
            <div className="col-12 col-md-6 col-lg-4" key={plan.id}>
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(255, 122, 0, 0.15)' }}
                className="h-100 p-4 d-flex flex-column justify-content-between"
                style={{
                  background: 'rgba(20, 20, 20, 0.75)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="p-3 bg-black bg-opacity-40 rounded-3 border border-secondary border-opacity-10">
                      {getPlanIcon(plan.name)}
                    </div>
                    <span
                      className="badge px-3 py-2 text-uppercase fw-bold"
                      style={{
                        background: 'rgba(255, 122, 0, 0.1)',
                        border: '1px solid rgba(255, 122, 0, 0.3)',
                        color: '#ff7a00',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        letterSpacing: '1px'
                      }}
                    >
                      {plan.duration_days || 30} Days
                    </span>
                  </div>

                  <h3 className="fw-black text-white mb-2 fs-4">{plan.name}</h3>
                  <p className="text-secondary small mb-4" style={{ minHeight: '48px', lineHeight: '1.5' }}>
                    {plan.description || 'Access to top-tier workout routines, trainer guidance, and meal planning.'}
                  </p>

                  <div className="d-flex align-items-baseline mb-4">
                    <span className="fs-1 fw-black text-white">  {(parseFloat(plan.price || 0) * 5).toFixed(0)} Tokens</span>
                    <span className="text-secondary small ms-2">/ one-time payment</span>
                  </div>

                  <ul className="list-unstyled d-flex flex-column gap-3 mb-5 border-top border-secondary border-opacity-15 pt-4">
                    <li className="d-flex align-items-start gap-2 text-secondary small">
                      <Check size={16} className="text-warning mt-0.5 flex-shrink-0" />
                      <span>Full Access to Gym Floor & Machines</span>
                    </li>
                    <li className="d-flex align-items-start gap-2 text-secondary small">
                      <Check size={16} className="text-warning mt-0.5 flex-shrink-0" />
                      <span>InBody Scan Parsing & AI Coach Advice</span>
                    </li>
                    {plan.has_trainer ? (
                      <li className="d-flex align-items-start gap-2 text-white small fw-bold">
                        <Check size={16} className="text-success mt-0.5 flex-shrink-0" />
                        <span>Personal Trainer Assigned</span>
                      </li>
                    ) : (
                      <li className="d-flex align-items-start gap-2 text-secondary small opacity-50">
                        <span className="w-4 h-4 d-inline-block flex-shrink-0"></span>
                        <span>No Personal Trainer</span>
                      </li>
                    )}
                    {plan.has_nutritionist ? (
                      <li className="d-flex align-items-start gap-2 text-white small fw-bold">
                        <Check size={16} className="text-success mt-0.5 flex-shrink-0" />
                        <span>Dedicated Nutritionist Assigned</span>
                      </li>
                    ) : (
                      <li className="d-flex align-items-start gap-2 text-secondary small opacity-50">
                        <span className="w-4 h-4 d-inline-block flex-shrink-0"></span>
                        <span>No Dedicated Nutritionist</span>
                      </li>
                    )}
                  </ul>
                </div>

                <button
                  onClick={() => handlePurchaseClick(plan)}
                  className="btn btn-warning w-100 py-3 fw-black text-uppercase border-0 hover-lift"
                  style={{
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #ff7a00 0%, #ff4400 100%)',
                    color: '#000',
                    fontWeight: 900,
                    letterSpacing: '1px'
                  }}
                >
                  Activate Package
                </button>
              </motion.div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Goal Selection Modal */}
      <Modal 
        show={showGoalModal} 
        onHide={() => !purchasingLoading && setShowGoalModal(false)} 
        centered
        contentClassName="bg-dark border-0 overflow-hidden shadow-lg"
        style={{ boxShadow: '0 25px 50px -12px rgba(255, 145, 0, 0.25)' }}
      >
        <Modal.Header closeButton closeVariant="white" className="border-0 p-4" style={{ backgroundColor: 'var(--accent-primary)' }}>
          <Modal.Title className="text-uppercase fw-black text-white" style={{ letterSpacing: '2px', fontSize: '1.1rem' }}>
            Define Your Fitness Goal
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleConfirmPurchase}>
          <Modal.Body className="p-4 bg-dark">
            {selectedPlan && (
              <div className="d-flex flex-column gap-4">
                <div className="p-3 rounded-3" style={{ background: 'rgba(255, 122, 0, 0.05)', border: '1px solid rgba(255, 122, 0, 0.2)' }}>
                  <span className="text-secondary small text-uppercase d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Purchasing Plan</span>
                  <h5 className="text-white fw-bold mb-1">{selectedPlan.name}</h5>
                  <span className="text-warning fw-bold">{selectedPlan.price} Tokens</span>
                </div>

                <Form.Group>
                  <Form.Label className="text-white fw-bold mb-2 text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>
                    Primary Fitness Goal *
                  </Form.Label>
                  <Form.Select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="form-select-dark"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 122, 0, 0.3)',
                      color: '#fff',
                      borderRadius: '8px',
                      padding: '10px 12px'
                    }}
                  >
                    <option value="">Select a goal...</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Weight Gain">Weight Gain</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="General Fitness">General Fitness</option>
                    <option value="Strength Training">Strength Training</option>
                    <option value="Endurance">Endurance</option>
                    <option value="Flexibility">Flexibility</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group>
                  <Form.Label className="text-white fw-bold mb-2 text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>
                    Describe Your Fitness Objectives *
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="e.g., Build muscle mass, focus on upper body strength and 4-week transformation..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 122, 0, 0.3)',
                      color: '#fff',
                      borderRadius: '8px',
                      padding: '10px 12px'
                    }}
                  />
                </Form.Group>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 p-4 bg-dark border-top border-secondary border-opacity-10 d-flex gap-2">
            <Button 
              variant="link" 
              onClick={() => setShowGoalModal(false)} 
              className="text-white opacity-50 text-decoration-none fw-bold text-uppercase small me-auto"
              disabled={purchasingLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="warning" 
              type="submit"
              className="fw-black text-uppercase text-dark border-0"
              style={{
                background: 'linear-gradient(135deg, #ff7a00 0%, #ff4400 100%)',
                padding: '10px 24px',
                borderRadius: '8px',
                letterSpacing: '1px'
              }}
              disabled={purchasingLoading}
            >
              {purchasingLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                'Confirm Purchase'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Subscriptions;

