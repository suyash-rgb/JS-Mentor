import React, { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { getSubscriptionStatus } from "../services/paymentService";
import NavbarComponent from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-hot-toast";
import { Check, Sparkles, Zap, GraduationCap, ArrowRight, Shield } from "lucide-react";
import PremiumUpgradeModal from "../components/common/PremiumUpgradeModal";

const PricingPage = () => {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [currentStatus, setCurrentStatus] = useState("inactive");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const onboarding = new URLSearchParams(window.location.search).get("onboarding") === "true";

  useEffect(() => {
    const fetchStatus = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          const res = await getSubscriptionStatus(token);
          setCurrentStatus(res.status || "inactive");
        } catch (err) {
          console.error("Failed to load subscription status:", err);
        }
      }
    };
    fetchStatus();
  }, [isSignedIn, getToken]);

  const handleCheckoutInit = (plan) => {
    if (!isSignedIn) {
      toast.error("Please sign in to choose a pricing plan!");
      // Redirect to sign in page
      window.location.href = `/sign-in?redirect=${window.location.pathname}`;
      return;
    }
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setCurrentStatus("active");
  };

  const plans = [
    {
      id: "1_month",
      name: "1 Month Pass",
      price: "₹499",
      period: "1 month",
      description: "Get full platform access for short-term preparation sprints.",
      icon: <GraduationCap className="w-8 h-8 text-sky-500" />,
      features: [
        "Full access to all JS curriculum paths (Paths 1-6)",
        "Real-time Automated Doubt Scheduling",
        "1-on-1 WebRTC video sessions with expert trainers",
        "AI code reviewer & grading feedback",
        "ML-powered progress and cohort risk metrics",
      ],
      ctaText: "Get 1 Month Pass",
      popular: false,
    },
    {
      id: "1_year",
      name: "1 Year Pass",
      price: "₹2,999",
      period: "1 year",
      description: "Best value for continuous learning and total interview preparation.",
      icon: <Zap className="w-8 h-8 text-amber-500" />,
      features: [
        "Full access to all JS curriculum paths (Paths 1-6)",
        "Real-time Automated Doubt Scheduling",
        "1-on-1 WebRTC video sessions with expert trainers",
        "AI code reviewer & grading feedback",
        "ML-powered progress and cohort risk metrics",
      ],
      ctaText: "Get 1 Year Pass",
      popular: true,
    },
    {
      id: "forever",
      name: "Forever Access",
      price: "₹4,999",
      period: "lifetime",
      description: "One-time payment for perpetual access to JS-Mentor and all future updates.",
      icon: <Sparkles className="w-8 h-8 text-orange-500" />,
      features: [
        "Full access to all JS curriculum paths (Paths 1-6)",
        "Real-time Automated Doubt Scheduling",
        "1-on-1 WebRTC video sessions with expert trainers",
        "AI code reviewer & grading feedback",
        "ML-powered progress and cohort risk metrics",
      ],
      ctaText: "Get Forever Access",
      popular: false,
      bestValue: true,
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans antialiased">
      <NavbarComponent />
      
      {/* Hero Section */}
      <div className="bg-white py-20 border-b border-slate-100 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <span className="bg-orange-50 text-orange-600 border border-orange-100 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-4">
            Subscription Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Choose Your Access Duration
          </h1>
          <p className="text-slate-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Every paid pass unlocks 100% of JS-Mentor platform capabilities. Access interactive compilers, AI-powered reviewing, and expert mentorship.
          </p>
        </div>
      </div>

      {/* Active Premium Banner */}
      {currentStatus === "active" && (
        <div className="max-w-3xl mx-auto px-6 mt-10">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-md flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">You are a Premium Member!</h3>
              <p className="text-white/80 text-sm mt-0.5">Your subscription is currently active. You have full access to all curriculum paths and interactive sandbox tools.</p>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Welcome Interstitial / Banner */}
      {onboarding && (
        <div className="max-w-4xl mx-auto px-6 mt-10">
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-orange-400/20">
            <div className="flex-1">
              <span className="bg-white/20 text-white border border-white/30 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-block mb-3">
                Welcome to JS-Mentor!
              </span>
              <h2 className="text-2xl font-black tracking-tight">Onboarding: Select Your Access Plan</h2>
              <p className="text-white/90 text-sm mt-2 leading-relaxed">
                Choose a pass below to unlock AI reviews, live mentorship, and advanced tracks immediately. Or, you can check out the platform first in free demo mode.
              </p>
            </div>
            <div className="flex-shrink-0">
              <a 
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-xl transition-all shadow-md hover:shadow-lg no-underline text-sm cursor-pointer"
              >
                Continue with Free Demo Access
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Plans Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          {plans.map((plan, idx) => {
            return (
              <div 
                key={idx} 
                className={`flex flex-col bg-white border rounded-3xl p-8 relative transition-all duration-300 hover:shadow-lg ${
                  plan.popular ? "border-orange-500 ring-2 ring-orange-500/10 shadow-md" : "border-slate-200"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-extrabold uppercase px-4 py-1 rounded-full shadow-sm tracking-wider">
                    Most Popular
                  </span>
                )}
                {plan.bestValue && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-extrabold uppercase px-4 py-1 rounded-full shadow-sm tracking-wider">
                    Best Value
                  </span>
                )}
                
                <div className="border-b border-slate-100 pb-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    {plan.icon}
                    <span className="text-xl font-bold text-slate-800">{plan.name}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="text-slate-400 text-sm">/{plan.period}</span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{plan.description}</p>
                </div>

                {/* Features List */}
                <div className="flex-grow flex flex-col gap-4 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600 text-sm leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="w-full flex flex-col">
                  {currentStatus === "active" ? (
                    <button className="w-full py-3.5 rounded-xl font-bold text-sm bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed" disabled>
                      Plan Active
                    </button>
                  ) : (
                    <button
                      className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2 shadow-sm border-0 cursor-pointer"
                      onClick={() => handleCheckoutInit(plan)}
                    >
                      {plan.ctaText} <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="border-t border-slate-100 bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
              <h5 className="font-bold text-slate-800 text-base mb-2">How does access duration work?</h5>
              <p className="text-slate-500 text-sm leading-relaxed">
                When you buy a monthly or annual pass, your premium access ends precisely 30 days or 365 days from the moment of signature verification. Lifetime passes never expire and include all future features.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
              <h5 className="font-bold text-slate-800 text-base mb-2">Is there any transaction verification latency?</h5>
              <p className="text-slate-500 text-sm leading-relaxed">
                No, our backend utilizes cryptographic validation of Razorpay payment signatures to instantly activate your premium benefits in the database upon successful transaction checkout.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Reusable checkout modal */}
      <PremiumUpgradeModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        plan={selectedPlan} 
        user={user}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default PricingPage;
