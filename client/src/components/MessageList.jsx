import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import {
  BrainCircuit,
  User,
  Check,
  Copy,
  Code,
  PenTool,
  Lightbulb,
  GraduationCap,
  X,
  ImageOff,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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

// Fallback for Grid Images (Search)
const ImageWithFallback = ({ src, onClick }) => {
  const [hasError, setHasError] = useState(false);
  if (hasError) return null;
  return (
    <div
      onClick={() => onClick(src)}
      className="cursor-pointer overflow-hidden rounded-xl border border-purple-500/30 bg-[#0F0524] group aspect-video"
    >
      <img
        src={src}
        alt="Search Result"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover group-hover:scale-105 group-hover:opacity-80 transition-all duration-300"
      />
    </div>
  );
};

// Premium Markdown Image Component (Handles Expired S3 Links & Resizing)
const MarkdownImage = ({ src, alt, onClick }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-75 h-48 rounded-2xl shadow-lg border border-purple-500/20 bg-[#0F0524] my-4 text-purple-400/50">
        <ImageOff size={24} className="mb-2 opacity-50" />
        <span className="text-xs font-['Orbitron',sans-serif] tracking-widest uppercase">
          Link Expired
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      onClick={() => onClick(src)}
      className="w-full max-w-75 rounded-2xl shadow-[0_0_30px_-10px_rgba(147,51,234,0.3)] border border-purple-500/30 object-cover my-4 cursor-zoom-in hover:opacity-90 transition-opacity"
    />
  );
};

// Premium Code Block with Copy Button
const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden my-6 border border-purple-500/20 shadow-lg font-sans bg-[#070210] max-w-full">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0F0524] border-b border-purple-500/20">
        <span className="text-xs font-['Orbitron',sans-serif] text-purple-300 uppercase tracking-wider">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-white transition-colors"
        >
          {copied ? (
            <Check size={14} className="text-green-400" />
          ) : (
            <Copy size={14} />
          )}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: "1.25rem",
            background: "transparent",
            fontSize: "0.875rem",
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default function MessageList({
  messages,
  isProcessing,
  userData,
  onSuggestionClick,
}) {
  const endOfMessagesRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  return (
    <>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 font-sans flex flex-col relative">
        {/* EMPTY STATE */}
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
              Start typing below or choose a suggestion to begin the
              conversation.
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
          /* ACTIVE CHAT MESSAGES */
          <div className="space-y-10 w-full max-w-5xl mx-auto pb-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const isUser = msg.role === "user";
                const timeString = msg.createdAt
                  ? format(new Date(msg.createdAt), "h:mm a")
                  : format(new Date(), "h:mm a");

                return (
                  <motion.div
                    key={msg._id || index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex gap-4 max-w-[95%] md:max-w-[85%] w-full ${isUser ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar */}
                      <div className="shrink-0 mt-1">
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

                      {/* Content Body */}
                      <div
                        className={`flex flex-col ${isUser ? "items-end" : "items-start"} min-w-0 w-full`}
                      >
                        <div
                          className={`relative text-[15px] w-full ${
                            isUser
                              ? "px-5 py-3.5 bg-purple-600 text-white rounded-2xl rounded-tr-sm shadow-lg leading-relaxed inline-block max-w-fit"
                              : "py-1 text-purple-50"
                          }`}
                        >
                          {/* Search Image Grid Rendering */}
                          {!isUser && msg.images && msg.images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6 w-full max-w-3xl">
                              {msg.images.slice(0, 8).map((img, i) => (
                                <ImageWithFallback
                                  key={i}
                                  src={img}
                                  onClick={setSelectedImage}
                                />
                              ))}
                            </div>
                          )}

                          {isUser ? (
                            <div className="whitespace-pre-wrap">
                              {msg.content}
                            </div>
                          ) : (
                            <div className="w-full wrap-break-word">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({ node, ...props }) => (
                                    <p
                                      className="mb-4 leading-relaxed text-gray-200"
                                      {...props}
                                    />
                                  ),
                                  a: ({ node, ...props }) => (
                                    <a
                                      className="text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors font-medium break-all"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      {...props}
                                    />
                                  ),
                                  // Use our new robust MarkdownImage component
                                  img: ({ node, ...props }) => (
                                    <MarkdownImage
                                      {...props}
                                      onClick={setSelectedImage}
                                    />
                                  ),
                                  h1: ({ node, ...props }) => (
                                    <h1
                                      className="text-4xl md:text-5xl font-extrabold text-white mt-10 mb-6 tracking-tight border-b border-purple-500/30 pb-4"
                                      {...props}
                                    />
                                  ),
                                  h2: ({ node, ...props }) => (
                                    <h2
                                      className="text-3xl md:text-4xl font-bold text-white mt-8 mb-5 tracking-tight border-b border-purple-500/20 pb-3"
                                      {...props}
                                    />
                                  ),
                                  h3: ({ node, ...props }) => (
                                    <h3
                                      className="text-2xl md:text-3xl font-bold text-white mt-8 mb-4 tracking-wide"
                                      {...props}
                                    />
                                  ),
                                  h4: ({ node, ...props }) => (
                                    <h4
                                      className="text-xl md:text-2xl font-bold text-purple-50 mt-6 mb-3 tracking-wide"
                                      {...props}
                                    />
                                  ),
                                  h5: ({ node, ...props }) => (
                                    <h5
                                      className="text-lg md:text-xl font-bold text-purple-100 mt-6 mb-3 tracking-wide"
                                      {...props}
                                    />
                                  ),
                                  h6: ({ node, ...props }) => (
                                    <h6
                                      className="text-base md:text-lg font-bold text-purple-200 mt-6 mb-2 uppercase tracking-widest"
                                      {...props}
                                    />
                                  ),

                                  ul: ({ node, ...props }) => (
                                    <ul
                                      className="list-disc list-inside mb-6 space-y-2 marker:text-purple-500 text-gray-200"
                                      {...props}
                                    />
                                  ),
                                  ol: ({ node, ...props }) => (
                                    <ol
                                      className="list-decimal list-inside mb-6 space-y-2 marker:text-purple-500 text-gray-200"
                                      {...props}
                                    />
                                  ),
                                  li: ({ node, ...props }) => (
                                    <li
                                      className="leading-relaxed"
                                      {...props}
                                    />
                                  ),
                                  strong: ({ node, ...props }) => (
                                    <strong
                                      className="font-bold text-white"
                                      {...props}
                                    />
                                  ),
                                  blockquote: ({ node, ...props }) => (
                                    <blockquote
                                      className="border-l-4 border-purple-500/50 pl-4 py-1 my-4 bg-purple-500/5 rounded-r-lg italic text-purple-200/80"
                                      {...props}
                                    />
                                  ),
                                  table: ({ node, ...props }) => (
                                    <div className="overflow-x-auto w-full mb-6 border border-purple-500/20 rounded-xl custom-scrollbar shadow-lg">
                                      <table
                                        className="w-full text-left border-collapse text-sm min-w-150"
                                        {...props}
                                      />
                                    </div>
                                  ),
                                  thead: ({ node, ...props }) => (
                                    <thead
                                      className="bg-[#15072B] text-purple-200 border-b border-purple-500/30"
                                      {...props}
                                    />
                                  ),
                                  th: ({ node, ...props }) => (
                                    <th
                                      className="p-4 font-semibold tracking-wide whitespace-nowrap"
                                      {...props}
                                    />
                                  ),
                                  td: ({ node, ...props }) => (
                                    <td
                                      className="p-4 border-b border-purple-500/10 text-gray-300 leading-relaxed bg-[#0A0214]/50"
                                      {...props}
                                    />
                                  ),
                                  code({
                                    node,
                                    inline,
                                    className,
                                    children,
                                    ...props
                                  }) {
                                    const match = /language-(\w+)/.exec(
                                      className || "",
                                    );
                                    return !inline && match ? (
                                      <CodeBlock
                                        language={match[1]}
                                        value={String(children).replace(
                                          /\n$/,
                                          "",
                                        )}
                                      />
                                    ) : (
                                      <code
                                        className="bg-[#2D1636] text-[#E879F9] px-1.5 py-0.5 rounded-md text-[13px] font-mono border border-purple-900/30"
                                        {...props}
                                      >
                                        {children}
                                      </code>
                                    );
                                  },
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>

                        <span className="text-[10px] text-purple-400/50 mt-2 px-1 font-['Orbitron',sans-serif] tracking-wider">
                          {timeString}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Processing Animation */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex w-full justify-start max-w-5xl mx-auto"
                >
                  <div className="flex gap-4 max-w-[85%] flex-row">
                    <div className="shrink-0 mt-1 w-8 h-8 rounded-full bg-linear-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center border border-purple-400/50 shadow-[0_0_15px_-3px_rgba(168,85,247,0.6)]">
                      <BrainCircuit
                        size={16}
                        className="text-white animate-pulse"
                      />
                    </div>
                    <div className="bg-transparent py-2 flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
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

      {/* Full-Screen Interactive Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-100 flex items-center justify-center bg-[#070210]/90 backdrop-blur-xl p-4 sm:p-10 cursor-zoom-out"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              className="absolute top-6 right-6 p-2.5 bg-[#1D0B3B]/80 text-purple-300 rounded-full hover:bg-purple-600 hover:text-white transition-all border border-purple-500/30 shadow-lg cursor-pointer"
            >
              <X size={20} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedImage}
              alt="Expanded view"
              className="max-w-full max-h-full rounded-2xl shadow-[0_0_50px_-12px_rgba(147,51,234,0.4)] border border-purple-500/30 object-contain cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
