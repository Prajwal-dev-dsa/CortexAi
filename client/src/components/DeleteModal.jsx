import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { AlertTriangle, X } from "lucide-react";

export default function DeleteModal({ isOpen, onClose, onConfirm }) {
  const [confirmText, setConfirmText] = useState("");
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const handleConfirm = () => {
    if (confirmText.toLowerCase() === "delete") {
      onConfirm();
      setConfirmText("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center font-['Orbitron',sans-serif]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`absolute inset-0 backdrop-blur-sm ${isDarkMode ? "bg-[#070210]/80" : "bg-purple-900/40"}`}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-md border rounded-2xl p-6 z-10 ${isDarkMode ? "bg-[#1D0B3B] border-purple-500/30 shadow-[0_0_40px_-10px_rgba(147,51,234,0.3)]" : "bg-white border-purple-200 shadow-xl"}`}
          >
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 transition-colors ${isDarkMode ? "text-purple-400 hover:text-white" : "text-purple-500 hover:text-purple-900"}`}
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div
                className={`p-3 rounded-full border ${isDarkMode ? "bg-red-500/20 border-red-500/30" : "bg-red-100 border-red-200"}`}
              >
                <AlertTriangle
                  className={`w-6 h-6 ${isDarkMode ? "text-red-400" : "text-red-500"}`}
                />
              </div>
              <h2
                className={`text-xl font-bold tracking-wide ${isDarkMode ? "text-white" : "text-purple-950"}`}
              >
                Delete Chat
              </h2>
            </div>

            <p
              className={`text-sm mb-6 leading-relaxed ${isDarkMode ? "text-purple-200/70" : "text-purple-700"}`}
            >
              This action cannot be undone. To confirm deletion, please type{" "}
              <span
                className={`${isDarkMode ? "text-red-400" : "text-red-500"} font-semibold`}
              >
                delete
              </span>{" "}
              below.
            </p>

            <input
              type="text"
              placeholder="Type 'delete' to confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className={`w-full border rounded-lg px-4 py-3 outline-none transition-all mb-6 ${isDarkMode ? "bg-[#070210]/50 border-purple-500/30 text-white focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50" : "bg-purple-50 border-purple-200 text-purple-950 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"}`}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? "text-purple-300 hover:bg-purple-500/10" : "text-purple-600 hover:bg-purple-100"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={confirmText.toLowerCase() !== "delete"}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${isDarkMode ? "bg-red-600 shadow-[0_0_15px_-3px_rgba(239,68,68,0.5)]" : "bg-red-600 shadow-md"}`}
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
