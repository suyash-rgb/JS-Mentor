import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login Data:", formData);
    alert("Login attempt with: " + formData.email);
    // Add your login logic here
  };

  return (
    <>
      <div className="login-container">
        <Navbar />

        {/* Login Section */}
        <div className="login-wrapper">
          <div className="login-card">
            <div className="login-header">
              <h1>Welcome Back</h1>
              <p>Sign in to your account to continue learning</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  Remember me
                </label>
                <a href="#!" className="forgot-password">
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="login-button">
                Sign In
              </button>
            </form>

            <div className="login-divider">
              <span>or</span>
            </div>

            <div className="social-login">
              <button className="social-button google">
                <i className="fab fa-google"></i> Google
              </button>
              <button className="social-button github">
                <i className="fab fa-github"></i> GitHub
              </button>
            </div>

            <div className="login-footer">
              <p>
                Don't have an account?{" "}
                <a href="/signup" className="signup-link">
                  Sign up here
                </a>
              </p>
            </div>
          </div>

          <div className="login-image">
            <div className="image-content">
              <h2>Learn to Code</h2>
              <p>Master JavaScript and become job-ready with JS Mentor</p>
              <ul className="benefits-list">
                <li>
                  <i className="fas fa-check"></i> Expert instructors
                </li>
                <li>
                  <i className="fas fa-check"></i> Interactive projects
                </li>
                <li>
                  <i className="fas fa-check"></i> Job-ready skills
                </li>
                <li>
                  <i className="fas fa-check"></i> Community support
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

export default Login;
