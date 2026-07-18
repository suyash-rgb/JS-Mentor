import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CookiePolicy = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 md:py-20 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight">Cookie Policy</h1>
          <p className="text-slate-500 text-sm mb-10">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-8 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">1. What Are Cookies</h2>
              <p>
                As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">2. How We Use Cookies</h2>
              <p>We use cookies for a variety of reasons detailed below:</p>
              <ul className="list-disc pl-5 mt-3 space-y-2">
                <li><strong>Account Management:</strong> If you create an account with us, we will use cookies for the management of the signup process and general administration.</li>
                <li><strong>Login Status:</strong> We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page.</li>
                <li><strong>Site Preferences:</strong> In order to provide you with a great experience (like saving your theme preference in the compiler), we provide the functionality to set your preferences for how this site runs when you use it.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">3. Disabling Cookies</h2>
              <p>
                You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit, specifically breaking authentication and saving of code states.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
