import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, Clock, Save, ArrowLeft } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateSpecialistProfile, getSpecialistDashboard } from '../../api/specialistApi';
import { toast } from 'react-toastify';

function SpecialistProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    achievements: '',
    experience_years: '5'
  });

  const fetchProfileData = async () => {
    try {
      const res = await getSpecialistDashboard();
      if (res.data && res.data.specialist_profile) {
        const profile = res.data.specialist_profile;
        setFormData({
          bio: profile.bio || '',
          achievements: Array.isArray(profile.achievements) ? profile.achievements.join(', ') : (profile.achievements || ''),
          experience_years: profile.experience_years ? String(profile.experience_years) : '5'
        });
      }
    } catch (e) {
      console.error('Failed to load profile details:', e);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'trainer' || user.role === 'nutritionist')) {
      fetchProfileData();
    }
  }, [user]);

  if (!user || (user.role !== 'trainer' && user.role !== 'nutritionist')) {
    return <Navigate to="/" />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        bio: formData.bio,
        achievements: formData.achievements.split(',').map(item => item.trim()).filter(Boolean),
        experience_years: parseInt(formData.experience_years) || 5
      };

      const res = await updateSpecialistProfile(payload);
      if (res.data && res.data.success) {
        toast.success('Specialist profile updated successfully!');
        navigate('/specialist/dashboard');
      } else {
        toast.error(res.data?.message || 'Failed to update profile.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update specialist profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container text-white d-flex align-items-center justify-content-center py-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="profile-card p-4 col-12 col-md-8 col-lg-6"
        style={{
          background: 'rgba(20, 20, 20, 0.65)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}
      >
        <div className="d-flex align-items-center gap-2 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
          <button
            onClick={() => navigate('/specialist/dashboard')}
            className="btn btn-link text-white p-0 d-flex align-items-center justify-content-center"
            style={{ textDecoration: 'none' }}
          >
            <ArrowLeft size={24} className="text-warning hover-lift" />
          </button>
          <h2 className="profile-name m-0 fs-3 fw-black text-gradient">Qualifications Profile</h2>
        </div>

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div className="form-group">
            <label className="text-secondary small fw-bold text-uppercase mb-2 d-flex align-items-center gap-2">
              <Clock size={14} className="text-warning" /> Years of Experience
            </label>
            <input
              type="number"
              name="experience_years"
              value={formData.experience_years}
              onChange={handleChange}
              className="form-control text-white bg-black bg-opacity-50 border border-secondary border-opacity-25 py-2 px-3"
              style={{ borderRadius: '8px', outline: 'none', boxShadow: 'none' }}
              required
            />
          </div>

          <div className="form-group">
            <label className="text-secondary small fw-bold text-uppercase mb-2 d-flex align-items-center gap-2">
              <Award size={14} className="text-warning" /> Certifications & Achievements
            </label>
            <input
              type="text"
              name="achievements"
              value={formData.achievements}
              onChange={handleChange}
              placeholder="e.g. IFBB Pro Card, ISSA Certified, CPR First Aid (comma separated)"
              className="form-control text-white bg-black bg-opacity-50 border border-secondary border-opacity-25 py-2 px-3"
              style={{ borderRadius: '8px', outline: 'none', boxShadow: 'none' }}
            />
            <span className="text-secondary small mt-1 d-block" style={{ fontSize: '0.65rem' }}>Separate multiple certifications with commas.</span>
          </div>

          <div className="form-group">
            <label className="text-secondary small fw-bold text-uppercase mb-2 d-flex align-items-center gap-2">
              <BookOpen size={14} className="text-warning" /> Biography / Philosophy
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Detail your coaching philosophy, style, and professional history..."
              className="form-control text-white bg-black bg-opacity-50 border border-secondary border-opacity-25 py-2 px-3"
              style={{ borderRadius: '8px', outline: 'none', boxShadow: 'none' }}
              rows="4"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-warning mt-4 py-2.5 px-4 fw-black text-uppercase d-flex align-items-center justify-content-center gap-2"
            style={{
              borderRadius: '8px',
              letterSpacing: '1px',
              background: 'linear-gradient(135deg, #ff7a00 0%, #ff4400 100%)',
              border: 'none',
              color: '#000',
              fontWeight: 800
            }}
          >
            <Save size={18} /> {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default SpecialistProfile;
