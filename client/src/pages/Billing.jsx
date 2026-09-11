import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Zap,
  Star,
  Loader2,
  Link as LinkIcon,
  CalendarDays,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../features/createOrder";
import { verifyPayment } from "../features/verifyPayment";
import { getCurrentUser } from "../features/getCurrentUser";
import { setUserData } from "../redux/slices/userSlice";
import { loadRazorpay } from "../../utils/loadRazorpay";

const PRICING_PLANS = [
  {
    id: "free",
    name: "Free",
    price: "0",
    credits: 100,
    features: ["Simple Chats", "Realtime Research", "Community Support"],
    buttonText: "Get Started",
    popular: false,
  },
  {
    id: "go",
    name: "Go",
    price: "499",
    credits: 500,
    features: ["Everything in Free", "PDF Generation", "PPT Generation"],
    buttonText: "Upgrade to Go",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "999",
    credits: 1500,
    features: ["Everything in Go", "Image Generation", "Coding Help"],
    buttonText: "Upgrade to Pro",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "1999",
    credits: 5000,
    features: ["Everything in Pro", "Highest Priority", "Dedicated Support"],
    buttonText: "Upgrade to Enterprise",
    popular: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function Billing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const [processingPlan, setProcessingPlan] = useState(null);

  const handlePayment = async (planId) => {
    if (planId === "free") {
      navigate("/");
      return;
    }

    setProcessingPlan(planId);

    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert("Razorpay SDK failed to load. Are you online?");
        setProcessingPlan(null);
        return;
      }

      const orderData = await createOrder(planId);
      if (!orderData || !orderData.order) {
        alert("Failed to create order");
        setProcessingPlan(null);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "CortexAI Engine",
        description: `Upgrade to ${planId.toUpperCase()} Plan`,
        order_id: orderData.order.id,
        prefill: {
          name: userData?.name || "User",
          email: userData?.email || "",
        },
        theme: {
          color: "#A855F7",
        },
        handler: async function (response) {
          const verifyData = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyData) {
            const updatedUser = await getCurrentUser();
            if (updatedUser) dispatch(setUserData(updatedUser));
            navigate("/");
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      paymentObject.on("payment.failed", function (response) {
        alert("Payment failed! " + response.error.description);
      });
    } catch (error) {
      console.error(error);
      alert("An error occurred during checkout.");
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#070210] font-['Orbitron',sans-serif] text-white flex flex-col items-center py-10 px-6 relative overflow-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
        
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(147, 51, 234, 0.2);
            border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
            background: rgba(147, 51, 234, 0.5);
        }
      `,
        }}
      />

      <div className="absolute top-0 right-[20%] w-150 h-150 bg-purple-600/10 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-[10%] w-125 h-125 bg-fuchsia-600/10 blur-[150px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-2xl mb-8 relative z-10"
      >
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
          Simple, <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-fuchsia-500 drop-shadow-lg">
            transparent pricing
          </span>
        </h1>
        <p className="text-purple-200/60 text-sm md:text-base leading-relaxed tracking-wider">
          Choose the perfect path to unlock AI-powered creation. Build anytime,
          explore always.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full relative z-10"
      >
        {PRICING_PLANS.map((plan) => (
          <motion.div
            key={plan.id}
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`relative flex flex-col bg-[#0A0514]/80 backdrop-blur-xl rounded-3xl p-8 border transition-colors duration-300 ${
              plan.popular
                ? "border-purple-500/80 shadow-[0_0_50px_-15px_rgba(168,85,247,0.4)]"
                : "border-purple-500/10 hover:border-purple-500/30"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 right-6 bg-linear-to-r from-purple-600 to-fuchsia-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-[0_0_15px_rgba(168,85,247,0.5)] uppercase tracking-widest z-20">
                <Star size={12} className="fill-white" />
                Most Popular
              </div>
            )}

            <h3 className="text-2xl font-bold mb-4 capitalize tracking-wide">
              {plan.name}
            </h3>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-black tracking-tighter">
                ₹{plan.price}
              </span>
              <span className="text-xs text-purple-300/40 font-medium tracking-wide">
                /one-time
              </span>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 text-purple-300/70 text-xs font-medium bg-purple-900/20 px-3 py-1.5 rounded-lg border border-purple-500/20">
                <LinkIcon size={12} className="text-purple-400" />
                Credits: {plan.credits}
              </div>
            </div>

            <ul className="flex-1 space-y-4 mb-4">
              {plan.features.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-purple-100/70 font-medium tracking-wide"
                >
                  <Check
                    size={16}
                    className="text-purple-500 shrink-0 mt-0.5"
                  />
                  <span className="leading-snug">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePayment(plan.id)}
              disabled={processingPlan === plan.id}
              className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden relative ${
                plan.popular
                  ? "bg-linear-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/25 border-none"
                  : "bg-transparent hover:bg-purple-900/30 text-white border border-purple-500/30 hover:border-purple-500/60"
              }`}
            >
              {processingPlan === plan.id ? (
                <Loader2 size={18} className="animate-spin" />
              ) : plan.popular ? (
                <Zap size={16} className="fill-white" />
              ) : null}
              {processingPlan === plan.id ? "Processing..." : plan.buttonText}
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
