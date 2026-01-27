import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function InstituteSignUp() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone_no: '', scholar_no: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let tempErrors = {};
    if (!/^[a-zA-Z\s]+$/.test(formData.name)) tempErrors.name = "Letters only, please.";
    
    const allowedDomains = ["gmail", "yahoo", "hotmail", "jsmentor", "outlook", "zoho"];
    const domainPattern = new RegExp(`@(${allowedDomains.join('|')})\\.`);
    if (!domainPattern.test(formData.email)) tempErrors.email = "Use an approved domain (e.g., @jsmentor.com).";
    
    if (formData.password.length < 6) tempErrors.password = "Minimum 6 characters required.";
    if (!/^[6-9]\d{9}$/.test(formData.phone_no)) tempErrors.phone_no = "Invalid number! Enter a 10 digit number starting with 6-9.";
    if (!/^2026\s\d{4}$/.test(formData.scholar_no)) tempErrors.scholar_no = "Format: '2026 1234'.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await axios.post('http://localhost:8000/auth/register/student', formData);
      alert("Registration Successful!");
      window.location.href = '/institute/login';
    } catch (err) {
      alert(err.response?.data?.detail || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Institute Enrollment</h1>
        <p style={styles.subtitle}>Create your student account to access the JS Mentor platform.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input 
              style={{...styles.input, borderColor: errors.name ? '#ff4d4d' : '#ddd'}}
              type="text" 
              placeholder="Enter your full name"
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
            {errors.name && <span style={styles.errorText}>{errors.name}</span>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Gmail / Institutional Email</label>
            <input 
              style={{...styles.input, borderColor: errors.email ? '#ff4d4d' : '#ddd'}}
              type="email" 
              placeholder=" name@jsmentor.com /  username@gmail.com "
              onChange={e => setFormData({...formData, email: e.target.value})} 
            />
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}
          </div>

          <div style={styles.row}>
            <div style={{...styles.inputGroup, flex: 1, marginRight: '10px'}}>
              <label style={styles.label}>Password</label>
              <input 
                style={{...styles.input, borderColor: errors.password ? '#ff4d4d' : '#ddd'}}
                type="password" 
                placeholder="••••••"
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
              {errors.password && <span style={styles.errorText}>{errors.password}</span>}
            </div>
            <div style={{...styles.inputGroup, flex: 1}}>
              <label style={styles.label}>Phone Number</label>
              <input 
                style={{...styles.input, borderColor: errors.phone_no ? '#ff4d4d' : '#ddd'}}
                type="text" 
                placeholder="Enter 10-digit mobile number"
                onChange={e => setFormData({...formData, phone_no: e.target.value})} 
              />
              {errors.phone_no && <span style={styles.errorText}>{errors.phone_no}</span>}
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Scholar Number</label>
            <input 
              style={{...styles.input, borderColor: errors.scholar_no ? '#ff4d4d' : '#ddd'}}
              type="text" 
              placeholder="e.g. 2026 0001"
              onChange={e => setFormData({...formData, scholar_no: e.target.value})} 
            />
            {errors.scholar_no && <span style={styles.errorText}>{errors.scholar_no}</span>}
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Processing...' : 'Register as Student'}
          </button>
        </form>

        <div style={styles.footer}>
          Already have an account? <Link to="/institute/login" style={styles.link}>Login here</Link>
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
    padding: '20px'
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    width: '100%',
    maxWidth: '500px'
  },
  title: { fontSize: '24px', fontWeight: '700', color: '#1a202c', marginBottom: '8px', textAlign: 'center' },
  subtitle: { fontSize: '14px', color: '#718096', marginBottom: '30px', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column' },
  inputGroup: { marginBottom: '20px', display: 'flex', flexDirection: 'column' },
  row: { display: 'flex', justifyContent: 'space-between' },
  label: { fontSize: '12px', fontWeight: '600', color: '#4a5568', marginBottom: '6px', textTransform: 'uppercase' },
  input: {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  errorText: { color: '#ff4d4d', fontSize: '11px', marginTop: '4px', fontWeight: '500' },
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