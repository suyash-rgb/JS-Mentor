import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; // Import toast components

export default function InstituteSignUp() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone_no: '', registration_code: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const validate = () => {
    let tempErrors = {};
    if (!/^[a-zA-Z\s]+$/.test(formData.name)) tempErrors.name = "Letters only, please.";

    const allowedDomains = ["gmail", "yahoo", "hotmail", "jsmentor", "outlook", "zoho"];
    const domainPattern = new RegExp(`@(${allowedDomains.join('|')})\\.`);
    if (!domainPattern.test(formData.email)) tempErrors.email = "Use an approved domain.";

    if (formData.password.length < 6) tempErrors.password = "Minimum 6 characters.";
    if (!/^[6-9]\d{9}$/.test(formData.phone_no)) tempErrors.phone_no = "10 digits starting with 6-9.";
    if (!/^(2025|2026)JSMC(00[4-9]|0[1-9][0-9]|[1-9][0-9]{2})CT$/.test(formData.registration_code)) tempErrors.registration_code = "Invalid registration code format.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    setLoading(true);
    const loadToast = toast.loading("Enrolling in institute..."); // Show loading state

    try {
      // Treating all registration from here as trainers
      await axios.post('http://localhost:8000/auth/register/trainer', formData);

      toast.success("Registration Successful!", { id: loadToast }); // Update loading toast to success

      // Delay redirection slightly so they can see the success message
      setTimeout(() => {
        window.location.href = '/institute/login';
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Server error.";
      toast.error(errorMsg, { id: loadToast }); // Update loading toast to error
    } finally {
      setLoading(false);
    }
  };

  // ... (responsiveRow and responsiveInputGroup logic stays the same)

  return (
    <div style={styles.pageWrapper}>
      {/* Important: Place the Toaster here if it's not already in your App.js */}
      <Toaster position="top-center" reverseOrder={false} />

      <div style={{ ...styles.card, width: isMobile ? '90%' : '500px', padding: isMobile ? '25px' : '40px' }}>
        <h1 style={styles.title}>Trainer Registration</h1>
        <p style={styles.subtitle}>Create your trainer account to access the institute dashboard.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              style={{ ...styles.input, borderColor: errors.name ? '#ff4d4d' : '#ddd' }}
              type="text"
              placeholder="Enter your full name"
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <span style={styles.errorText}>{errors.name}</span>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              style={{ ...styles.input, borderColor: errors.email ? '#ff4d4d' : '#ddd' }}
              type="email"
              placeholder="username@gmail.com"
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}
          </div>

          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between'
          }}>
            <div style={{
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              marginRight: !isMobile ? '10px' : '0'
            }}>
              <label style={styles.label}>Password</label>
              <input
                style={{ ...styles.input, borderColor: errors.password ? '#ff4d4d' : '#ddd' }}
                type="password"
                placeholder="••••••"
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
              {errors.password && <span style={styles.errorText}>{errors.password}</span>}
            </div>
            <div style={{
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              flex: 1
            }}>
              <label style={styles.label}>Phone Number</label>
              <input
                style={{ ...styles.input, borderColor: errors.phone_no ? '#ff4d4d' : '#ddd' }}
                type="text"
                placeholder="10-digit mobile"
                onChange={e => setFormData({ ...formData, phone_no: e.target.value })}
              />
              {errors.phone_no && <span style={styles.errorText}>{errors.phone_no}</span>}
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Trainer Registration Code</label>
            <input
              style={{ ...styles.input, borderColor: errors.registration_code ? '#ff4d4d' : '#ddd' }}
              type="text"
              placeholder="e.g. 2025JSMC004CT"
              onChange={e => setFormData({ ...formData, registration_code: e.target.value.trim() })}
            />
            {errors.registration_code && <span style={styles.errorText}>{errors.registration_code}</span>}
          </div>


          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Registering...' : 'Register as Trainer'}
          </button>
        </form>

        <div style={styles.footer}>
          Already have an account? <Link to="/institute/login" style={styles.link}>Login here</Link>
        </div>
      </div>
    </div>
  );
}

// ... (styles stay the same)

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
  errorText: { color: '#ff4d4d', fontSize: '11px', marginTop: '4px', fontWeight: '500' },
  submitBtn: {
    backgroundColor: 'rgb(240, 82, 4)',
    color: '#fff',
    padding: '14px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px'
  },
  footer: { marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#718096' },
  link: { color: '#3182ce', textDecoration: 'none', fontWeight: '600' }
};