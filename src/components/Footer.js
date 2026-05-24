import React from "react";
import { Link } from "react-router-dom";
import logo from "../Images/jsmentorlogof.png";
import address from "../Images/address_icon.png";
import email from "../Images/email.png";

const Footer = () => {
  const quickLinks = [
    { name: "Learning Paths", path: "/learningpaths" },
    { name: "JS Compiler", path: "/jscompiler" },
    { name: "AI Assistant", path: "/aiassistant" },
    { name: "Our Mission", path: "/#about-section" },
  ];

  return (
    <footer className="bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-6">
            <img src={logo} alt="JS Mentor Logo" className="w-44 h-auto" />
            <p className="text-gray-600 leading-relaxed text-base">
              Accelerate your coding journey. Learn from actual developers, not
              just tutors.
            </p>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-6">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <img
                  width="24"
                  src={address}
                  alt="Address"
                  className="mt-1 flex-shrink-0"
                />
                <div>
                  <p className="text-gray-900 font-medium text-sm mb-1">
                    Address
                  </p>
                  <p className="text-gray-700 text-base">
                    Bhawarkua Main Rd
                    <br />
                    Indore, MP 452001
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <img
                  width="24"
                  src={email}
                  alt="Email"
                  className="mt-1 flex-shrink-0"
                />
                <div>
                  <p className="text-gray-900 font-medium text-sm mb-1">
                    Email
                  </p>
                  <a
                    href="mailto:support@jsmentor.com"
                    className="text-orange-600 hover:text-orange-700 font-medium text-base block no-underline"
                  >
                    support@jsmentor.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-6">
              Quick Links
            </h4>
            <div className="space-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block text-gray-700 hover:text-orange-600 font-medium text-base py-2 no-underline hover:no-underline"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Company Info */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-6">Company</h4>
            <div className="space-y-3">
              <Link
                to="/about"
                className="block text-gray-700 hover:text-orange-600 font-medium text-base py-2 no-underline hover:no-underline"
              >
                About Us
              </Link>
              <Link
                to="/careers"
                className="block text-gray-700 hover:text-orange-600 font-medium text-base py-2 no-underline hover:no-underline"
              >
                Careers
              </Link>
              <Link
                to="/blog"
                className="block text-gray-700 hover:text-orange-600 font-medium text-base py-2 no-underline hover:no-underline"
              >
                Blog
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-200 mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <p className="text-gray-600 text-sm md:text-base">
            © {new Date().getFullYear()} JS Mentor Training Institute. All
            rights reserved.
          </p>

          <div className="flex flex-wrap gap-6 justify-center md:justify-end text-sm">
            <Link
              to="/privacy"
              className="text-gray-700 hover:text-orange-600 font-medium no-underline hover:no-underline"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-gray-700 hover:text-orange-600 font-medium no-underline hover:no-underline"
            >
              Terms of Service
            </Link>
            <Link
              to="/cookies"
              className="text-gray-700 hover:text-orange-600 font-medium no-underline hover:no-underline"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


