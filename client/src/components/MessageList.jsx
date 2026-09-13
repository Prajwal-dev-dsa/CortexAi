import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { useSelector } from "react-redux";
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
  FileText,
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

const ImageWithFallback = ({ src, onClick, isDarkMode }) => {
  const [hasError, setHasError] = useState(false);
  if (hasError) return null;
  return (
    <div
      onClick={() => onClick(src)}
      className={`cursor-pointer overflow-hidden rounded-xl border group aspect-video ${isDarkMode ? "border-purple-500/30 bg-[#0F0524]" : "border-purple-200 bg-purple-50"}`}
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

const MarkdownImage = ({ src, alt, onClick, isDarkMode }) => {
  const [hasError, setHasError] = useState(false);
  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center w-full max-w-75 h-48 rounded-2xl shadow-lg border my-4 ${isDarkMode ? "border-purple-500/20 bg-[#0F0524] text-purple-400/50" : "border-purple-200 bg-purple-50 text-purple-600/50"}`}
      >
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
      className={`w-full max-w-75 rounded-2xl shadow-[0_0_30px_-10px_rgba(147,51,234,0.3)] border object-cover my-4 cursor-zoom-in hover:opacity-90 transition-opacity ${isDarkMode ? "border-purple-500/30" : "border-purple-200"}`}
    />
  );
};

const CodeBlock = ({ language, value, isDarkMode }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-xl overflow-hidden my-6 border shadow-lg font-sans max-w-full ${isDarkMode ? "border-purple-500/20 bg-[#070210]" : "border-purple-200 bg-white"}`}
    >
      <div
        className={`flex items-center justify-between px-4 py-2.5 border-b ${isDarkMode ? "bg-[#0F0524] border-purple-500/20" : "bg-purple-100 border-purple-200"}`}
      >
        <span
          className={`text-xs font-['Orbitron',sans-serif] uppercase tracking-wider ${isDarkMode ? "text-purple-300" : "text-purple-700"}`}
        >
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-xs transition-colors ${isDarkMode ? "text-purple-400 hover:text-white" : "text-purple-600 hover:text-purple-900"}`}
        >
          {copied ? (
            <Check size={14} className="text-green-500" />
          ) : (
            <Copy size={14} />
          )}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div
        className={`max-w-full overflow-x-auto custom-scrollbar ${!isDarkMode && "bg-[#1E1E1E]"}`}
      >
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
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  return (
    <>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col relative">
        {messages.length === 0 && !isProcessing ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="m-auto flex flex-col items-center justify-center w-full max-w-3xl pb-10"
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center border mb-6 shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)] ${isDarkMode ? "bg-purple-600/20 border-purple-500/30" : "bg-purple-200 border-purple-300"}`}
            >
              <BrainCircuit
                size={32}
                className={isDarkMode ? "text-purple-300" : "text-purple-600"}
              />
            </div>
            <h2
              className={`text-2xl font-bold mb-2 font-['Orbitron',sans-serif] tracking-wide text-center ${isDarkMode ? "text-white" : "text-purple-950"}`}
            >
              How can I help you today?
            </h2>
            <p
              className={`text-sm mb-10 text-center tracking-wide font-sans ${isDarkMode ? "text-purple-200/50" : "text-purple-700/60"}`}
            >
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
                  className={`flex flex-col items-start p-4 text-left border rounded-2xl transition-all shadow-lg group ${isDarkMode ? "bg-[#1D0B3B]/40 backdrop-blur-sm border-purple-500/20 hover:bg-purple-600/20 hover:border-purple-400/50" : "bg-white/60 backdrop-blur-sm border-purple-200 hover:bg-purple-50 hover:border-purple-400"}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? "bg-black/30 group-hover:bg-black/50" : "bg-purple-100 group-hover:bg-purple-200"}`}
                    >
                      {suggestion.icon}
                    </div>
                    <span
                      className={`font-semibold text-sm font-['Orbitron',sans-serif] ${isDarkMode ? "text-purple-100" : "text-purple-900"}`}
                    >
                      {suggestion.title}
                    </span>
                  </div>
                  <p
                    className={`text-xs leading-relaxed font-sans ${isDarkMode ? "text-purple-300/60" : "text-purple-600"}`}
                  >
                    "{suggestion.prompt}"
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
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
                      <div className="shrink-0 mt-1">
                        {isUser ? (
                          userData?.profilePicture ? (
                            <img
                              src={userData.profilePicture}
                              alt="User"
                              className={`w-8 h-8 rounded-full border object-cover shadow-lg ${isDarkMode ? "border-purple-500/40" : "border-purple-300"}`}
                            />
                          ) : (
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-lg ${isDarkMode ? "bg-purple-700 border-purple-500/40" : "bg-purple-200 border-purple-300"}`}
                            >
                              <User
                                size={16}
                                className={
                                  isDarkMode
                                    ? "text-purple-200"
                                    : "text-purple-700"
                                }
                              />
                            </div>
                          )
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-[0_0_15px_-3px_rgba(168,85,247,0.6)] ${isDarkMode ? "bg-linear-to-br from-purple-600 to-fuchsia-600 border-purple-400/50" : "bg-linear-to-br from-purple-500 to-fuchsia-500 border-purple-300"}`}
                          >
                            <BrainCircuit size={16} className="text-white" />
                          </div>
                        )}
                      </div>

                      <div
                        className={`flex flex-col ${isUser ? "items-end" : "items-start"} min-w-0 w-full font-dm`}
                      >
                        <div
                          className={`relative text-[15px] w-full ${isUser ? "px-5 py-3.5 bg-purple-600 text-white rounded-2xl rounded-tr-sm shadow-lg leading-relaxed inline-block max-w-fit font-medium" : `py-1 font-normal ${isDarkMode ? "text-purple-50" : "text-purple-950"}`}`}
                        >
                          {!isUser && msg.images && msg.images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6 w-full max-w-3xl">
                              {msg.images.slice(0, 8).map((img, i) => (
                                <ImageWithFallback
                                  key={i}
                                  src={img}
                                  onClick={setSelectedImage}
                                  isDarkMode={isDarkMode}
                                />
                              ))}
                            </div>
                          )}

                          {isUser ? (
                            <div className="flex flex-col items-end gap-3 whitespace-pre-wrap tracking-wide">
                              {msg.attachment &&
                                msg.attachment.type?.startsWith("image/") && (
                                  <img
                                    src={msg.attachment.url}
                                    alt="Uploaded"
                                    className={`w-48 md:w-64 rounded-xl border shadow-md object-cover ${isDarkMode ? "border-purple-500/30" : "border-purple-300"}`}
                                  />
                                )}
                              {msg.attachment &&
                                msg.attachment.type === "application/pdf" && (
                                  <div
                                    className={`flex items-center gap-2 px-3 py-2 border rounded-xl shadow-md w-full max-w-xs font-['Orbitron',sans-serif] ${isDarkMode ? "bg-[#1D0B3B] border-purple-500/40" : "bg-purple-100 border-purple-300"}`}
                                  >
                                    <FileText
                                      size={18}
                                      className={
                                        isDarkMode
                                          ? "text-purple-400 shrink-0"
                                          : "text-purple-600 shrink-0"
                                      }
                                    />
                                    <span
                                      className={`text-xs font-medium truncate ${isDarkMode ? "text-purple-200" : "text-purple-900"}`}
                                    >
                                      {msg.attachment.name}
                                    </span>
                                  </div>
                                )}
                              <div>{msg.content}</div>
                            </div>
                          ) : (
                            <div className="w-full wrap-break-word font-dm">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({ node, ...props }) => (
                                    <p
                                      className={`mb-4 leading-relaxed font-dm font-medium tracking-wide ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
                                      {...props}
                                    />
                                  ),
                                  a: ({ node, ...props }) => (
                                    <a
                                      className={`underline underline-offset-4 transition-colors font-medium break-all ${isDarkMode ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-800"}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      {...props}
                                    />
                                  ),
                                  img: ({ node, ...props }) => (
                                    <MarkdownImage
                                      {...props}
                                      onClick={setSelectedImage}
                                      isDarkMode={isDarkMode}
                                    />
                                  ),
                                  h1: ({ node, ...props }) => (
                                    <h1
                                      className={`text-4xl md:text-5xl font-bold font-dm mt-10 mb-6 tracking-tight border-b pb-4 ${isDarkMode ? "text-white border-purple-500/30" : "text-purple-950 border-purple-200"}`}
                                      {...props}
                                    />
                                  ),
                                  h2: ({ node, ...props }) => (
                                    <h2
                                      className={`text-3xl md:text-4xl font-bold font-dm mt-8 mb-5 tracking-tight border-b pb-3 ${isDarkMode ? "text-white border-purple-500/20" : "text-purple-950 border-purple-200"}`}
                                      {...props}
                                    />
                                  ),
                                  h3: ({ node, ...props }) => (
                                    <h3
                                      className={`text-2xl md:text-3xl font-bold font-dm mt-8 mb-4 tracking-wide ${isDarkMode ? "text-white" : "text-purple-900"}`}
                                      {...props}
                                    />
                                  ),
                                  h4: ({ node, ...props }) => (
                                    <h4
                                      className={`text-xl md:text-2xl font-bold font-dm mt-6 mb-3 tracking-wide ${isDarkMode ? "text-purple-50" : "text-purple-800"}`}
                                      {...props}
                                    />
                                  ),
                                  h5: ({ node, ...props }) => (
                                    <h5
                                      className={`text-lg md:text-xl font-bold font-dm mt-6 mb-3 tracking-wide ${isDarkMode ? "text-purple-100" : "text-purple-800"}`}
                                      {...props}
                                    />
                                  ),
                                  h6: ({ node, ...props }) => (
                                    <h6
                                      className={`text-base md:text-lg font-bold font-dm mt-6 mb-2 uppercase tracking-widest ${isDarkMode ? "text-purple-200" : "text-purple-700"}`}
                                      {...props}
                                    />
                                  ),
                                  ul: ({ node, ...props }) => (
                                    <ul
                                      className={`list-disc list-inside mb-6 space-y-2 marker:text-purple-500 font-dm font-normal ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
                                      {...props}
                                    />
                                  ),
                                  ol: ({ node, ...props }) => (
                                    <ol
                                      className={`list-decimal list-inside mb-6 space-y-2 marker:text-purple-500 font-dm font-normal ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
                                      {...props}
                                    />
                                  ),
                                  li: ({ node, ...props }) => (
                                    <li
                                      className="leading-relaxed font-dm font-normal tracking-wide"
                                      {...props}
                                    />
                                  ),
                                  strong: ({ node, ...props }) => (
                                    <strong
                                      className={`font-bold font-dm ${isDarkMode ? "text-white" : "text-purple-950"}`}
                                      {...props}
                                    />
                                  ),
                                  blockquote: ({ node, ...props }) => (
                                    <blockquote
                                      className={`border-l-4 pl-4 py-1 my-4 rounded-r-lg italic font-dm ${isDarkMode ? "border-purple-500/50 bg-purple-500/5 text-purple-200/80" : "border-purple-400 bg-purple-50 text-purple-800"}`}
                                      {...props}
                                    />
                                  ),
                                  table: ({ node, ...props }) => (
                                    <div
                                      className={`overflow-x-auto w-full mb-6 border rounded-xl custom-scrollbar shadow-lg font-dm ${isDarkMode ? "border-purple-500/20" : "border-purple-200"}`}
                                    >
                                      <table
                                        className="w-full text-left border-collapse text-sm min-w-150"
                                        {...props}
                                      />
                                    </div>
                                  ),
                                  thead: ({ node, ...props }) => (
                                    <thead
                                      className={`border-b font-dm ${isDarkMode ? "bg-[#15072B] text-purple-200 border-purple-500/30" : "bg-purple-100 text-purple-900 border-purple-200"}`}
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
                                      className={`p-4 border-b leading-relaxed ${isDarkMode ? "border-purple-500/10 text-gray-300 bg-[#0A0214]/50" : "border-purple-100 text-gray-800 bg-white"}`}
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
                                        isDarkMode={isDarkMode}
                                      />
                                    ) : (
                                      <code
                                        className={`px-1.5 py-0.5 rounded-md text-[13px] font-mono border ${isDarkMode ? "bg-[#2D1636] text-[#E879F9] border-purple-900/30" : "bg-purple-100 text-purple-700 border-purple-200"}`}
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
                        <span
                          className={`text-[10px] mt-2 px-1 font-['Orbitron',sans-serif] tracking-wider ${isDarkMode ? "text-purple-400/50" : "text-purple-500/70"}`}
                        >
                          {timeString}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex w-full justify-start max-w-5xl mx-auto"
                >
                  <div className="flex gap-4 max-w-[85%] flex-row">
                    <div
                      className={`shrink-0 mt-1 w-8 h-8 rounded-full flex items-center justify-center border shadow-[0_0_15px_-3px_rgba(168,85,247,0.6)] ${isDarkMode ? "bg-linear-to-br from-purple-600 to-fuchsia-600 border-purple-400/50" : "bg-linear-to-br from-purple-500 to-fuchsia-500 border-purple-300"}`}
                    >
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

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className={`fixed inset-0 z-100 flex items-center justify-center backdrop-blur-xl p-4 sm:p-10 cursor-zoom-out ${isDarkMode ? "bg-[#070210]/90" : "bg-white/90"}`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              className={`absolute top-6 right-6 p-2.5 rounded-full transition-all border shadow-lg cursor-pointer ${isDarkMode ? "bg-[#1D0B3B]/80 text-purple-300 hover:bg-purple-600 hover:text-white border-purple-500/30" : "bg-white text-purple-600 hover:bg-purple-100 border-purple-200"}`}
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
              className={`max-w-full max-h-full rounded-2xl shadow-[0_0_50px_-12px_rgba(147,51,234,0.4)] border object-contain cursor-default ${isDarkMode ? "border-purple-500/30" : "border-purple-300"}`}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
