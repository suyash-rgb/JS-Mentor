import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsOfService = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 md:py-20 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight">Terms of Service</h1>
          <p className="text-slate-500 text-sm mb-10">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-8 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the JS-Mentor platform, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, you may not access the website or use any of our services.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">2. User Accounts</h2>
              <p>When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">3. Acceptable Use</h2>
              <p>
                You agree not to use the JS-Mentor compiler or AI features for any unlawful purpose or in any way that could damage, disable, overburden, or impair the service. You may not attempt to gain unauthorized access to any part of the service, other accounts, or computer systems or networks connected to the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">4. Intellectual Property</h2>
              <p>
                The service and its original content, features, and functionality are and will remain the exclusive property of JS-Mentor and its licensors. Our educational materials may not be reproduced, duplicated, copied, sold, resold, or exploited for any commercial purpose without express written consent.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
