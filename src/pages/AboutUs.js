import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AboutUs = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="flex-grow w-full">
        {/* Hero Section */}
        <section className="bg-slate-900 py-16 md:py-24 text-center px-6">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">About JS Mentor</h1>
          <p className="text-slate-300 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed">
            We are dedicated to bridging the gap between traditional education and industry requirements by providing hands-on, real-world development training.
          </p>
        </section>

        {/* Mission Section */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
            <div className="w-16 h-1 bg-amber-600 mx-auto mb-8"></div>
            <p className="text-slate-600 text-lg leading-relaxed max-w-4xl mx-auto">
              At JS Mentor Training Institute, we believe that quality education should be accessible to everyone. Our mission is to empower aspiring developers with practical, industry-relevant skills that prepare them for real-world job challenges. We don't just teach theory—we teach from experience, by coders, for coders.
            </p>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="max-w-6xl mx-auto px-6 py-12 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose Us?</h2>
            <div className="w-16 h-1 bg-amber-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center hover:shadow-md transition">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                <i className="fas fa-code"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Expert Instructors</h3>
              <p className="text-slate-600 leading-relaxed">
                Learn from experienced coders with real industry expertise, not just tutors reading from books.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center hover:shadow-md transition">
              <div className="w-16 h-16 bg-slate-100 text-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                <i className="fas fa-briefcase"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Job-Ready Skills</h3>
              <p className="text-slate-600 leading-relaxed">
                Our curriculum is designed to make you job-ready with practical, hands-on experience in modern technologies.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center hover:shadow-md transition">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Supportive Community</h3>
              <p className="text-slate-600 leading-relaxed">
                Join a community of like-minded learners. Network, collaborate, and grow together on your coding journey.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
