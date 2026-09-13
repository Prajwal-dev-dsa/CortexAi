import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Sparkles, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { axiosInstance } from "../../utils/axios";
import { auth, googleProvider } from "../../utils/firebase";
import { signInWithPopup } from "firebase/auth";
import { setUserData } from "../redux/slices/userSlice";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import Artifact from "../components/Artifact";

export default function Home() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isAuthenticated = Boolean(userData);

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
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
          
          .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
              background: ${isDarkMode ? "rgba(147, 51, 234, 0.2)" : "rgba(147, 51, 234, 0.3)"};
              border-radius: 4px;
          }
          .custom-scrollbar:hover::-webkit-scrollbar-thumb {
              background: ${isDarkMode ? "rgba(147, 51, 234, 0.5)" : "rgba(147, 51, 234, 0.6)"};
          }
        `}
      </style>

      <div
        className={`${isDarkMode ? "bg-[#070210]" : "bg-purple-50"} min-h-screen w-full transition-colors duration-500`}
      >
        <AnimatePresence mode="wait">
          {isAuthenticated ? (
            <motion.div
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`flex h-screen w-full ${isDarkMode ? "bg-[#070210] text-white" : "bg-purple-50 text-purple-950"} overflow-hidden font-['Orbitron',sans-serif]`}
            >
              <Sidebar
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
              />

              <div
                className={`flex-1 min-w-0 flex flex-col border-r ${isDarkMode ? "border-purple-500/20 bg-[#070210]" : "border-purple-200 bg-purple-50"} relative z-10 overflow-hidden`}
              >
                <ChatArea onOpenSidebar={() => setIsMobileOpen(true)} />
              </div>

              <Artifact />
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`relative min-h-screen w-full ${isDarkMode ? "bg-linear-to-br from-[#2D1657] via-[#110624] to-[#070210] text-white" : "bg-linear-to-br from-purple-100 via-white to-purple-50 text-purple-950"} flex items-center justify-center overflow-hidden font-['Orbitron',sans-serif] transition-colors duration-500`}
            >
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={`absolute top-[10%] left-[10%] w-[50vw] h-[50vw] rounded-full blur-[130px] ${isDarkMode ? "bg-purple-600/30" : "bg-purple-300/40"}`}
                />

                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className={`absolute bottom-[10%] right-[10%] w-[60vw] h-[60vw] rounded-full blur-[160px] ${isDarkMode ? "bg-fuchsia-600/20" : "bg-fuchsia-300/30"}`}
                />

                <div
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 blur-[120px] rounded-full ${isDarkMode ? "bg-purple-500/15" : "bg-purple-400/20"}`}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-md px-6 sm:px-0"
              >
                <div
                  className={`relative overflow-hidden rounded-3xl backdrop-blur-2xl border p-8 sm:p-10 transition-colors duration-500 ${isDarkMode ? "bg-[#1D0B3B]/60 border-purple-400/30 shadow-[0_0_50px_-12px_rgba(147,51,234,0.4)]" : "bg-white/60 border-purple-200 shadow-[0_0_50px_-12px_rgba(147,51,234,0.15)]"}`}
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent to-transparent ${isDarkMode ? "via-purple-300/40" : "via-purple-400/30"}`}
                  />

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center text-center"
                  >
                    <motion.div
                      variants={itemVariants}
                      className={`mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)] ${isDarkMode ? "border-purple-400/40 bg-purple-500/20" : "border-purple-300 bg-purple-100"}`}
                    >
                      <Sparkles
                        className={`w-3.5 h-3.5 ${isDarkMode ? "text-purple-200" : "text-purple-600"}`}
                      />
                      <span
                        className={`text-[10px] font-medium tracking-widest uppercase ${isDarkMode ? "text-purple-100" : "text-purple-700"}`}
                      >
                        CortexAI Engine
                      </span>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="mb-2 relative"
                    >
                      <div className="absolute inset-0 bg-purple-400 blur-2xl opacity-30 rounded-full" />
                      <BrainCircuit
                        className={`w-14 h-14 drop-shadow-[0_0_15px_rgba(216,180,254,0.6)] ${isDarkMode ? "text-purple-300" : "text-purple-600"}`}
                        strokeWidth={1.5}
                      />
                    </motion.div>

                    <motion.div variants={itemVariants} className="mb-8 mt-2">
                      <h1 className="text-3xl font-semibold tracking-wide mb-3 drop-shadow-md">
                        Welcome back
                      </h1>
                      <p
                        className={`text-xs font-normal max-w-65 mx-auto leading-relaxed tracking-wide ${isDarkMode ? "text-purple-200/80" : "text-purple-700/80"}`}
                      >
                        Sign in to continue your conversation with CortexAI.
                      </p>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="w-full flex items-center gap-4 mb-8"
                    >
                      <div
                        className={`flex-1 h-px bg-linear-to-r from-transparent ${isDarkMode ? "to-purple-400/30" : "to-purple-300"}`}
                      />
                      <span
                        className={`text-[10px] font-medium uppercase tracking-widest ${isDarkMode ? "text-purple-300/60" : "text-purple-500"}`}
                      >
                        Secure Login
                      </span>
                      <div
                        className={`flex-1 h-px bg-linear-to-l from-transparent ${isDarkMode ? "to-purple-400/30" : "to-purple-300"}`}
                      />
                    </motion.div>

                    <motion.div variants={itemVariants} className="w-full mb-6">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={signInWithGoogle}
                        disabled={isAuthenticating}
                        className={`w-full relative group flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden tracking-wider ${isDarkMode ? "bg-white text-purple-950 hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]" : "bg-purple-600 text-white hover:shadow-[0_0_25px_-5px_rgba(147,51,234,0.4)]"}`}
                      >
                        <div
                          className={`absolute inset-0 bg-linear-to-r from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isDarkMode ? "via-purple-100/50" : "via-white/20"}`}
                        />

                        <AnimatePresence mode="wait">
                          {isAuthenticating ? (
                            <motion.div
                              key="loading"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <Loader2
                                className={`w-5 h-5 animate-spin ${isDarkMode ? "text-purple-600" : "text-white"}`}
                              />
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
                              <FcGoogle className="w-5 h-5 bg-white rounded-full" />
                              <span>Continue with Google</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <p
                        className={`text-[10px] font-normal text-center leading-relaxed max-w-70 tracking-wide mx-auto ${isDarkMode ? "text-purple-200/50" : "text-purple-600/70"}`}
                      >
                        By continuing, you agree to our{" "}
                        <a
                          href="#"
                          className={`transition-colors underline underline-offset-4 ${isDarkMode ? "text-purple-300/80 hover:text-purple-200 decoration-purple-400/30" : "text-purple-700 hover:text-purple-900 decoration-purple-400"}`}
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="#"
                          className={`transition-colors underline underline-offset-4 ${isDarkMode ? "text-purple-300/80 hover:text-purple-200 decoration-purple-400/30" : "text-purple-700 hover:text-purple-900 decoration-purple-400"}`}
                        >
                          Privacy Policy
                        </a>
                        .
                      </p>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
