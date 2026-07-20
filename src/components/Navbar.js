import React, { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";
import logo from "../Images/jsmentorlogof.png";
import { updateAvailability } from "../services/trainerService";

const NavbarComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  const { isSignedIn } = useUser();
  
  // State to manage mobile toggle layout
  const [isOpen, setIsOpen] = useState(false);

  const isTrainer = localStorage.getItem('token') !== null && localStorage.getItem('role') === 'trainer';

  const handleTrainerLogout = async () => {
    try {
      await updateAvailability(false);
    } catch (err) {
      console.error("Failed to set availability to offline on logout:", err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 font-sans antialiased shadow-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Changed h-20 to h-24 to give the larger logo breathing room */}
        <div className="flex items-center justify-between h-24">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center no-underline">
              <img
                src={logo}
                alt="JS Mentor Logo"
                /* Changed h-10 to h-11 on mobile and h-16 on desktop for a bigger, professional look */
                className="h-11 lg:h-16 w-auto object-contain transition-opacity hover:opacity-90"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {pathname !== "/" && (
              <Link to="/" className="text-slate-600 hover:text-amber-600 font-semibold text-sm transition-colors duration-150 no-underline">
                Home
              </Link>
            )}

            {pathname !== "/learning-paths" && (
              <Link to="/learning-paths" className="text-slate-600 hover:text-amber-600 font-semibold text-sm transition-colors duration-150 no-underline">
                Learning Paths
              </Link>
            )}

            {isSignedIn && pathname !== "/dashboard" && (
              <Link to="/dashboard" className="text-slate-600 hover:text-amber-600 font-semibold text-sm transition-colors duration-150 no-underline">
                Dashboard
              </Link>
            )}

            {isTrainer && pathname !== "/trainer/dashboard" && (
              <Link to="/trainer/dashboard" className="text-slate-600 hover:text-amber-600 font-semibold text-sm transition-colors duration-150 no-underline">
                Dashboard
              </Link>
            )}

            {pathname !== "/jscompiler" && (
              <Link to="/jscompiler" className="text-slate-600 hover:text-amber-600 font-semibold text-sm transition-colors duration-150 no-underline">
                JS Compiler
              </Link>
            )}

            {pathname !== "/Ai" && (
              <Link to="/Ai" className="text-slate-600 hover:text-amber-600 font-semibold text-sm transition-colors duration-150 no-underline">
                AI
              </Link>
            )}

            {/* Desktop Dynamic Action Button State */}
            <div className="flex items-center space-x-3 pl-2">
              {isTrainer ? (
                <button 
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shadow-sm cursor-pointer border-0"
                  onClick={handleTrainerLogout}
                >
                  Sign Out
                </button>
              ) : isSignedIn ? (
                <UserButton signOutRedirectUrl="/" />
              ) : (
                <>
                  <Link
                    to="/sign-in"
                    className="border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-5 py-2.5 text-sm transition-all no-underline rounded-lg shadow-sm"
                  >
                    Login
                  </Link>
                  <Link
                    to="/sign-up"
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 text-sm transition-all no-underline rounded-lg shadow-sm"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Toggle Button Icon */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-slate-600 hover:text-black focus:outline-none p-2 rounded-md border-0 bg-transparent"
              aria-label="Toggle Menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Panel Transition Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-6 pt-2 pb-6 space-y-3 shadow-inner">
          {pathname !== "/" && (
            <Link to="/" onClick={() => setIsOpen(false)} className="text-slate-600 hover:text-amber-600 font-semibold text-base no-underline block py-2">
              Home
            </Link>
          )}

          {pathname !== "/learning-paths" && (
            <Link to="/learning-paths" onClick={() => setIsOpen(false)} className="text-slate-600 hover:text-amber-600 font-semibold text-base no-underline block py-2">
              Learning Paths
            </Link>
          )}

          {isSignedIn && pathname !== "/dashboard" && (
            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-slate-600 hover:text-amber-600 font-semibold text-base no-underline block py-2">
              Dashboard
            </Link>
          )}

          {isTrainer && pathname !== "/trainer/dashboard" && (
            <Link to="/trainer/dashboard" onClick={() => setIsOpen(false)} className="text-slate-600 hover:text-amber-600 font-semibold text-base no-underline block py-2">
              Dashboard
            </Link>
          )}

          {pathname !== "/jscompiler" && (
            <Link to="/jscompiler" onClick={() => setIsOpen(false)} className="text-slate-600 hover:text-amber-600 font-semibold text-base no-underline block py-2">
              JS Compiler
            </Link>
          )}

          {pathname !== "/Ai" && (
            <Link to="/Ai" onClick={() => setIsOpen(false)} className="text-slate-600 hover:text-amber-600 font-semibold text-base no-underline block py-2">
              AI
            </Link>
          )}

          {/* Mobile Auth Button UI Blocks */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            {isTrainer ? (
              <button 
                className="w-full text-center bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg text-sm transition-colors border-0"
                onClick={() => { handleTrainerLogout(); setIsOpen(false); }}
              >
                Sign Out
              </button>
            ) : isSignedIn ? (
              <div className="py-2">
                <UserButton signOutRedirectUrl="/" />
              </div>
            ) : (
              <>
                <Link
                  to="/sign-in"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-3 text-sm no-underline rounded-lg block"
                >
                  Login
                </Link>
                <Link
                  to="/sign-up"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 text-sm no-underline rounded-lg block"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavbarComponent;