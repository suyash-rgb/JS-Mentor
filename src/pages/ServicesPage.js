import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { createOrder, verifySignature, getSubscriptionStatus } from "../services/paymentService";
import NavbarComponent from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-hot-toast";
import { Check, Sparkles, Zap, GraduationCap, ArrowRight } from "lucide-react";

const ServicesPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [currentStatus, setCurrentStatus] = useState("inactive");
  const [loadingPlan, setLoadingPlan] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (isSignedIn) {
        try {
          const res = await getSubscriptionStatus();
          setCurrentStatus(res.status || "inactive");
        } catch (err) {
          console.error("Failed to load subscription status:", err);
        }
      }
    };
    fetchStatus();
  }, [isSignedIn]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (planName, amount) => {
    if (!isSignedIn) {
      toast.error("Please sign in to upgrade your plan!");
      return;
    }

    setLoadingPlan(planName);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load Razorpay SDK. Check your internet connection.");
        setLoadingPlan(null);
        return;
      }

      const orderData = await createOrder();
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_THnsT3ZKMq5mdm",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "JS-Mentor LMS",
        description: `${planName} Plan Subscription`,
        order_id: orderData.id,
        handler: async function (response) {
          const verifyToast = toast.loading("Verifying your payment signature...");
          try {
            await verifySignature({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Welcome to Premium! Your payment was verified successfully.", { id: verifyToast });
            setCurrentStatus("active");
          } catch (verifyErr) {
            toast.error("Payment verification failed. Please contact support.", { id: verifyToast });
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        theme: {
          color: "#f05204",
        },
      };

      const razorpayObj = new window.Razorpay(options);
      razorpayObj.open();
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while launching Razorpay Checkout.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      name: "Basic",
      price: "₹0",
      period: "forever",
      description: "Get started with the fundamentals of JavaScript.",
      icon: <GraduationCap className="w-8 h-8 text-sky-500" />,
      features: [
        "Access to JS Fundamentals & Core (Paths 1-2)",
        "Interactive online JS compiler sandbox",
        "24/7 basic AI chatbot queries",
        "Community forum discussions",
      ],
      ctaText: "Get Started",
      isPremium: false,
      available: true,
    },
    {
      name: "Advance",
      price: "₹499",
      period: "month",
      description: "Dive deeper with specialized curriculum and smart AI assistants.",
      icon: <Zap className="w-8 h-8 text-amber-500" />,
      features: [
        "Access to Intermediate JS paths (Paths 3-4)",
        "AI runtime error explanations inside editor",
        "Standard chatbot with code reference links",
        "Peer-to-peer coding sessions (limited)",
        "Practice progress scorecards",
      ],
      ctaText: "Upgrade to Advance",
      isPremium: true,
      available: false,
    },
    {
      name: "Premium",
      price: "₹999",
      period: "month",
      description: "Complete JavaScript mastery with live doubt session scheduling.",
      icon: <Sparkles className="w-8 h-8 text-orange-500" />,
      features: [
        "Full access to all JS curriculum paths (Paths 1-6)",
        "Real-time Automated Doubt Scheduling",
        "1-on-1 WebRTC video sessions with expert trainers",
        "AI code reviewer & grading feedback",
        "ML-powered progress and cohort risk metrics",
      ],
      ctaText: "Unlock Premium",
      isPremium: true,
      popular: true,
      available: true,
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans antialiased">
      <NavbarComponent />
      
      {/* Hero Section */}
      <div className="bg-white py-20 border-b border-slate-100 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <span className="bg-orange-50 text-orange-600 border border-orange-100 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-4">
            Subscription Plans
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Choose Your Path to JS Mastery
          </h1>
          <p className="text-slate-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Unlock interactive coding sandboxes, dynamic learning paths, context-aware AI explanations, 
            and real-time 1-on-1 mentorship sessions.
          </p>
        </div>
      </div>

      {/* Plans Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          {plans.map((plan, idx) => {
            const isCurrent = plan.name === "Basic" ? currentStatus !== "active" : currentStatus === "active" && plan.name === "Premium";
            
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
                  {isCurrent ? (
                    <button className="w-full py-3.5 rounded-xl font-bold text-sm bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed" disabled>
                      Your Current Plan
                    </button>
                  ) : plan.name === "Basic" ? (
                    <button 
                      className="w-full py-3.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                      onClick={() => window.location.href = "/learning-paths"}
                    >
                      {plan.ctaText} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  ) : !plan.available ? (
                    <button className="w-full py-3.5 rounded-xl font-bold text-sm bg-slate-50 text-slate-400 border border-slate-200 border-dashed cursor-not-allowed" disabled>
                      Coming Soon
                    </button>
                  ) : (
                    <button
                      className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                      onClick={() => handleCheckout(plan.name, plan.price)}
                      disabled={loadingPlan !== null}
                    >
                      {loadingPlan === plan.name ? "Launching Razorpay..." : plan.ctaText}
                    </button>
                  )}

                  {/* Dev Bypass option */}
                  {plan.isPremium && plan.available && !isCurrent && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && (
                    <button
                      className="w-full py-3 rounded-xl font-bold text-sm bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors mt-3"
                      onClick={async () => {
                        const verifyToast = toast.loading("Bypassing payment in dev mode...");
                        try {
                          await verifySignature({
                            razorpay_payment_id: "pay_bypass_dev",
                            razorpay_order_id: "order_bypass_dev",
                            razorpay_signature: "sig_bypass_dev",
                          });
                          toast.success("Dev Bypass Successful! Welcome to Premium.", { id: verifyToast });
                          setCurrentStatus("active");
                        } catch (err) {
                          toast.error("Dev Bypass Failed.", { id: verifyToast });
                        }
                      }}
                    >
                      Bypass Payment (Dev)
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
              <h5 className="font-bold text-slate-800 text-base mb-2">How does 1-on-1 mentorship scheduling work?</h5>
              <p className="text-slate-500 text-sm leading-relaxed">
                Under the Premium tier, when you register a doubt, our background Saturation Scheduling engine automatically blocks a slot with a trainer based on priority (FIFO) during active shifts (10:00 AM - 4:00 PM).
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
    </div>
  );
};

export default ServicesPage;
