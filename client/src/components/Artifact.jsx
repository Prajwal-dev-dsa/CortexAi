import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Code,
  Play,
  PanelRightClose,
  PanelRightOpen,
  FileCode2,
  Terminal,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { getLanguageFromFileName } from "../../utils/fileUtils";

export default function Artifact() {
  const selectedConversation = useSelector(
    (state) => state.conversation.selectedConversation,
  );
  const { messages } = useSelector((state) => state.message);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("code"); // 'code' | 'preview'
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Derive the latest artifact from the conversation history
  const currentArtifact = useMemo(() => {
    const latestMsg = [...messages]
      .reverse()
      .find((m) => m.artifacts && m.artifacts.length > 0);
    return latestMsg?.artifacts?.[0] || null;
  }, [messages]);

  // Auto-open panel and reset tabs when a new artifact arrives
  useEffect(() => {
    if (currentArtifact) {
      setIsOpen(true);
      setActiveFileIndex(0);
      setActiveTab("code");
    }
  }, [currentArtifact]);

  // Pulling from the newly corrected .files array
  const files = currentArtifact?.files || [];
  const hasHtml = files.some((f) => f.name.endsWith(".html"));

  // Dynamically inject CSS and JS into the HTML for the preview iframe
  const previewSrcDoc = useMemo(() => {
    if (!hasHtml) return "";

    const htmlFile = files.find((f) => f.name.endsWith(".html"))?.content || "";
    const cssFiles = files.filter((f) => f.name.endsWith(".css"));
    const jsFiles = files.filter((f) => f.name.endsWith(".js"));

    const styleTags = cssFiles
      .map((f) => `<style>${f.content}</style>`)
      .join("\n");
    const scriptTags = jsFiles
      .map((f) => `<script>${f.content}</script>`)
      .join("\n");

    let finalHtml = htmlFile;
    if (finalHtml.includes("</head>")) {
      finalHtml = finalHtml.replace("</head>", `${styleTags}</head>`);
    } else {
      finalHtml = styleTags + finalHtml;
    }

    if (finalHtml.includes("</body>")) {
      finalHtml = finalHtml.replace("</body>", `${scriptTags}</body>`);
    } else {
      finalHtml = finalHtml + scriptTags;
    }

    return finalHtml;
  }, [files, hasHtml]);

  // Handle copying the currently active file's code
  const handleCopyCode = () => {
    const currentCode = files[activeFileIndex]?.content || "";
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle opening the HTML preview in a new browser tab
  const handleFullScreenPreview = () => {
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(previewSrcDoc);
      newWindow.document.close();
    }
  };

  // If no artifact exists in the conversation yet, don't render anything
  if (!currentArtifact) return null;

  return (
    <motion.div
      initial={false}
      // Toggles width between expanded view and the narrow mini-sidebar
      animate={{ width: isOpen ? "45%" : "60px" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full border-l border-purple-500/20 bg-[#0A0214] flex flex-col font-['Orbitron',sans-serif] z-20 overflow-hidden shrink-0 shadow-[-20px_0_50px_-15px_rgba(147,51,234,0.15)] relative"
    >
      {isOpen ? (
        /* =========================================
           EXPANDED ARTIFACT VIEW
           ========================================= */
        <div className="flex flex-col h-full w-full min-w-100">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-[#0F0524] shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <Terminal size={18} className="text-purple-300" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-white tracking-wide truncate max-w-65">
                  {selectedConversation?.title || "Generated Code"}
                </h3>
                <span className="text-[10px] text-purple-400/60 uppercase tracking-widest">
                  Artifact Environment
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Contextual Action Button: Copy Code OR Full Screen */}
              {activeTab === "code" ? (
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-purple-400 hover:text-white hover:bg-purple-500/20 border border-purple-500/20 transition-all mr-1"
                  title="Copy current file"
                >
                  {copied ? (
                    <Check size={14} className="text-green-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              ) : (
                <button
                  onClick={handleFullScreenPreview}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-purple-400 hover:text-white hover:bg-purple-500/20 border border-purple-500/20 transition-all mr-1"
                  title="Open in new tab"
                >
                  <ExternalLink size={14} />
                </button>
              )}

              <div className="flex bg-[#1D0B3B] p-1 rounded-lg border border-purple-500/30">
                <button
                  onClick={() => setActiveTab("code")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === "code" ? "bg-purple-600 text-white shadow-md" : "text-purple-300/60 hover:text-white"}`}
                >
                  <Code size={14} /> Code
                </button>
                {hasHtml && (
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === "preview" ? "bg-purple-600 text-white shadow-md" : "text-purple-300/60 hover:text-white"}`}
                  >
                    <Play size={14} /> Preview
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 ml-2 text-purple-400 hover:text-white hover:bg-purple-500/20 rounded-lg transition-colors"
                title="Collapse Artifact"
              >
                <PanelRightClose size={20} />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#070210] font-sans">
            {activeTab === "code" ? (
              <>
                {/* File Explorer Tabs */}
                <div className="flex overflow-x-auto custom-scrollbar border-b border-purple-500/10 bg-[#0A0214] shrink-0">
                  {files.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveFileIndex(idx)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeFileIndex === idx ? "border-purple-500 text-purple-200 bg-purple-500/5" : "border-transparent text-purple-400/50 hover:text-purple-300 hover:bg-white/5"}`}
                    >
                      <FileCode2
                        size={16}
                        className={
                          activeFileIndex === idx
                            ? "text-purple-400"
                            : "text-purple-400/50"
                        }
                      />
                      {file.name}
                    </button>
                  ))}
                </div>

                {/* Monaco Editor */}
                <div className="flex-1 w-full pt-4 min-h-0">
                  <Editor
                    height="100%"
                    language={getLanguageFromFileName(
                      files[activeFileIndex]?.name,
                    )}
                    theme="vs-dark"
                    value={files[activeFileIndex]?.content || ""}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      padding: { top: 16, bottom: 16 },
                      scrollBeyondLastLine: false,
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    }}
                  />
                </div>
              </>
            ) : (
              /* HTML Preview Iframe */
              <div className="flex-1 w-full bg-white p-2 min-h-0">
                <iframe
                  title="artifact-preview"
                  srcDoc={previewSrcDoc}
                  className="w-full h-full border-0 rounded-lg shadow-inner bg-white"
                  sandbox="allow-scripts allow-modals"
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* =========================================
           COLLAPSED MINI-SIDEBAR VIEW
           ========================================= */
        <div className="flex flex-col items-center w-full h-full py-4 bg-[#0F0524]">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 text-purple-400 hover:text-white hover:bg-purple-500/20 rounded-lg transition-colors"
            title="Expand Artifact"
          >
            <PanelRightOpen size={20} />
          </button>

          {/* Rotated text identifying the collapsed artifact */}
          <div className="mt-8 flex flex-col items-center gap-4 text-purple-400/50">
            <Code size={18} />
            <span
              className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
              }}
            >
              {selectedConversation.title || "Generated Code"}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
