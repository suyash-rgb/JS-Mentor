import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function InstituteLogin() {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480);

  // Responsive listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 480);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/auth/login', loginData);
      
      // Store JWT and Role for RBAC
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.role);

      // Redirect based on role
      window.location.href = response.data.role === 'trainer' ? '/trainer/dashboard' : '/student/dashboard';
    } catch (err) {
      alert("Invalid Credentials. Please check your Scholar No or Username.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={{
        ...styles.card, 
        width: isMobile ? '90%' : '400px', 
        padding: isMobile ? '25px' : '400px' // Adjusting padding for mobile
      }}>
        <h1 style={styles.title}>Institute Login</h1>
        <p style={styles.subtitle}>Welcome back! Please enter your institute credentials.</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Identity</label>
            <input 
              style={styles.input}
              type="text" 
              placeholder="Scholar no or mail"
              value={loginData.username}
              onChange={e => setLoginData({...loginData, username: e.target.value})} 
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              style={styles.input}
              type="password" 
              placeholder="••••••••"
              value={loginData.password}
              onChange={e => setLoginData({...loginData, password: e.target.value})} 
              required 
            />
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          New to the institute? <Link to="/institute/signup" style={styles.link}>Enroll here</Link>
          <br />
          <div style={{marginTop: '15px'}}>
             <Link to="/" style={{fontSize: '12px', color: '#a0aec0', textDecoration: 'none'}}>
                Back to Guest Portal
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f7f9',
    padding: '10px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    boxSizing: 'border-box' // Essential for responsiveness
  },
  title: { fontSize: '24px', fontWeight: '700', color: '#1a202c', marginBottom: '8px', textAlign: 'center' },
  subtitle: { fontSize: '14px', color: '#718096', marginBottom: '30px', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column' },
  inputGroup: { marginBottom: '20px', display: 'flex', flexDirection: 'column' },
  label: { fontSize: '12px', fontWeight: '600', color: '#4a5568', marginBottom: '6px', textTransform: 'uppercase' },
  input: {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  },
  submitBtn: {
    backgroundColor: '#3182ce',
    color: '#fff',
    padding: '14px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s'
  },
  footer: { marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#718096' },
  link: { color: '#3182ce', textDecoration: 'none', fontWeight: '600' }
};