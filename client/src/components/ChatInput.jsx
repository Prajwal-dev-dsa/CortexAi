import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import {
  Send,
  Paperclip,
  Mic,
  X,
  Image as ImageIcon,
  Zap,
  MessageSquare,
  Code,
  FileText,
  Presentation,
  Globe,
  FileSearch,
  ScanEye,
  Lock,
} from "lucide-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const AGENTS = [
  { id: "auto", label: "Auto", icon: Zap },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "search", label: "Search", icon: Globe },
  { id: "pdf", label: "PDF Gen", icon: FileText },
  { id: "ppt", label: "PPT Gen", icon: Presentation },
  { id: "image", label: "Image Gen", icon: ImageIcon },
  { id: "coding", label: "Coding", icon: Code },
  { id: "pdfRag", label: "Ask PDF", icon: FileSearch },
  { id: "imageAnalyzer", label: "Vision", icon: ScanEye },
];

const PLAN_ACCESS = {
  free: ["auto", "chat", "search"],
  go: ["auto", "chat", "search", "pdf", "ppt"],
  pro: ["auto", "chat", "search", "pdf", "ppt", "image", "coding"],
  enterprise: [
    "auto",
    "chat",
    "search",
    "pdf",
    "ppt",
    "image",
    "coding",
    "pdfRag",
    "imageAnalyzer",
  ],
};

export default function ChatInput({ onSendMessage, isProcessing }) {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState("auto");

  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const { userData } = useSelector((state) => state.user);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const currentPlan = userData?.plan?.toLowerCase() || "free";

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const displayValue =
    listening && transcript ? `${text} ${transcript}`.trim() : text;

  const handleInputClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      if (transcript) {
        setText(displayValue);
        resetTranscript();
      }
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      if (transcript) {
        setText(displayValue);
        resetTranscript();
      }
    } else {
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  useEffect(() => {
    if (!listening && transcript) {
      setText((prev) => `${prev} ${transcript}`.trim());
      resetTranscript();
    }
  }, [listening, transcript, resetTranscript]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null;
      setAttachment({ file, previewUrl, name: file.name, type: file.type });
    }
    e.target.value = null;
  };

  const removeAttachment = () => {
    if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    setAttachment(null);
  };

  const handleSend = () => {
    const finalMessage = displayValue;
    if (!finalMessage.trim() && !attachment) return;

    if (listening) {
      SpeechRecognition.stopListening();
      resetTranscript();
    }

    onSendMessage({
      text: finalMessage,
      attachment: attachment?.file || null,
      agent: selectedAgent,
    });

    setText("");
    removeAttachment();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto p-1 sm:p-4 font-['Orbitron',sans-serif]">
      <AnimatePresence>
        {attachment && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute bottom-full left-4 mb-2 p-2 border rounded-xl shadow-lg flex items-center gap-3 z-10 ${isDarkMode ? "bg-[#1D0B3B] border-purple-500/40" : "bg-white border-purple-200"}`}
          >
            {attachment.previewUrl ? (
              <img
                src={attachment.previewUrl}
                alt="preview"
                className={`w-12 h-12 rounded-lg object-cover border ${isDarkMode ? "border-purple-500/30" : "border-purple-200"}`}
              />
            ) : (
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center border ${isDarkMode ? "bg-purple-900/40 border-purple-500/30" : "bg-purple-100 border-purple-200"}`}
              >
                <FileText
                  className={`w-6 h-6 ${isDarkMode ? "text-purple-300" : "text-purple-600"}`}
                />
              </div>
            )}
            <div className="flex flex-col pr-4">
              <span
                className={`text-xs truncate max-w-30 sm:max-w-37.5 ${isDarkMode ? "text-purple-200" : "text-purple-900"}`}
              >
                {attachment.name}
              </span>
              <span
                className={`text-[10px] ${isDarkMode ? "text-purple-400" : "text-purple-500"}`}
              >
                Ready to send
              </span>
            </div>
            <button
              onClick={removeAttachment}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-md"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`relative flex flex-col gap-2 backdrop-blur-xl border rounded-2xl p-2 sm:p-3 transition-all ${isDarkMode ? "bg-[#110624]/90 border-purple-500/30 shadow-[0_0_30px_-10px_rgba(147,51,234,0.3)] focus-within:border-purple-400/60 focus-within:shadow-[0_0_30px_-5px_rgba(147,51,234,0.5)]" : "bg-white/90 border-purple-200 shadow-[0_0_30px_-10px_rgba(147,51,234,0.15)] focus-within:border-purple-400 focus-within:shadow-[0_0_30px_-5px_rgba(147,51,234,0.25)]"}`}
      >
        <div
          className={`flex items-center gap-1.5 sm:gap-2 border-b pb-2.5 sm:pb-3 mb-1.5 sm:mb-2 overflow-x-auto custom-scrollbar w-full ${isDarkMode ? "border-purple-500/20" : "border-purple-100"}`}
        >
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            const isSelected = selectedAgent === agent.id;
            const isAllowed = PLAN_ACCESS[currentPlan]?.includes(agent.id);

            return (
              <button
                key={agent.id}
                onClick={() => isAllowed && setSelectedAgent(agent.id)}
                disabled={!isAllowed}
                title={
                  !isAllowed ? `Upgrade to unlock ${agent.label}` : agent.label
                }
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all shrink-0 ${
                  !isAllowed
                    ? `opacity-40 cursor-not-allowed border border-transparent ${isDarkMode ? "text-purple-300" : "text-purple-800"}`
                    : isSelected
                      ? "bg-purple-600 text-white shadow-[0_0_10px_-2px_rgba(147,51,234,0.6)]"
                      : isDarkMode
                        ? "bg-transparent text-purple-300/70 hover:bg-purple-500/20 hover:text-purple-200 border border-transparent hover:border-purple-500/30"
                        : "bg-transparent text-purple-600/80 hover:bg-purple-100 hover:text-purple-950 border border-transparent hover:border-purple-300"
                }`}
              >
                <Icon size={14} />
                <span className="font-['Orbitron',sans-serif] tracking-wider hidden sm:inline whitespace-nowrap">
                  {agent.label}
                </span>
                {!isAllowed && <Lock size={10} className="ml-0.5" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-end gap-1 sm:gap-2 w-full min-w-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 sm:p-2.5 rounded-xl transition-colors shrink-0 mb-0.5 ${isDarkMode ? "text-purple-400 hover:text-purple-200 hover:bg-purple-500/20" : "text-purple-600 hover:text-purple-950 hover:bg-purple-100"}`}
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>

          <textarea
            ref={textareaRef}
            value={displayValue}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={handleInputClick}
            readOnly={listening}
            placeholder={listening ? "Listening..." : "Ask Anything..."}
            className={`flex-1 min-w-0 bg-transparent resize-none outline-none py-2.5 px-1 sm:px-2 max-h-32 custom-scrollbar text-sm md:text-md font-dm font-mono tracking-wide ${isDarkMode ? "text-white placeholder-purple-300/40" : "text-purple-950 placeholder-purple-400/60"} ${listening ? "cursor-default opacity-80" : "cursor-text opacity-100"}`}
            rows={1}
            style={{ minHeight: "44px" }}
          />

          <div className="flex items-center gap-1 shrink-0 mb-0.5">
            {browserSupportsSpeechRecognition && (
              <button
                onClick={toggleListening}
                className={`p-2 sm:p-2.5 rounded-xl transition-all ${listening ? "bg-red-500/20 text-red-500 animate-pulse border border-red-500/50" : isDarkMode ? "text-purple-400 hover:text-purple-200 hover:bg-purple-500/20" : "text-purple-600 hover:text-purple-950 hover:bg-purple-100"}`}
                title="Voice typing"
              >
                <Mic size={20} />
              </button>
            )}

            <button
              onClick={handleSend}
              disabled={isProcessing || (!displayValue.trim() && !attachment)}
              className={`p-2 sm:p-2.5 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_-3px_rgba(147,51,234,0.5)] ${isDarkMode ? "bg-purple-600 hover:bg-purple-500" : "bg-purple-600 hover:bg-purple-700"}`}
            >
              <Send
                size={18}
                className={
                  isProcessing ? "opacity-50" : "opacity-100 sm:ml-0.5"
                }
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
