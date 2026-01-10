import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Signup.css";

function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordMatch, setPasswordMatch] = useState(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Check if passwords match
    if (name === "password" || name === "confirmPassword") {
      const pass =
        name === "password" ? value : formData.password;
      const confirmPass =
        name === "confirmPassword" ? value : formData.confirmPassword;
      setPasswordMatch(pass === confirmPass);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!passwordMatch) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Signup Data:", formData);
    alert("Signup successful for: " + formData.email);
    // Add your signup logic here
  };

  return (
    <>
      <div className="signup-container">
        <Navbar />

        {/* Signup Section */}
        <div className="signup-wrapper">
          <div className="signup-image">
            <div className="image-content">
              <h2>Join Our Community</h2>
              <p>Start your journey to becoming a job-ready developer</p>
              <ul className="benefits-list">
                <li>
                  <i className="fas fa-check"></i> Learn from experienced coders
                </li>
                <li>
                  <i className="fas fa-check"></i> Interactive learning experience
                </li>
                <li>
                  <i className="fas fa-check"></i> Real-world projects
                </li>
                <li>
                  <i className="fas fa-check"></i> Industry-ready skills
                </li>
              </ul>
            </div>
          </div>

          <div className="signup-card">
            <div className="signup-header">
              <h1>Create Your Account</h1>
              <p>Join thousands of learners on their coding journey</p>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

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
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className={!passwordMatch ? "error" : ""}
                />
                {!passwordMatch && (
                  <span className="error-message">Passwords do not match</span>
                )}
              </div>

              <div className="form-options">
                <label className="terms">
                  <input type="checkbox" required />
                  I agree to the{" "}
                  <a href="#!">Terms & Conditions</a>
                </label>
              </div>

              <button
                type="submit"
                className="signup-button"
                disabled={!passwordMatch}
              >
                Create Account
              </button>
            </form>

            <div className="signup-divider">
              <span>or</span>
            </div>

            <div className="social-signup">
              <button className="social-button google">
                <i className="fab fa-google"></i> Google
              </button>
              <button className="social-button github">
                <i className="fab fa-github"></i> GitHub
              </button>
            </div>

            <div className="signup-footer">
              <p>
                Already have an account?{" "}
                <a href="/login" className="login-link">
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

export default Signup;
