import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Menu, X } from "lucide-react";
import "./Navbar.css";

const linkStyle = {
  color: "var(--text-primary)",
  textDecoration: "none",
  fontWeight: "500",
  fontSize: "16px",
  transition: "color 0.3s ease"
};

const profileLinkStyle = {
  ...linkStyle,
  color: "var(--accent-primary)",
  fontWeight: "bold"
};

const logoStyle = {
  fontSize: "20px",
  fontWeight: "900",
  letterSpacing: "2px",
  textDecoration: "none"
};

function Navbar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <>
      <nav className="custom-glass-nav">
        <div className="nav-container">
          {/* Logo */}
          <Link to="/" style={logoStyle}>
            <span style={{ color: "var(--accent-primary)" }}>Gold</span>
            <span style={{ color: "white" }}>fit</span>
          </Link>

          {/* Menu for Desktop */}
          <ul className="nav-menu">
            <li>
              <Link to="/" className={`nav-menu-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            </li>

            {user?.role === 'admin' && (
              <>
                <li>
                  <Link to="/admin/management" className={`nav-menu-link ${location.pathname === '/admin/management' ? 'active' : ''}`}>Management</Link>
                </li>
              </>
            )}

            {(user?.role === 'trainer' || user?.role === 'nutritionist') && (
              <li>
                <Link to="/specialist/dashboard" className={`nav-menu-link ${location.pathname === '/specialist/dashboard' ? 'active' : ''}`}>Specialist Dashboard</Link>
              </li>
            )}

            <li>
              <Link to="/trainers" className={`nav-menu-link ${location.pathname === '/trainers' ? 'active' : ''}`}>Trainers</Link>
            </li>

            <li>
              <Link to="/machines" className={`nav-menu-link ${location.pathname === '/machines' ? 'active' : ''}`}>Machines</Link>
            </li>

            <li>
              <Link to="/nutritionists" className={`nav-menu-link ${location.pathname === '/nutritionists' ? 'active' : ''}`}>Nutrition</Link>
            </li>

            {user ? (
              <>
                <li>
                  <Link to="/exercises" className={`nav-menu-link ${location.pathname === '/exercises' ? 'active' : ''}`}>Exercises</Link>
                </li>
                <li>
                  <Link to="/meals" className={`nav-menu-link ${location.pathname === '/meals' ? 'active' : ''}`}>Meals</Link>
                </li>
                {user && user.role === 'user' && (
                  <>
                    <li>
                      <Link to="/sessions" className={`nav-menu-link ${location.pathname === '/sessions' ? 'active' : ''}`}>Sessions</Link>
                    </li>
                    <li>
                      <Link to="/my-sessions" className={`nav-menu-link ${location.pathname === '/my-sessions' ? 'active' : ''}`}>My Sessions</Link>
                    </li>
                  </>
                )}
                <li>
                  <Link to="/subscriptions" className={`nav-menu-link ${location.pathname === '/subscriptions' ? 'active' : ''}`}>Packages</Link>
                </li>
                <li>
                  <Link to="/ai-plans" className={`nav-menu-link ${location.pathname === '/ai-plans' ? 'active' : ''}`}>AI Plans</Link>
                </li>
                <li>
                  <Link to="/wallet" className={`nav-menu-link ${location.pathname === '/wallet' ? 'active' : ''}`}>Wallet</Link>
                </li>
                <li>
                  <Link to="/profile" className={`nav-menu-link nav-menu-profile ${location.pathname === '/profile' ? 'active' : ''}`}>Profile</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className={`nav-menu-link ${location.pathname === '/login' ? 'active' : ''}`}>Login</Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="nav-menu-link"
                    style={{
                      background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                      color: "black",
                      fontWeight: "bold",
                      padding: "6px 20px",
                      borderRadius: "20px"
                    }}
                  >
                    Join
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Hamburger toggle button */}
          <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer Overlay */}
      {isOpen && (
        <div className="nav-mobile-overlay">
          <Link to="/" className={`nav-mobile-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/management" className={`nav-mobile-link ${location.pathname === '/admin/management' ? 'active' : ''}`}>Management</Link>
            </>
          )}

          {(user?.role === 'trainer' || user?.role === 'nutritionist') && (
            <Link to="/specialist/dashboard" className={`nav-mobile-link ${location.pathname === '/specialist/dashboard' ? 'active' : ''}`}>Specialist Dashboard</Link>
          )}

          <Link to="/trainers" className={`nav-mobile-link ${location.pathname === '/trainers' ? 'active' : ''}`}>Coaches</Link>
          <Link to="/machines" className={`nav-mobile-link ${location.pathname === '/machines' ? 'active' : ''}`}>Equipment Arsenal</Link>
          <Link to="/nutritionists" className={`nav-mobile-link ${location.pathname === '/nutritionists' ? 'active' : ''}`}>Nutritionists</Link>

          {user ? (
            <>
              <Link to="/exercises" className={`nav-mobile-link ${location.pathname === '/exercises' ? 'active' : ''}`}>Exercise Library</Link>
              <Link to="/meals" className={`nav-mobile-link ${location.pathname === '/meals' ? 'active' : ''}`}>Nutrition Catalog</Link>
              {user.role === 'user' && (
                <>
                  <Link to="/sessions" className={`nav-mobile-link ${location.pathname === '/sessions' ? 'active' : ''}`}>Sessions</Link>
                  <Link to="/my-sessions" className={`nav-mobile-link ${location.pathname === '/my-sessions' ? 'active' : ''}`}>My Sessions</Link>
                </>
              )}
              <Link to="/subscriptions" className={`nav-mobile-link ${location.pathname === '/subscriptions' ? 'active' : ''}`}>Packages</Link>
              <Link to="/ai-plans" className={`nav-mobile-link ${location.pathname === '/ai-plans' ? 'active' : ''}`}>AI Plans</Link>
              <Link to="/wallet" className={`nav-mobile-link ${location.pathname === '/wallet' ? 'active' : ''}`}>Wallet</Link>
              <Link to="/profile" className={`nav-mobile-link nav-menu-profile ${location.pathname === '/profile' ? 'active' : ''}`}>Profile</Link>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-mobile-link ${location.pathname === '/login' ? 'active' : ''}`}>Login</Link>
              <Link
                to="/register"
                className="nav-mobile-link"
                style={{
                  background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                  color: "black",
                  fontWeight: "bold",
                  textAlign: "center"
                }}
              >
                Join Goldfit
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default Navbar;
