import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

export default function DeleteModal({ isOpen, onClose, onConfirm }) {
  const [confirmText, setConfirmText] = useState("");

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
            className="absolute inset-0 bg-[#070210]/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#1D0B3B] border border-purple-500/30 rounded-2xl p-6 shadow-[0_0_40px_-10px_rgba(147,51,234,0.3)] z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-purple-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-500/20 rounded-full border border-red-500/30">
                <AlertTriangle className="text-red-400 w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Delete Chat
              </h2>
            </div>

            <p className="text-sm text-purple-200/70 mb-6 leading-relaxed">
              This action cannot be undone. To confirm deletion, please type{" "}
              <span className="text-red-400 font-semibold">delete</span> below.
            </p>

            <input
              type="text"
              placeholder="Type 'delete' to confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full bg-[#070210]/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all mb-6"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-purple-300 hover:bg-purple-500/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={confirmText.toLowerCase() !== "delete"}
                className="px-5 py-2.5 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
