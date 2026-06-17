import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { getBookingIdFromResponse } from '../../api/bookingApi';
import { Modal, Button, Badge } from 'react-bootstrap';
import './Machines.css';

function Machines() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState("10:00");
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [confirmBooking, setConfirmBooking] = useState(null);

  const fetchEquipment = useCallback(async (withLoader = false) => {
    if (withLoader) setLoading(true);

    try {
      const response = await axios.get('/api/equipment');
      if (response.data && response.data.success && Array.isArray(response.data.equipment)) {
        setEquipment(response.data.equipment);
      }
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    } finally {
      if (withLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipment(true);
  }, [fetchEquipment]);

  const fallbackImages = [
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=1374&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1469&auto=format&fit=crop'
  ];

  const handleBook = (equipment_id, name) => {
    setConfirmBooking({ equipment_id, name });
  };

  const formatLocalDateTime = (date) => {
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const confirmMachineBooking = async () => {
    if (!confirmBooking) return;
    
    const { equipment_id, name } = confirmBooking;
    setBookingLoading(true);
    
    try {
      const startObj = new Date(`${bookingDate}T${bookingTime}:00`);
      const endObj = new Date(startObj);
      endObj.setDate(endObj.getDate() + 1);

      const start_time = formatLocalDateTime(startObj);
      const end_time = formatLocalDateTime(endObj);

      const response = await axios.post('/api/bookings/create', {
        equipment_id,
        start_time,
        end_time
      });

      if (response.data && (response.data.success || response.data.booking)) {
        // Save booked machine to localStorage
        const bookedMachinesData = JSON.parse(localStorage.getItem('bookedMachines') || '[]');
        const machine = equipment.find(e => e.id === equipment_id);
        
        if (!bookedMachinesData.find(m => m.id === equipment_id)) {
          bookedMachinesData.push({ 
            booking_id: getBookingIdFromResponse(response.data),
            equipment_id: equipment_id,
            id: equipment_id,
            name: name,
            image_url: machine?.image_url,
            bookingTime: start_time,
            bookedAt: new Date().toISOString()
          });
          localStorage.setItem('bookedMachines', JSON.stringify(bookedMachinesData));
        }
        
        setSelectedMachine(null);
        setConfirmBooking(null);
        await fetchEquipment();
      }
    } catch (error) {
      console.error('Booking error:', error);
      if (error.response?.status === 403) {
        // Still save the booking intent
        const bookedMachinesData = JSON.parse(localStorage.getItem('bookedMachines') || '[]');
        const machine = equipment.find(e => e.id === equipment_id);
        
        if (!bookedMachinesData.find(m => m.id === equipment_id)) {
          bookedMachinesData.push({ 
            id: equipment_id, 
            name: name,
            image_url: machine?.image_url,
            bookingTime: `${bookingDate} ${bookingTime}:00`,
            bookedAt: new Date().toISOString()
          });
          localStorage.setItem('bookedMachines', JSON.stringify(bookedMachinesData));
        }
        
        setSelectedMachine(null);
        setConfirmBooking(null);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="machines-container">
      <div className="machines-content">
        <div className="text-center mb-5">
          <motion.h1
            className="display-3 fw-black text-uppercase section-title mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            State-of-the-Art <span className="text-gradient">Arsenal</span>
          </motion.h1>
          <motion.p
            className="machines-header-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Train on the exact machines used by IFBB Pros. No compromises.
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
            {equipment.map((item, idx) => (
              <div key={item.id || idx} className="col-md-6 col-lg-6">
                <motion.div
                  className="machine-card"
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  onClick={() => setSelectedMachine(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="machine-img-wrapper">
                    <img
                      src={item.image_url || fallbackImages[idx % fallbackImages.length]}
                      alt={item.name}
                      className="machine-img"
                    />
                    <div className="machine-img-overlay"></div>
                  </div>

                  <div className="machine-info">
                    <h3 className="machine-title">{item.name}</h3>
                    <p className="machine-desc text-secondary small mb-2">{item.description}</p>
                    <div className="d-flex justify-content-between align-items-end mt-2">
                      <div>
                        <p className={`machine-zone mb-1 fw-bold ${item.status === 'available' ? 'text-success' : 'text-danger'}`}>
                          {item.status === 'available' ? 'Available' : 'In Use'}
                        </p>
                        <p className="text-muted small mb-0">{(parseFloat(item.booking_price || 0) * 5).toFixed(0)}  Tokens/ hr</p>
                      </div>
                      <button
                        className="btn-premium"
                        style={{ padding: '8px 24px', fontSize: '0.85rem', zIndex: 3 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBook(item.id, item.name);
                        }}
                        disabled={item.status !== 'available'}
                      >
                        {item.status === 'available' ? 'Book Now' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}

            {equipment.length === 0 && (
              <div className="text-center text-secondary w-100 mt-4">
                <p>No equipment data available at the moment.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal 
        show={!!selectedMachine} 
        onHide={() => setSelectedMachine(null)} 
        centered
        size="lg"
        contentClassName="bg-dark border-0 overflow-hidden shadow-lg"
        style={{ boxShadow: '0 25px 50px -12px rgba(255, 145, 0, 0.25)' }}
      >
        {selectedMachine && (
          <>
            <Modal.Header closeButton closeVariant="white" className="border-0 p-4" style={{ backgroundColor: 'var(--accent-primary)' }}>
              <Modal.Title className="text-uppercase fw-black" style={{ color: 'white', letterSpacing: '2px', fontSize: '1.2rem' }}>
                Arsenal Specifications
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0 bg-dark">
              <div className="row g-0">
                <div className="col-md-5 position-relative">
                  <img 
                    src={selectedMachine.image_url || fallbackImages[equipment.indexOf(selectedMachine) % fallbackImages.length]} 
                    alt={selectedMachine.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '400px' }}
                  />
                  <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                     <h2 className="fw-black text-white mb-0 text-uppercase">{selectedMachine.name}</h2>
                  </div>
                </div>
                <div className="col-md-7 p-5 bg-dark">
                  <Badge bg={selectedMachine.status === 'available' ? 'success' : 'danger'} className="mb-4 px-3 py-2 text-uppercase rounded-0 fw-bold" style={{ letterSpacing: '1px' }}>
                    {selectedMachine.status}
                  </Badge>
                  
                  <p className="fw-black mb-4" style={{ fontSize: '1.8rem', color: 'var(--accent-primary)' }}>
                    {parseFloat(selectedMachine.booking_price || 0).toFixed(0)}  Tokens <span className="text-white opacity-50 small fw-normal">/ hour</span>
                  </p>
                  
                  <h5 className="fw-black text-white mb-2 text-uppercase" style={{ letterSpacing: '1px' }}>The Machine</h5>
                  <p className="text-white opacity-75 mb-5" style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
                    {selectedMachine.description || 'Engineered for maximum muscle isolation and elite metabolic stress. Part of our professional arsenal.'}
                  </p>

                  <div className="p-4 rounded-0 bg-black bg-opacity-25 border-start border-4 border-warning mb-5">
                    <h6 className="fw-black text-white mb-3 text-uppercase small" style={{ letterSpacing: '1px' }}>Arsenal Specs</h6>
                    <ul className="list-unstyled mb-0 small text-white fw-bold">
                      <li className="mb-2 d-flex align-items-center">
                        <div className="bg-warning rounded-circle me-2" style={{ width: '6px', height: '6px' }}></div>
                        Commercial Grade Construction
                      </li>
                      <li className="mb-2 d-flex align-items-center">
                        <div className="bg-warning rounded-circle me-2" style={{ width: '6px', height: '6px' }}></div>
                        Ergonomic Biomechanics
                      </li>
                      <li className="d-flex align-items-center">
                        <div className="bg-warning rounded-circle me-2" style={{ width: '6px', height: '6px' }}></div>
                        Professional Isolation Tech
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-0 bg-black bg-opacity-25 border-start border-4 border-warning mb-4">
                    <h6 className="fw-black text-white mb-3 text-uppercase small" style={{ letterSpacing: '1px' }}>Schedule Deployment</h6>
                    <div className="row g-2">
                      <div className="col-6">
                        <input 
                          type="date" 
                          className="form-control form-control-sm bg-dark text-white border-secondary rounded-0" 
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                        />
                      </div>
                      <div className="col-6">
                        <input 
                          type="time" 
                          className="form-control form-control-sm bg-dark text-white border-secondary rounded-0" 
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <Badge bg="transparent" className="border border-white text-white px-3 py-2 rounded-0" style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                      Strength
                    </Badge>
                    <Badge bg="transparent" className="border border-white text-white px-3 py-2 rounded-0" style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                      Hypertrophy
                    </Badge>
                    <Badge bg="transparent" className="border border-white text-white px-3 py-2 rounded-0" style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                      Elite
                    </Badge>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="border-0 p-4 bg-dark border-top border-secondary border-opacity-25">
              <Button variant="link" onClick={() => setSelectedMachine(null)} className="text-white opacity-50 text-decoration-none fw-bold text-uppercase small">
                Back to List
              </Button>
              <Button 
                onClick={() => handleBook(selectedMachine.id, selectedMachine.name)} 
                disabled={selectedMachine.status !== 'available' || bookingLoading}
                className="px-5 py-3 rounded-0 fw-black text-uppercase shadow-sm"
                style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', letterSpacing: '1px' }}
              >
                {bookingLoading ? 'Deploying...' : (selectedMachine.status === 'available' ? 'Deploy Now' : 'Unavailable')}
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
                <h5 className="text-white fw-bold mb-2">Are you sure you want to book this machine?</h5>
                <p className="text-secondary mb-0">This machine will be reserved for your session.</p>
              </div>
              <div className="p-4 rounded border border-warning border-opacity-25" style={{ backgroundColor: 'rgba(255, 122, 0, 0.05)' }}>
                <div className="text-center">
                  <p className="text-white-50 small mb-1">SELECTED MACHINE</p>
                  <h4 className="text-white fw-black text-uppercase mb-3">{confirmBooking.name}</h4>
                  <p className="text-secondary small mb-0">
                    <strong>Booking Date:</strong> {bookingDate} at {bookingTime}
                  </p>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="border-0 p-4 bg-dark border-top border-secondary border-opacity-25 d-flex gap-2">
              <Button variant="link" onClick={() => setConfirmBooking(null)} className="text-white opacity-50 text-decoration-none fw-bold text-uppercase small me-auto">
                Cancel
              </Button>
              <Button 
                onClick={confirmMachineBooking}
                disabled={bookingLoading}
                className="px-4 py-3 rounded-0 fw-black text-uppercase shadow-sm"
                style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', letterSpacing: '1px' }}
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

export default Machines;
