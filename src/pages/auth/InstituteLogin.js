import React, { useState } from 'react';
import axios from 'axios';

export default function InstituteLogin() {
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/auth/login', loginData);
      
      // Store JWT and Role for RBAC
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.role);

      window.location.href = response.data.role === 'trainer' ? '/trainer/dashboard' : '/student/dashboard';
    } catch (err) {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="auth-container">
      <h2>Institute Sign In</h2>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Scholar No or Gmail Username" onChange={e => setLoginData({...loginData, username: e.target.value})} required />
        <input type="password" placeholder="Password" onChange={e => setLoginData({...loginData, password: e.target.value})} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}