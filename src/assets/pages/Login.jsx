import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Dumbbell } from 'lucide-react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      alert("Login successful! Redirecting...");
      // Wait for user state to update
      setTimeout(() => {
        const storedUser = JSON.parse(window.localStorage.getItem('goldfit_auth_user') || '{}');
        if (storedUser.role === 'trainer' || storedUser.role === 'nutritionist') {
          navigate('/specialist/dashboard');
        } else {
          navigate('/profile');
        }
      }, 100);
    } else {
      setError(result.message);
    }
  };

  const quickLogin = async (userEmail, userPassword) => {
    setEmail(userEmail);
    setPassword(userPassword);
    const result = await login(userEmail, userPassword);
    if (result.success) {
      alert("Login successful! Redirecting...");
      setTimeout(() => {
        const storedUser = JSON.parse(window.localStorage.getItem('goldfit_auth_user') || '{}');
        if (storedUser.role === 'trainer' || storedUser.role === 'nutritionist') {
          navigate('/specialist/dashboard');
        } else {
          navigate('/profile');
        }
      }, 100);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={6} xl={5}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="login-card border-0">
                <div className="text-center mb-5">
                  <Dumbbell size={50} className="login-logo mb-3" />
                  <h2 className="login-title text-white">
                    GoldFit <span className="text-gradient">Portal</span>
                  </h2>
                  <p className="text-muted small">Access your elite training dashboard</p>
                </div>

                {error && (
                  <Alert variant="danger" className="py-2 small bg-danger bg-opacity-10 border-danger border-opacity-20 text-danger">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4 position-relative" controlId="formBasicEmail">
                    <div className="input-icon-wrapper">
                      <Form.Control
                        type="email"
                        placeholder="Email address"
                        className="form-control-dark"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <Mail className="input-icon" size={18} />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4 position-relative" controlId="formBasicPassword">
                    <div className="input-icon-wrapper">
                      <Form.Control
                        type="password"
                        placeholder="Password"
                        className="form-control-dark"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Lock className="input-icon" size={18} />
                    </div>
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-4 small">
                    <Form.Check 
                      type="checkbox" 
                      label="Stay signed in" 
                      className="text-muted border-accent"
                    />
                    <a href="#" className="login-link">Forgot password?</a>
                  </div>

                  <Button type="submit" className="btn-login w-100 mb-4">
                    Authenticate
                  </Button>
                </Form>

                {/* Quick Login Buttons */}
                <div className="mt-4 pt-3 border-top border-secondary border-opacity-20">
                  <p className="text-muted small mb-3 text-center text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>Quick Login</p>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="warning" 
                      className="flex-1"
                      style={{ background: 'linear-gradient(135deg, #ff7a00 0%, #ff4400 100%)', border: 'none', color: '#000' }}
                      onClick={() => quickLogin('trainer@goldfit.local', 'password')}
                    >
                      Trainer
                    </Button>
                    <Button 
                      variant="info" 
                      className="flex-1"
                      style={{ background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)', border: 'none', color: '#fff' }}
                      onClick={() => quickLogin('nutritionist@goldfit.local', 'password')}
                    >
                      Nutritionist
                    </Button>
                  </div>
                </div>

                <div className="text-center mt-3">
                  <p className="text-muted small mb-0">
                    New to GoldFit? <Link to="/register" className="login-link">Create Account</Link>
                  </p>
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;