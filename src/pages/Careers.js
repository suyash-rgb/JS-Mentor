import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Careers = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    experience: '',
    linkedin: '',
    motivation: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: '', email: '', experience: '', linkedin: '', motivation: '' });
    }, 800);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="flex-grow w-full">
        {/* Hero Section */}
        <section className="bg-slate-900 py-16 md:py-24 text-center px-6">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Become a Trainer</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg md:text-xl">
            Join the JS-Mentor team and help shape the next generation of full-stack developers. Share your real-world expertise and empower students globally.
          </p>
        </section>

        {/* Application Form Section */}
        <section className="max-w-3xl mx-auto px-6 py-12 md:py-20 -mt-10 md:-mt-16 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-12">
            
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                  ✓
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Received!</h2>
                <p className="text-slate-600 mb-8">
                  Thank you for applying to be a trainer at JS-Mentor. Our team will review your profile and reach out via email within 3-5 business days.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-lg transition"
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Trainer Application Form</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
                      <input 
                        type="text" name="name" required
                        value={formData.name} onChange={handleChange}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email Address *</label>
                      <input 
                        type="email" name="email" required
                        value={formData.email} onChange={handleChange}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Years of Experience *</label>
                      <select 
                        name="experience" required
                        value={formData.experience} onChange={handleChange}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition bg-white"
                      >
                        <option value="" disabled>Select experience level</option>
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5-10">5-10 years</option>
                        <option value="10+">10+ years</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">LinkedIn Profile *</label>
                      <input 
                        type="url" name="linkedin" required
                        value={formData.linkedin} onChange={handleChange}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Why do you want to teach at JS-Mentor? *</label>
                    <textarea 
                      name="motivation" required rows="5"
                      value={formData.motivation} onChange={handleChange}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition resize-y"
                      placeholder="Tell us about your passion for teaching and development..."
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-lg transition shadow-sm text-lg"
                  >
                    Submit Application
                  </button>
                </form>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Careers;
