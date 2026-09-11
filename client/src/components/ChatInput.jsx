import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

// Expanded to include the new RAG and Analyzer agents
const AGENTS = [
  { id: "auto", label: "Auto", icon: Zap },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "coding", label: "Coding", icon: Code },
  { id: "pdf", label: "PDF Gen", icon: FileText },
  { id: "pdfRag", label: "Ask PDF", icon: FileSearch },
  { id: "ppt", label: "PPT Gen", icon: Presentation },
  { id: "image", label: "Image Gen", icon: ImageIcon },
  { id: "imageAnalyzer", label: "Vision", icon: ScanEye },
  { id: "search", label: "Search", icon: Globe },
];

export default function ChatInput({ onSendMessage, isProcessing }) {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState("auto");

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

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
      // Determine if it's an image for preview, otherwise it's a PDF/doc
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
    <div className="relative w-full max-w-4xl mx-auto p-4 font-['Orbitron',sans-serif]">
      <AnimatePresence>
        {attachment && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-4 mb-2 p-2 bg-[#1D0B3B] border border-purple-500/40 rounded-xl shadow-lg flex items-center gap-3 z-10"
          >
            {attachment.previewUrl ? (
              <img
                src={attachment.previewUrl}
                alt="preview"
                className="w-12 h-12 rounded-lg object-cover border border-purple-500/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-purple-900/40 flex items-center justify-center border border-purple-500/30">
                <FileText className="text-purple-300 w-6 h-6" />
              </div>
            )}
            <div className="flex flex-col pr-4">
              <span className="text-xs text-purple-200 truncate max-w-37.5">
                {attachment.name}
              </span>
              <span className="text-[10px] text-purple-400">Ready to send</span>
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

      <div className="relative flex flex-col gap-2 bg-[#110624]/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-3 shadow-[0_0_30px_-10px_rgba(147,51,234,0.3)] transition-all focus-within:border-purple-400/60 focus-within:shadow-[0_0_30px_-5px_rgba(147,51,234,0.5)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-purple-500/20 pb-2 mb-1">
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            const isSelected = selectedAgent === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-purple-600 text-white shadow-[0_0_10px_-2px_rgba(147,51,234,0.6)]"
                    : "bg-transparent text-purple-300/70 hover:bg-purple-500/20 hover:text-purple-200 border border-transparent hover:border-purple-500/30"
                }`}
              >
                <Icon size={14} />
                <span className="font-['Orbitron',sans-serif] tracking-wider hidden sm:inline">
                  {agent.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-end gap-2 w-full">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-purple-400 hover:text-purple-200 hover:bg-purple-500/20 rounded-xl transition-colors shrink-0 mb-0.5"
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
            placeholder={
              listening ? "Listening... (Click to type)" : "Ask Anything..."
            }
            className={`flex-1 bg-transparent text-white placeholder-purple-300/40 resize-none outline-none py-2.5 px-2 max-h-32 custom-scrollbar text-sm font-sans tracking-wide ${listening ? "cursor-default opacity-80" : "cursor-text opacity-100"}`}
            rows={1}
            style={{ minHeight: "44px" }}
          />

          <div className="flex items-center gap-1 shrink-0 mb-0.5">
            {browserSupportsSpeechRecognition && (
              <button
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all ${listening ? "bg-red-500/20 text-red-400 animate-pulse border border-red-500/50" : "text-purple-400 hover:text-purple-200 hover:bg-purple-500/20"}`}
                title="Voice typing"
              >
                <Mic size={20} />
              </button>
            )}

            <button
              onClick={handleSend}
              disabled={isProcessing || (!displayValue.trim() && !attachment)}
              className="p-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_-3px_rgba(147,51,234,0.5)]"
            >
              <Send
                size={18}
                className={isProcessing ? "opacity-50" : "opacity-100 ml-0.5"}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
