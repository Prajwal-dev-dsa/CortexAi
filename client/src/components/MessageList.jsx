import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { BrainCircuit, User } from "lucide-react";

export default function MessageList({ messages, isProcessing, userData }) {
  const endOfMessagesRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 font-sans">
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
                    {/* Markdown Rendering for Assistant, plain text for User */}
                    {isUser ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
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
                <BrainCircuit size={16} className="text-white animate-pulse" />
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
      <div ref={endOfMessagesRef} className="h-4" />
    </div>
  );
}
