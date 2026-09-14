import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { Server, Coffee, Loader2 } from "lucide-react";

export default function ServerWakeupAlert({ isInitializing }) {
  const [showAlert, setShowAlert] = useState(false);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  useEffect(() => {
    let timer;
    if (isInitializing) {
      timer = setTimeout(() => setShowAlert(true), 4000);
    } else {
      setShowAlert(false);
    }
    return () => clearTimeout(timer);
  }, [isInitializing]);

  return (
    <AnimatePresence>
      {showAlert && isInitializing && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          className="fixed top-6 left-1/2 z-50 w-[90%] max-w-sm font-['Orbitron',sans-serif]"
        >
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${
              isDarkMode
                ? "bg-[#1A0B2E]/95 border-purple-500/40 shadow-[0_0_30px_-5px_rgba(147,51,234,0.3)]"
                : "bg-white/95 border-purple-200 shadow-[0_10px_40px_-10px_rgba(147,51,234,0.2)]"
            }`}
          >
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                isDarkMode
                  ? "bg-purple-900/40 text-purple-300"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              <Server size={24} className="animate-pulse" />
            </div>

            <div className="flex flex-col flex-1">
              <h3
                className={`text-sm font-bold tracking-wide flex items-center gap-2 ${
                  isDarkMode ? "text-white" : "text-purple-950"
                }`}
              >
                Waking up servers <Loader2 size={14} className="animate-spin" />
              </h3>
              <p
                className={`text-xs mt-1 leading-relaxed font-sans ${
                  isDarkMode ? "text-purple-200/70" : "text-purple-600/80"
                }`}
              >
                CortexAI is hosted on a free tier and takes about 30-50 seconds
                to spin up after inactivity. Grab a quick{" "}
                <Coffee size={12} className="inline mb-0.5 mx-0.5" /> while we
                connect!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
