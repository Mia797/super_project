
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Hammer, ClipboardList, UserCheck, Users, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  updateSubscription,
  deleteSubscription,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  createSpecialist,
  updateAuthUser,
  getUserDetail,
  deleteTrainer,
  deleteNutritionist,
  deleteUser
} from '../../api/adminApi';
import { createSubscriptionPlan } from '../../api/subscriptionApi';
import { toast } from 'react-toastify';

const parseUsersList = (result) => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.users)) return result.users;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.users)) return result.data.users;
  return Object.values(result || {}).filter((v) => typeof v === 'object' && v?.id);
};

const resolveSpecialistUserId = (spec) =>
  Number(spec?.user_id ?? spec?.userId ?? spec?.id);

function AdminManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
 
  const [activeTab, setActiveTab] = useState('equipment');
  const [loading, setLoading] = useState(false);

  // Data states
  const [equipments, setEquipments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [specialists, setSpecialists] = useState([]);
 
  // Forms state
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [equipmentForm, setEquipmentForm] = useState({ name: '', description: '', status: 'available', booking_price: '25' });
  const [subForm, setSubForm] = useState({ name: '', price: '', duration_days: '30', description: '', has_trainer: false, has_nutritionist: false, plan_type: 'both' });
  const [editingSub, setEditingSub] = useState(null);
  const emptySpecForm = {
    name: '', email: '', password: '', role_name: 'trainer', phone: '', bio: '',
    address: '', age: '', gender: 'male'
  };
  const [specForm, setSpecForm] = useState(emptySpecForm);
  const [editingSpec, setEditingSpec] = useState(null); // Added state to track currently edited specialist
  const [deleteUserId, setDeleteUserId] = useState('');
  const [users, setUsers] = useState([]);

  // Fetch functions
  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/equipment');
      if (res.data) {
        setEquipments(res.data.equipment || (Array.isArray(res.data) ? res.data : []));
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to fetch equipment inventory.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/subscriptions');
      if (res.data) {
        setSubscriptions(res.data.plans || res.data.subscriptions || (Array.isArray(res.data) ? res.data : []));
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to fetch subscription plans.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialists = async () => {
    setLoading(true);
    try {
      const trainersRes = await axios.get('/api/trainers');
      const nutritionistsRes = await axios.get('/api/nutritionists');

      const trainersList = (trainersRes.data?.trainers || []).map((t) => ({ ...t, role: 'trainer' }));
      const nutritionistsList = (nutritionistsRes.data?.nutritionists || []).map((n) => ({ ...n, role: 'nutritionist' }));

      setSpecialists([...trainersList, ...nutritionistsList]);
    } catch (e) {
      console.error(e);
      toast.error('Failed to fetch specialists list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users');
      setUsers(parseUsersList(res.data));
    } catch (e) {
      toast.error('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const loadData = async () => {
      if (activeTab === 'equipment') await fetchEquipments();
      if (activeTab === 'packages') await fetchSubscriptions();
      if (activeTab === 'specialists') await fetchSpecialists();
      if (activeTab === 'users') await fetchUsers();
    };

    loadData();
  }, [user, activeTab]);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  // Handle submits
  const handleAddEquipment = async (e) => {
    e.preventDefault();
    if (!equipmentForm.name.trim()) return;

    try {
      const payload = {
        ...equipmentForm,
        booking_price: Number(equipmentForm.booking_price) || 0
      };

      const res = editingEquipment
        ? await updateEquipment({ id: editingEquipment.id, ...payload })
        : await createEquipment(payload);

      if (res.data && res.data.success) {
        toast.success(editingEquipment ? 'Equipment updated successfully!' : 'Equipment registered successfully!');
        setEditingEquipment(null);
        setEquipmentForm({ name: '', description: '', status: 'available', booking_price: '25' });
        fetchEquipments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || (editingEquipment ? 'Failed to update equipment.' : 'Failed to add equipment.'));
    }
  };

  const handleEditEquipment = (equipment) => {
    setEditingEquipment(equipment);
    setEquipmentForm({
      name: equipment.name || '',
      description: equipment.description || '',
      status: equipment.status || 'available',
      booking_price: String(equipment.booking_price ?? 25)
    });
  };

  const handleDeleteEquipment = async (id) => {
    if (!confirm('Are you sure you want to remove this equipment?')) return;
    try {
      const res = await deleteEquipment(id);
      if (res.data && res.data.success) {
        toast.success('Equipment removed.');
        fetchEquipments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Deletion failed.');
    }
  };

  const handleAddSub = async (e) => {
    e.preventDefault();
    if (!subForm.name.trim() || !subForm.price) return;
   
    try {
      const planType =
        subForm.plan_type ||
        (subForm.has_trainer && subForm.has_nutritionist
          ? 'both'
          : subForm.has_trainer
            ? 'gym'
            : subForm.has_nutritionist
              ? 'diet'
              : 'both');

      const payload = {
        name: subForm.name,
        price: parseFloat(subForm.price),
        duration_days: parseInt(subForm.duration_days),
        description: subForm.description,
        plan_type: planType,
        has_trainer: subForm.has_trainer ? 1 : 0,
        has_nutritionist: subForm.has_nutritionist ? 1 : 0
      };
     
      const res = await createSubscriptionPlan(payload);
      if (res.data && res.data.success) {
        toast.success('Subscription plan created!');
        setSubForm({ name: '', price: '', duration_days: '30', description: '', has_trainer: false, has_nutritionist: false, plan_type: 'both' });
        fetchSubscriptions();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create plan.');
    }
  };

  const handleUpdateSub = async (e) => {
    e.preventDefault();
    if (!subForm.name.trim() || !subForm.price || !editingSub) return;
   
    try {
      const payload = {
        id: editingSub.id,
        name: subForm.name,
        price: parseFloat(subForm.price),
        duration_days: parseInt(subForm.duration_days),
        description: subForm.description,
        plan_type: subForm.plan_type || 'both'
      };
     
      const res = await updateSubscription(payload);
      if (res.data && res.data.success) {
        toast.success('Subscription plan updated!');
        setEditingSub(null);
        setSubForm({ name: '', price: '', duration_days: '30', description: '', has_trainer: false, has_nutritionist: false, plan_type: 'both' });
        fetchSubscriptions();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update plan.');
    }
  };

  const handleDeleteSub = async (id) => {
    if (!confirm('Are you sure you want to delete this subscription plan?')) return;
    try {
      const res = await deleteSubscription(id);
      if (res.data && res.data.success) {
        toast.success('Plan deleted successfully.');
        fetchSubscriptions();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Deletion failed.');
    }
  };

  const handleAddSpec = async (e) => {
    e.preventDefault();
    if (!specForm.name.trim()) return;
    if (!editingSpec && (!specForm.email.trim() || !specForm.password.trim())) return;
   
    try {
      if (editingSpec) {
        const payload = {
          user_id: resolveSpecialistUserId(editingSpec),
          name: specForm.name,
          phone: specForm.phone,
          address: specForm.address,
          age: parseInt(specForm.age) || null,
          gender: specForm.gender
        };
        const res = await updateAuthUser(payload);
        if (res.data && (res.data.success || res.data.message)) {
          toast.success(res.data.message || 'Specialist updated successfully!');
          setSpecialists((prev) =>
            prev.map((s) =>
              resolveSpecialistUserId(s) === payload.user_id
                ? { ...s, ...payload }
                : s
            )
          );
          setEditingSpec(null);
          setSpecForm(emptySpecForm);
          fetchSpecialists();
        } else {
          toast.error(res.data?.message || 'Failed to update specialist.');
        }
      } else {
        const res = await createSpecialist(specForm);
        if (res.data && res.data.success) {
          toast.success('Specialist registered successfully!');
          setSpecForm(emptySpecForm);
          fetchSpecialists();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed.');
    }
  };

  const handleEditSpec = async (spec) => {
    setEditingSpec(spec);

    const userId = resolveSpecialistUserId(spec);

    try {
      const res = await getUserDetail(userId);
      const detail = res.data?.user;

      if (!detail) {
        toast.error(res.data?.message || 'Failed to load specialist details.');
        return;
      }

      setSpecForm({
        name: detail.name || spec.name || '',
        email: spec.email || '',
        password: '',
        role_name: spec.role || 'trainer',
        phone: detail.phone || '',
        bio: (spec.bio?.text ?? spec.bio) || '',
        address: detail.address || '',
        age: detail.age != null && detail.age !== '' ? String(detail.age) : '',
        gender: detail.gender || 'male'
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load specialist details.');
    }
  };

  const handleDeleteSpec = async (spec) => {
    if (!confirm('Are you sure you want to delete this specialist account?')) return;
    try {
      const deleteRequest = spec.role === 'nutritionist' ? deleteNutritionist : deleteTrainer;
      const res = await deleteRequest(spec.id);
      if (res.data && res.data.success) {
        toast.success('Specialist account deleted.');
        fetchSpecialists();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Deletion failed.');
    }
  };

  const handleDeleteUserSubmit = async (e) => {
    e.preventDefault();
    if (!deleteUserId.trim()) return;
    if (!confirm(`Are you sure you want to delete user account ID: ${deleteUserId}?`)) return;

    try {
      const res = await deleteUser(parseInt(deleteUserId));
      if (res.data && res.data.success) {
        toast.success('User account deleted.');
        setDeleteUserId('');
        fetchUsers();
      } else {
        toast.error(res.data?.message || 'Failed to delete user.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user account.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm(`Are you sure you want to delete user account ID: ${id}?`)) return;
    try {
      const res = await deleteUser(id);
      if (res.data && res.data.success) {
        toast.success('User account deleted.');
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="profile-container text-white py-5 px-3 min-vh-100" style={{ background: '#0a0a0a' }}>
      <div className="max-width-lg mx-auto" style={{ maxWidth: '1050px' }}>
       
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-5 border-bottom border-secondary border-opacity-15 pb-4">
          <button
            onClick={() => navigate('/')}
            className="btn btn-link text-white p-0 d-flex align-items-center justify-content-center"
            style={{ textDecoration: 'none' }}
          >
            <ArrowLeft size={24} className="text-warning hover-lift" />
          </button>
          <div>
            <h1 className="fw-black text-gradient display-6 mb-1" style={{ fontWeight: 900 }}>Management Console</h1>
            <p className="text-secondary small m-0">Admin controls for equipment inventories, plans database, specialists, and users.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="d-flex gap-2 overflow-auto pb-3 mb-5 scrollbar-hidden">
          {[
            { id: 'equipment', label: 'Equipments', icon: Hammer },
            { id: 'packages', label: 'Subscriptions', icon: ClipboardList },
            { id: 'specialists', label: 'Specialists', icon: UserCheck },
            { id: 'users', label: 'Users Control', icon: Users }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setEditingSub(null);
                  setEditingEquipment(null);
                  setEditingSpec(null);
                  setEquipmentForm({ name: '', description: '', status: 'available', booking_price: '25' });
                  setSubForm({ name: '', price: '', duration_days: '30', description: '', has_trainer: false, has_nutritionist: false, plan_type: 'both' });
                  setSpecForm(emptySpecForm);
                }}
                className="btn px-4 py-2.5 fw-bold text-uppercase d-flex align-items-center gap-2 hover-lift"
                style={{
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  background: isSelected
                    ? 'linear-gradient(135deg, #ff7a00 0%, #ff4400 100%)'
                    : 'rgba(255, 255, 255, 0.03)',
                  color: isSelected ? '#000' : '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  fontWeight: 800,
                  whiteSpace: 'nowrap'
                }}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="row g-4">
         
          {/* Active Tab Lists */}
          <div className="col-12 col-lg-7">
            <h3 className="fw-black text-white mb-4 fs-5 text-uppercase" style={{ letterSpacing: '1px' }}>
              Active Database Records
            </h3>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status"></div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
               
                {/* Equipment List */}
                {activeTab === 'equipment' && (
                  equipments.length === 0 ? (
                    <div className="text-center py-4 text-secondary small">No machines currently listed.</div>
                  ) : (
                    equipments.map((eq, idx) => (
                      <div key={eq.id || idx} className="p-3 d-flex justify-content-between align-items-center" style={{ background: 'rgba(25,25,25,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                        <div>
                          <strong className="text-white d-block">{eq.name}</strong>
                          <span className="text-secondary small d-block mt-0.5" style={{ fontSize: '0.75rem' }}>Status: <span className="text-warning">{eq.status}</span> | {Number(eq.booking_price || 0).toFixed(0)} Tokens / hr</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            onClick={() => handleEditEquipment(eq)}
                            className="btn btn-sm btn-outline-warning py-1 px-2.5 fw-bold text-uppercase"
                            style={{ fontSize: '0.65rem', borderRadius: '6px' }}
                          >
                            Edit
                          </button>
                          <button onClick={() => handleDeleteEquipment(eq.id)} className="btn btn-link text-danger p-2 hover-lift"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))
                  )
                )}

                {/* Subscriptions List */}
                {activeTab === 'packages' && (
                  subscriptions.length === 0 ? (
                    <div className="text-center py-4 text-secondary small">No plans currently cataloged.</div>
                  ) : (
                    subscriptions.map((sub, idx) => (
                      <div key={sub.id || idx} className="p-3 d-flex justify-content-between align-items-center" style={{ background: 'rgba(25,25,25,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                        <div>
                          <strong className="text-white d-block">{sub.name}</strong>
                          <span className="text-secondary small d-block mt-0.5" style={{ fontSize: '0.75rem' }}>Price: {sub.price} Tokens | {sub.duration_days || '30'} Days</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingSub(sub);
                              const pType = sub.plan_type ||
                                            ((sub.has_trainer && sub.has_nutritionist) ? 'both' :
                                             sub.has_trainer ? 'gym' :
                                             sub.has_nutritionist ? 'diet' : 'both');
                              setSubForm({
                                name: sub.name,
                                price: sub.price.toString(),
                                duration_days: (sub.duration_days || 30).toString(),
                                description: sub.description || '',
                                has_trainer: !!sub.has_trainer,
                                has_nutritionist: !!sub.has_nutritionist,
                                plan_type: pType
                              });
                            }}
                            className="btn btn-sm btn-outline-warning py-1 px-2.5 fw-bold text-uppercase"
                            style={{ fontSize: '0.65rem', borderRadius: '6px' }}
                          >
                            Edit
                          </button>
                          <button onClick={() => handleDeleteSub(sub.id)} className="btn btn-link text-danger p-2 hover-lift"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))
                  )
                )}

                {/* Specialists Roster */}
                {activeTab === 'specialists' && (
                  specialists.length === 0 ? (
                    <div className="text-center py-4 text-secondary small">Roster currently empty.</div>
                  ) : (
                    specialists.map((spec, idx) => (
                      <div key={spec.id || idx} className="p-3 d-flex justify-content-between align-items-center" style={{ background: 'rgba(25,25,25,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                        <div>
                          <strong className="text-white d-block">{spec.name}</strong>
                          <span className="text-secondary small d-block mt-0.5" style={{ fontSize: '0.75rem' }}>Role: <span className="text-warning text-uppercase">{spec.role}</span> | {spec.email}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            onClick={() => handleEditSpec(spec)}
                            className="btn btn-sm btn-outline-warning py-1 px-2.5 fw-bold text-uppercase"
                            style={{ fontSize: '0.65rem', borderRadius: '6px' }}
                          >
                            Edit
                          </button>
                          <button onClick={() => handleDeleteSpec(spec)} className="btn btn-link text-danger p-2 hover-lift"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))
                  )
                )}

                {/* Users List Information */}
                {activeTab === 'users' && (
                  users.length === 0 ? (
                    <div className="text-center py-4 text-secondary">
                      No users found
                    </div>
                  ) : (
                    users.map((u) => (
                      <div
                        key={u.id}
                        className="p-3 d-flex justify-content-between align-items-center"
                        style={{
                          background: 'rgba(25,25,25,0.4)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '10px'
                        }}
                      >
                        <div>
                          <strong className="text-white d-block">
                            {u.name}
                          </strong>
                          <span className="text-secondary small d-block">
                            Email: {u.email}
                          </span>
                          <span className="text-info small d-block">
                            ID: {u.id}
                          </span>
                          <span className="text-success small d-block">
                            Phone: {u.phone || 'N/A'}
                          </span>
                          <span className="text-warning small d-block text-uppercase">
                            Role: {u.role_name || u.role}
                          </span>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="btn btn-link text-danger p-2 hover-lift"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            )}
          </div>

          {/* Form Actions (Right Pane) */}
          <div className="col-12 col-lg-5">
            <div
              className="p-4"
              style={{
                background: 'rgba(20, 20, 20, 0.75)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
              }}
            >
              <h3 className="fw-black text-warning mb-4 fs-5 text-uppercase" style={{ letterSpacing: '1px' }}>
                {editingSub ? 'Edit Subscription Plan' : editingEquipment ? 'Edit Machine' : editingSpec ? 'Edit Specialist' : 'Quick Register Form'}
              </h3>

              {/* Equipment Form */}
              {activeTab === 'equipment' && (
                <form onSubmit={handleAddEquipment} className="d-flex flex-column gap-3">
                  <div className="form-group">
                    <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Machine Name</label>
                    <input
                      type="text"
                      value={equipmentForm.name}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                      placeholder="e.g. Treadmill X2"
                      className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Description</label>
                    <input
                      type="text"
                      value={equipmentForm.description}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, description: e.target.value })}
                      placeholder="e.g. Cardio workout with heart rate metrics"
                      className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                    />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Status</label>
                      <select
                        value={equipmentForm.status}
                        onChange={(e) => setEquipmentForm({ ...equipmentForm, status: e.target.value })}
                        className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                      >
                        <option value="available">Available</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="busy">In Use</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Booking Price / hr</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={equipmentForm.booking_price}
                        onChange={(e) => setEquipmentForm({ ...equipmentForm, booking_price: e.target.value })}
                        className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                      />
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    <button type="submit" className="btn btn-warning flex-grow-1 fw-bold text-uppercase py-2" style={{ background: 'linear-gradient(135deg, #ff7a00 0%, #ff4400 100%)', border: 'none', color: '#000' }}>
                      {editingEquipment ? 'Update Machine' : 'Register Machine'}
                    </button>
                    {editingEquipment && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEquipment(null);
                          setEquipmentForm({ name: '', description: '', status: 'available', booking_price: '25' });
                        }}
                        className="btn btn-outline-secondary fw-bold text-uppercase py-2"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Subscription Packages Form */}
              {activeTab === 'packages' && (
                <form onSubmit={editingSub ? handleUpdateSub : handleAddSub} className="d-flex flex-column gap-3">
                  {editingSub && (
                    <div className="form-group">
                      <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Plan ID (Editing)</label>
                      <input
                        type="text"
                        value={editingSub.id}
                        disabled
                        className="form-control text-white-50 bg-black bg-opacity-60 border border-secondary border-opacity-10"
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Plan Name</label>
                    <input
                      type="text"
                      value={subForm.name}
                      onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                      placeholder="e.g. VIP Gladiator"
                      className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                      required
                    />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Price (Tokens)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={subForm.price}
                        onChange={(e) => setSubForm({ ...subForm, price: e.target.value })}
                        placeholder="e.g. 99.99"
                        className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Duration (Days)</label>
                      <input
                        type="number"
                        value={subForm.duration_days}
                        onChange={(e) => setSubForm({ ...subForm, duration_days: e.target.value })}
                        className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Plan Type</label>
                    <select
                      value={subForm.plan_type || 'both'}
                      onChange={(e) => setSubForm({ ...subForm, plan_type: e.target.value })}
                      className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                    >
                      <option value="both">Both (Gym + Diet)</option>
                      <option value="gym">Gym Only</option>
                      <option value="diet">Diet Only</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Description</label>
                    <textarea
                      value={subForm.description}
                      onChange={(e) => setSubForm({ ...subForm, description: e.target.value })}
                      placeholder="List privileges of the membership plan..."
                      className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="d-flex gap-2 mt-3">
                    <button type="submit" className="btn btn-warning flex-grow-1 fw-bold text-uppercase py-2" style={{ background: 'linear-gradient(135deg, #ff7a00 0%, #ff4400 100%)', border: 'none', color: '#000' }}>
                      {editingSub ? 'Update Package' : 'Create Package'}
                    </button>
                    {editingSub && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSub(null);
                          setSubForm({ name: '', price: '', duration_days: '30', description: '', has_trainer: false, has_nutritionist: false, plan_type: 'both' });
                        }}
                        className="btn btn-outline-secondary fw-bold text-uppercase py-2"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Specialists Form */}
              {activeTab === 'specialists' && (
                <form onSubmit={handleAddSpec} className="d-flex flex-column gap-3">
                  {editingSpec ? (
                    <>
                      <div className="form-group">
                        <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">User ID</label>
                        <input
                          type="text"
                          value={resolveSpecialistUserId(editingSpec) ?? ''}
                          disabled
                          className="form-control text-white-50 bg-black bg-opacity-60 border border-secondary border-opacity-10"
                        />
                      </div>
                      <div className="form-group">
                        <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Name</label>
                        <input
                          type="text"
                          value={specForm.name}
                          onChange={(e) => setSpecForm({ ...specForm, name: e.target.value })}
                          className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Phone</label>
                        <input
                          type="text"
                          value={specForm.phone}
                          onChange={(e) => setSpecForm({ ...specForm, phone: e.target.value })}
                          className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                        />
                      </div>
                      <div className="form-group">
                        <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Address</label>
                        <input
                          type="text"
                          value={specForm.address}
                          onChange={(e) => setSpecForm({ ...specForm, address: e.target.value })}
                          className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                        />
                      </div>
                      <div className="row g-2">
                        <div className="col-6">
                          <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Age</label>
                          <input
                            type="number"
                            min="1"
                            value={specForm.age}
                            onChange={(e) => setSpecForm({ ...specForm, age: e.target.value })}
                            className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                          />
                        </div>
                        <div className="col-6">
                          <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Gender</label>
                          <select
                            value={specForm.gender}
                            onChange={(e) => setSpecForm({ ...specForm, gender: e.target.value })}
                            className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="form-group">
                        <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Name</label>
                        <input
                          type="text"
                          value={specForm.name}
                          onChange={(e) => setSpecForm({ ...specForm, name: e.target.value })}
                          className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Email</label>
                        <input
                          type="email"
                          value={specForm.email}
                          onChange={(e) => setSpecForm({ ...specForm, email: e.target.value })}
                          className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Password</label>
                        <input
                          type="password"
                          value={specForm.password}
                          onChange={(e) => setSpecForm({ ...specForm, password: e.target.value })}
                          className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Role</label>
                        <select
                          value={specForm.role_name}
                          onChange={(e) => setSpecForm({ ...specForm, role_name: e.target.value })}
                          className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                        >
                          <option value="trainer">Trainer</option>
                          <option value="nutritionist">Nutritionist</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Phone</label>
                        <input
                          type="text"
                          value={specForm.phone}
                          onChange={(e) => setSpecForm({ ...specForm, phone: e.target.value })}
                          className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                        />
                      </div>
                      <div className="form-group">
                        <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Bio</label>
                        <textarea
                          value={specForm.bio}
                          onChange={(e) => setSpecForm({ ...specForm, bio: e.target.value })}
                          className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                          rows="3"
                        ></textarea>
                      </div>
                    </>
                  )}
                  <div className="d-flex gap-2 mt-3">
                    <button type="submit" className="btn btn-warning flex-grow-1 fw-bold text-uppercase py-2" style={{ background: 'linear-gradient(135deg, #ff7a00 0%, #ff4400 100%)', border: 'none', color: '#000' }}>
                      {editingSpec ? 'Update Specialist' : 'Register Specialist'}
                    </button>
                    {editingSpec && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSpec(null);
                          setSpecForm(emptySpecForm);
                        }}
                        className="btn btn-outline-secondary fw-bold text-uppercase py-2"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Users Form Operations */}
              {activeTab === 'users' && (
                <form onSubmit={handleDeleteUserSubmit} className="d-flex flex-column gap-3">
                  <div className="form-group">
                    <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">Target Account ID</label>
                    <input
                      type="text"
                      value={deleteUserId}
                      onChange={(e) => setDeleteUserId(e.target.value)}
                      placeholder="Enter user account ID"
                      className="form-control text-white bg-black bg-opacity-40 border border-secondary border-opacity-25"
                    />
                  </div>
                  <button type="submit" className="btn btn-danger w-100 fw-bold text-uppercase py-2 mt-3">
                    Purge Account
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminManagement;
