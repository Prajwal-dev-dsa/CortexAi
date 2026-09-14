import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { Server, Coffee, Cpu, Activity, Zap } from "lucide-react";

export default function ServerWakeupAlert({ isInitializing }) {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  // Framer Motion variants for orchestrated animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.5,
      },
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.4 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <AnimatePresence>
      {isInitializing && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          className={`fixed inset-0 z-100 flex items-center justify-center overflow-hidden backdrop-blur-md ${
            isDarkMode ? "bg-[#0B0514]/90" : "bg-purple-50/80"
          }`}
        >
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px] ${
                isDarkMode ? "bg-purple-600/20" : "bg-purple-400/20"
              }`}
            />
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] ${
                isDarkMode ? "bg-blue-600/20" : "bg-purple-300/30"
              }`}
            />
          </div>

          {/* Main Content Card */}
          <motion.div
            variants={itemVariants}
            className={`relative w-[90%] max-w-lg p-10 rounded-3xl border shadow-2xl flex flex-col items-center text-center ${
              isDarkMode
                ? "bg-[#1A0B2E]/80 border-purple-500/30 shadow-[0_0_50px_-12px_rgba(147,51,234,0.4)]"
                : "bg-white/90 border-purple-200 shadow-[0_20px_50px_-12px_rgba(147,51,234,0.15)]"
            }`}
          >
            {/* Animated Icon Cluster */}
            <div className="relative mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className={`absolute -inset-4 rounded-full border-2 border-dashed ${
                  isDarkMode ? "border-purple-500/30" : "border-purple-400/40"
                }`}
              />
              <div
                className={`relative p-6 rounded-2xl ${
                  isDarkMode
                    ? "bg-linear-to-br from-purple-900/50 to-blue-900/50 text-purple-300"
                    : "bg-linear-to-br from-purple-100 to-purple-200 text-purple-700"
                }`}
              >
                <Cpu size={48} className="animate-pulse" />
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1.5 text-white shadow-lg"
                >
                  <Zap size={16} />
                </motion.div>
              </div>
            </div>

            {/* Typography */}
            <motion.div variants={itemVariants} className="space-y-3 mb-8">
              <h1 className="font-['Orbitron',sans-serif] text-3xl md:text-4xl font-bold tracking-wider">
                <span className="bg-clip-text text-transparent bg-linear-to-r from-purple-500 to-blue-500">
                  CortexAI
                </span>{" "}
                <span className={isDarkMode ? "text-white" : "text-gray-900"}>
                  Engine
                </span>
              </h1>
              <div className="flex items-center justify-center gap-2">
                <Activity
                  size={18}
                  className={isDarkMode ? "text-purple-400" : "text-purple-600"}
                />
                <h3
                  className={`font-semibold tracking-wide ${isDarkMode ? "text-purple-200" : "text-purple-800"}`}
                >
                  Waking up distributed servers...
                </h3>
              </div>
              <p
                className={`text-sm md:text-base leading-relaxed max-w-sm mx-auto font-sans ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Our free-tier microservices take about 1-2 minutes to boot from
                a cold start. Grab a quick{" "}
                <Coffee size={16} className="inline mb-1 mx-0.5" /> while we
                establish secure connections.
              </p>
            </motion.div>

            {/* Loading Progress Indicator */}
            <motion.div
              variants={itemVariants}
              className="w-full max-w-xs space-y-2"
            >
              <div
                className={`flex justify-between text-xs font-medium font-['Orbitron',sans-serif] ${isDarkMode ? "text-purple-300" : "text-purple-700"}`}
              >
                <span>INITIALIZING</span>
                <span className="animate-pulse">PLEASE WAIT</span>
              </div>
              <div
                className={`h-2 w-full rounded-full overflow-hidden ${isDarkMode ? "bg-gray-800" : "bg-purple-100"}`}
              >
                <motion.div
                  className="h-full bg-linear-to-r from-purple-500 to-blue-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 60, ease: "easeOut" }} // Roughly matches your cold-start time
                />
              </div>
              <div className="flex justify-center pt-4">
                <Server
                  size={20}
                  className={`animate-bounce ${isDarkMode ? "text-purple-500" : "text-purple-400"}`}
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
