import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 md:py-20 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight">Privacy Policy</h1>
          <p className="text-slate-500 text-sm mb-10">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-8 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us when you create an account, participate in any interactive features of our services, fill out a form, request customer support, or otherwise communicate with us. The types of information we may collect include your name, email address, password, and any other information you choose to provide.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">2. How We Use Your Information</h2>
              <p>We use the information we collect to provide, maintain, and improve our services, including to:</p>
              <ul className="list-disc pl-5 mt-3 space-y-2">
                <li>Create and manage your account.</li>
                <li>Process your learning progress and compiler data.</li>
                <li>Send you technical notices, updates, security alerts, and support messages.</li>
                <li>Respond to your comments, questions, and customer service requests.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">3. Data Security</h2>
              <p>
                We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration, and destruction. However, no digital platform can guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">4. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@jsmentor.com" className="text-amber-600 hover:underline">support@jsmentor.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
