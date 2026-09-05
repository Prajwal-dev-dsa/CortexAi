import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import {
  BrainCircuit,
  User,
  Code,
  PenTool,
  Lightbulb,
  GraduationCap,
} from "lucide-react";

// Pre-defined suggestions for the empty chat screen
const SUGGESTIONS = [
  {
    icon: <Code size={18} className="text-blue-400" />,
    title: "Write Code",
    prompt:
      "Write a React component for a responsive navbar using Tailwind CSS.",
  },
  {
    icon: <PenTool size={18} className="text-pink-400" />,
    title: "Draft an Email",
    prompt: "Write a polite email to my boss asking for a deadline extension.",
  },
  {
    icon: <Lightbulb size={18} className="text-yellow-400" />,
    title: "Brainstorm Ideas",
    prompt: "Give me 5 unique project ideas for an AI software hackathon.",
  },
  {
    icon: <GraduationCap size={18} className="text-green-400" />,
    title: "Learn Something",
    prompt: "Explain quantum computing in simple terms for a beginner.",
  },
];

export default function MessageList({
  messages,
  isProcessing,
  userData,
  onSuggestionClick,
}) {
  const endOfMessagesRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 font-sans flex flex-col relative">
      {/* 
        PREMIUM EMPTY STATE: 
        Shows only when there are no messages and the AI isn't currently typing 
      */}
      {messages.length === 0 && !isProcessing ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="m-auto flex flex-col items-center justify-center w-full max-w-3xl pb-10"
        >
          <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center border border-purple-500/30 mb-6 shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)]">
            <BrainCircuit size={32} className="text-purple-300" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 font-['Orbitron',sans-serif] tracking-wide text-center">
            How can I help you today?
          </h2>
          <p className="text-purple-200/50 text-sm mb-10 text-center tracking-wide">
            Start typing below or choose a suggestion to begin the conversation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {SUGGESTIONS.map((suggestion, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSuggestionClick(suggestion.prompt)}
                className="flex flex-col items-start p-4 text-left bg-[#1D0B3B]/40 backdrop-blur-sm border border-purple-500/20 rounded-2xl hover:bg-purple-600/20 hover:border-purple-400/50 transition-all shadow-lg group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-black/30 rounded-lg group-hover:bg-black/50 transition-colors">
                    {suggestion.icon}
                  </div>
                  <span className="font-semibold text-sm text-purple-100 font-['Orbitron',sans-serif]">
                    {suggestion.title}
                  </span>
                </div>
                <p className="text-xs text-purple-300/60 leading-relaxed">
                  "{suggestion.prompt}"
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      ) : (
        /* 
          ACTIVE MESSAGES LIST 
        */
        <div className="space-y-8 w-full">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              const timeString = msg.createdAt
                ? format(new Date(msg.createdAt), "h:mm a")
                : format(new Date(), "h:mm a");

              return (
                <motion.div
                  key={msg._id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-4 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    <div className="shrink-0">
                      {isUser ? (
                        userData?.profilePicture ? (
                          <img
                            src={userData.profilePicture}
                            alt="User"
                            className="w-8 h-8 rounded-full border border-purple-500/40 object-cover shadow-lg"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center border border-purple-500/40 shadow-lg">
                            <User size={16} className="text-purple-200" />
                          </div>
                        )
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center border border-purple-400/50 shadow-[0_0_15px_-3px_rgba(168,85,247,0.6)]">
                          <BrainCircuit size={16} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* Bubble Container */}
                    <div
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`relative px-5 py-3.5 rounded-2xl shadow-lg leading-relaxed text-[15px] ${
                          isUser
                            ? "bg-purple-600 text-white rounded-tr-sm"
                            : "bg-[#1D0B3B]/80 backdrop-blur-md border border-purple-500/30 text-purple-50 rounded-tl-sm"
                        }`}
                      >
                        {isUser ? (
                          <div className="whitespace-pre-wrap">
                            {msg.content}
                          </div>
                        ) : (
                          <div className="prose prose-invert prose-purple max-w-none prose-p:leading-relaxed prose-pre:bg-[#070210] prose-pre:border prose-pre:border-purple-500/20 prose-pre:shadow-inner">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>

                      {/* Timestamp */}
                      <span className="text-[10px] text-purple-400/60 mt-1.5 px-1 font-['Orbitron',sans-serif] tracking-wider">
                        {timeString}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Loading State Animation */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex w-full justify-start"
              >
                <div className="flex gap-4 max-w-[85%] flex-row">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center border border-purple-400/50 shadow-[0_0_15px_-3px_rgba(168,85,247,0.6)]">
                    <BrainCircuit
                      size={16}
                      className="text-white animate-pulse"
                    />
                  </div>
                  <div className="bg-[#1D0B3B]/80 backdrop-blur-md border border-purple-500/30 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2 shadow-lg">
                    <span
                      className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      <div ref={endOfMessagesRef} className="h-4 shrink-0" />
    </div>
  );
}
