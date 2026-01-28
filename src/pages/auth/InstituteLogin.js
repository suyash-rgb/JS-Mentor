import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function InstituteLogin() {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    //username parsing logic
    const processedUsername = loginData.username.includes('@')
      ? loginData.username.split('@')[0]
      : loginData.username;

    try {
      const res = await axios.post('http://localhost:8000/auth/login', { 
        username: processedUsername 
        , password: loginData.password
      });

      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('role', res.data.role);
      
      window.location.href = res.data.role === 'trainer' ? '/trainer/dashboard' : '/student/dashboard';
    } catch (err) {
      alert("Login failed. Check your Scholar No or Username.");
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) return null;

  return (
    <div className="auth-page-wrapper">
      <style>{`
        .auth-page-wrapper {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f4f7f9;
          padding: 20px;
          font-family: 'Segoe UI', sans-serif;
        }
        .auth-card {
          background: #fff;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          width: 100%;
          max-width: 400px;
          box-sizing: border-box;
        }
        .auth-title { font-size: 24px; font-weight: 700; color: #1a202c; margin-bottom: 8px; text-align: center; }
        .auth-subtitle { font-size: 14px; color: #718096; margin-bottom: 30px; text-align: center; }
        .form-group { margin-bottom: 20px; display: flex; flex-direction: column; }
        .form-label { font-size: 12px; font-weight: 600; color: #4a5568; margin-bottom: 6px; text-transform: uppercase; }
        .form-input { padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 15px; width: 100%; box-sizing: border-box; }
        .submit-btn { background: rgb(240 82 4); color: white; padding: 14px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 10px; }
        .auth-footer { margin-top: 25px; text-align: center; font-size: 14px; color: #718096; }
        .auth-link { color: #3182ce; text-decoration: none; font-weight: 600; }
        
        @media (max-width: 480px) {
          .auth-card { padding: 25px; }
        }
      `}</style>

      <div className="auth-card">
        <h1 className="auth-title">Institute Login</h1>
        <p className="auth-subtitle">Welcome back! Sign in with your scholar number or Gmail.</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              className="form-input" 
              placeholder="Scholar No or Gmail Username"
              value={loginData.username}
              onChange={e => setLoginData({...loginData, username: e.target.value})} 
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password"
              className="form-input" 
              placeholder="••••••••"
              value={loginData.password}
              onChange={e => setLoginData({...loginData, password: e.target.value})} 
              required
            />
          </div>

          <button className="submit-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          New to the institute? <Link to="/institute/signup" className="auth-link">Enroll here</Link>
          <div style={{marginTop: '15px'}}>
            <Link to="/" style={{fontSize: '12px', color: '#a0aec0', textDecoration: 'none'}}>Back to Visitor Portal</Link>
          </div>
        </div>
      </div>
    </div>
  );
} 