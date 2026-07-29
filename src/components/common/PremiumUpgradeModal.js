import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { X, Check, Sparkles, ShieldCheck, Trophy } from "lucide-react";
import { createOrder, verifySignature } from "../../services/paymentService";
import { toast } from "react-hot-toast";

const PremiumUpgradeModal = ({ isOpen, onClose, plan, user, onPaymentSuccess }) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !plan) return null;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load Razorpay SDK. Check your network.");
        setLoading(false);
        return;
      }

      const token = await getToken();
      // Pass plan.id (e.g. '1_month', '1_year', 'forever') to backend
      const orderData = await createOrder(plan.id, token);
      
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_THnsT3ZKMq5mdm",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "JS-Mentor Premium",
        description: `${plan.name} Access`,
        order_id: orderData.id,
        handler: async function (response) {
          const verifyToast = toast.loading("Verifying your transaction...");
          try {
            await verifySignature({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }, plan.id, token);
            
            toast.success("Welcome to JS-Mentor Premium!", { id: verifyToast });
            setSuccess(true);
            if (onPaymentSuccess) onPaymentSuccess();
          } catch (verifyErr) {
            toast.error("Cryptographic signature verification failed.", { id: verifyToast });
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
      toast.error("An error occurred while launching Checkout.");
    } finally {
      setLoading(false);
    }
  };

  const handleDevBypass = async () => {
    const token = await getToken();
    const verifyToast = toast.loading("Bypassing payment in dev mode...");
    try {
      await verifySignature({
        razorpay_payment_id: "pay_bypass_dev",
        razorpay_order_id: "order_bypass_dev",
        razorpay_signature: "sig_bypass_dev",
      }, plan.id, token);
      
      toast.success("Dev Bypass Successful! Premium Activated.", { id: verifyToast });
      setSuccess(true);
      if (onPaymentSuccess) onPaymentSuccess();
    } catch (err) {
      toast.error("Dev Bypass Failed.", { id: verifyToast });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible">
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors z-10 border-0 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          /* Celebration View */
          <div className="w-full py-16 px-8 flex flex-col items-center text-center bg-gradient-to-br from-orange-50 to-amber-50">
            <div className="w-20 h-20 bg-orange-500 text-white rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20 animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              🎉 You are officially Premium!
            </h2>
            <p className="text-slate-600 text-lg max-w-md mb-8 leading-relaxed">
              Your access has been successfully activated. Enjoy interactive sandboxes, 1-on-1 mentorship, and smart AI assistance!
            </p>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer border-0"
            >
              Start Learning Now
            </button>
          </div>
        ) : (
          <>
            {/* Left Column: Feature Perks */}
            <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-8 md:p-12 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-6 h-6 text-orange-500" />
                  <span className="text-orange-500 font-extrabold uppercase tracking-wider text-xs">JS-Mentor Premium</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-6 tracking-tight">
                  Unlock the full power of JavaScript Mastery.
                </h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="p-1.5 bg-slate-800 rounded-lg mt-0.5">
                      <Check className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">Full Curriculum Access</h4>
                      <p className="text-slate-400 text-xs mt-1">Access all 6 JavaScript learning paths, from basics to async/advanced.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-1.5 bg-slate-800 rounded-lg mt-0.5">
                      <Check className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">1-on-1 WebRTC Mentorship</h4>
                      <p className="text-slate-400 text-xs mt-1">Schedule live video sessions with professional mentors for doubt resolution.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-1.5 bg-slate-800 rounded-lg mt-0.5">
                      <Check className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">AI-Powered Code Review</h4>
                      <p className="text-slate-400 text-xs mt-1">Receive automated line-by-line feedback and execution efficiency insights.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-1.5 bg-slate-800 rounded-lg mt-0.5">
                      <Check className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">Interactive Code Sandbox</h4>
                      <p className="text-slate-400 text-xs mt-1">Write, compile, and run JS exercises in real-time without setup.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-800 text-slate-500 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Secure payment gateway powered by Razorpay.</span>
              </div>
            </div>

            {/* Right Column: Checkout Summary */}
            <div className="w-full md:w-[380px] p-8 md:p-12 flex flex-col justify-between bg-white">
              <div>
                <h4 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">You Selected</h4>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-6">{plan.name}</h3>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-500 text-sm">Platform Access</span>
                    <span className="font-bold text-slate-800 text-sm">{plan.period}</span>
                  </div>
                  <div className="border-t border-slate-100 my-4"></div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-800 font-extrabold text-lg">Total Amount</span>
                    <div className="text-right">
                      <span className="text-3xl font-black text-slate-950">{plan.price}</span>
                      <p className="text-slate-400 text-[10px] mt-1">Includes all applicable platform taxes</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50"
                >
                  {loading ? "Launching Gateway..." : `Proceed to Pay ${plan.price}`}
                </button>

                {/* Dev Mode Bypass */}
                {(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && (
                  <button
                    onClick={handleDevBypass}
                    className="w-full py-3 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl transition-colors text-xs cursor-pointer"
                  >
                    Bypass Payment (Dev Mode)
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PremiumUpgradeModal;
