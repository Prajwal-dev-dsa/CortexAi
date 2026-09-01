import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Sparkles, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { axiosInstance } from "../../utils/axios";
import { auth, googleProvider } from "../../utils/firebase";
import { signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/slices/userSlice";

export default function Home() {
  const dispatch = useDispatch();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = async (token) => {
    try {
      const res = await axiosInstance.post("/api/auth/login", { token });
      console.log("Server response:", res.data);
      dispatch(setUserData(res.data.user));
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signInWithGoogle = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    try {
      const data = await signInWithPopup(auth, googleProvider);
      console.log("Firebase Auth:", data);
      const token = await data.user.getIdToken();
      await handleLogin(token);
    } catch (error) {
      console.error("Google Auth failed:", error);
      setIsAuthenticating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <>
      {/* Drop-in font import - can be moved to index.css in production */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');`}
      </style>

      <div className="relative min-h-screen w-full bg-linear-to-br from-[#2D1657] via-[#110624] to-[#070210] flex items-center justify-center overflow-hidden font-['Orbitron',sans-serif] text-white">
        {/* Animated Ambient Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/30 blur-[130px]"
          />

          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-[10%] right-[10%] w-[60vw] h-[60vw] rounded-full bg-fuchsia-600/20 blur-[160px]"
          />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-purple-500/15 blur-[120px] rounded-full" />
        </div>

        {/* Premium Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md px-6 sm:px-0"
        >
          <div className="relative overflow-hidden rounded-3xl bg-[#1D0B3B]/60 backdrop-blur-2xl border border-purple-400/30 shadow-[0_0_50px_-12px_rgba(147,51,234,0.4)] p-8 sm:p-10">
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-purple-300/40 to-transparent" />

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center text-center"
            >
              {/* AI Badge - Using Medium 500 equivalent */}
              <motion.div
                variants={itemVariants}
                className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-400/40 bg-purple-500/20 shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)]"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                <span className="text-[10px] font-medium text-purple-100 tracking-widest uppercase">
                  CortexAI Engine
                </span>
              </motion.div>

              {/* Logo / Branding */}
              <motion.div variants={itemVariants} className="mb-2 relative">
                <div className="absolute inset-0 bg-purple-400 blur-2xl opacity-30 rounded-full" />
                <BrainCircuit
                  className="w-14 h-14 text-purple-300 drop-shadow-[0_0_15px_rgba(216,180,254,0.6)]"
                  strokeWidth={1.5}
                />
              </motion.div>

              {/* Typography - Using SemiBold 600 and Regular 400 equivalents */}
              <motion.div variants={itemVariants} className="mb-8 mt-2">
                <h1 className="text-3xl font-semibold tracking-wide mb-3 text-white drop-shadow-md">
                  Welcome back
                </h1>
                <p className="text-xs text-purple-200/80 font-normal max-w-65 mx-auto leading-relaxed tracking-wide">
                  Sign in to continue your conversation with CortexAI.
                </p>
              </motion.div>

              {/* Divider */}
              <motion.div
                variants={itemVariants}
                className="w-full flex items-center gap-4 mb-8"
              >
                <div className="flex-1 h-px bg-linear-to-r from-transparent to-purple-400/30" />
                <span className="text-[10px] font-medium text-purple-300/60 uppercase tracking-widest">
                  Secure Login
                </span>
                <div className="flex-1 h-px bg-linear-to-l from-transparent to-purple-400/30" />
              </motion.div>

              {/* Google Authentication Button - Using Bold 700 equivalent */}
              <motion.div variants={itemVariants} className="w-full mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={signInWithGoogle}
                  disabled={isAuthenticating}
                  className="w-full relative group flex items-center justify-center gap-3 bg-white py-3.5 px-4 rounded-xl text-sm font-bold text-purple-950 transition-all duration-300 hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden tracking-wider"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-purple-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <AnimatePresence mode="wait">
                    {isAuthenticating ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                        <span>Authenticating...</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 relative z-10"
                      >
                        <FcGoogle className="w-5 h-5" />
                        <span>Continue with Google</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>

              {/* Legal / Footer Text */}
              <motion.div variants={itemVariants}>
                <p className="text-[10px] text-purple-200/50 font-normal text-center leading-relaxed max-w-70 tracking-wide">
                  By continuing, you agree to our{" "}
                  <a
                    href="#"
                    className="text-purple-300/80 hover:text-purple-200 transition-colors underline underline-offset-4 decoration-purple-400/30"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-purple-300/80 hover:text-purple-200 transition-colors underline underline-offset-4 decoration-purple-400/30"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
