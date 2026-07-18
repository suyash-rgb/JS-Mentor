import React from "react";
import { Link } from "react-router-dom";
import logo from "../Images/jsmentorlogof.png";

const Footer = () => {
  const quickLinks = [
    { name: "Learning Paths", path: "/learning-paths" },
    { name: "JS Compiler", path: "/jscompiler" },
    { name: "AI Assistant", path: "/Ai" },
  ];

  const companyLinks = [
    { name: "About Us", path: "/about" },
    { name: "Careers", path: "/careers" },
    { name: "Blog", path: "/blog" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Cookie Policy", path: "/cookies" },
  ];

  return (
    <footer className="bg-white text-black border-t border-slate-200 tracking-wide">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        
        {/* Main Grid Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 xl:gap-16 pb-12 border-b border-slate-200">
          
          {/* Brand & Mission Column */}
          <div className="lg:col-span-4 space-y-5 text-left">
            <Link to="/" className="inline-block transition-opacity hover:opacity-90">
              <img src={logo} alt="JS Mentor Logo" className="w-40 h-auto" />
            </Link>
            <p className="text-black text-sm sm:text-base leading-relaxed max-w-sm">
              Accelerate your coding journey. Learn from actual industry developers, engineering real-world solutions.
            </p>
            <div className="pt-2">
              <a 
                href="#about-section" 
                className="text-amber-600 hover:text-amber-700 font-bold text-sm inline-flex items-center gap-1 group transition-colors no-underline"
              >
                Our Mission 
                <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-2 text-left flex flex-col items-start">
            <h4 className="text-black font-black text-base uppercase tracking-wider mb-5">
              Explore
            </h4>
            <div className="flex flex-col space-y-3.5 w-full">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-black opacity-80 hover:opacity-100 hover:text-amber-600 text-sm sm:text-base transition-all duration-200 no-underline block w-full text-left"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Company Links Column */}
          <div className="lg:col-span-2 text-left flex flex-col items-start">
            <h4 className="text-black font-black text-base uppercase tracking-wider mb-5">
              Company
            </h4>
            <div className="flex flex-col space-y-3.5 w-full">
              {companyLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-black opacity-80 hover:opacity-100 hover:text-amber-600 text-sm sm:text-base transition-all duration-200 no-underline block w-full text-left"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact & Newsletter Column */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <div>
              <h4 className="text-black font-black text-base uppercase tracking-wider mb-4">
                Stay Connected
              </h4>
              <p className="text-black text-sm mb-3">
                Subscribe to receive coding tips, updates, and course discounts.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex max-w-md bg-slate-50 rounded-lg p-1 border border-slate-300 focus-within:border-black focus-within:ring-2 focus-within:ring-slate-100 transition-all">
                <input 
                  type="email" 
                  placeholder="Enter email address" 
                  className="bg-transparent text-sm text-black px-3 py-2 w-full focus:outline-none placeholder-slate-400"
                  required
                />
                <button type="submit" className="bg-black hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors shadow-sm">
                  Join
                </button>
              </form>
            </div>

            {/* Direct Contact Detail Items */}
            <div className="space-y-3.5 pt-2 text-sm sm:text-base">
              <div className="flex items-start space-x-3 text-black">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Bhawarkua Main Rd, Indore, MP 452001</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a
                  href="mailto:support@jsmentor.com"
                  className="text-amber-600 hover:text-amber-700 font-bold transition-colors no-underline"
                >
                  support@jsmentor.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 text-center md:text-left">
          <p className="text-slate-600 text-xs sm:text-sm">
            &copy; {new Date().getFullYear()} JS Mentor Training Institute. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-end text-xs sm:text-sm">
            {legalLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-slate-600 hover:text-black transition-colors no-underline font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;