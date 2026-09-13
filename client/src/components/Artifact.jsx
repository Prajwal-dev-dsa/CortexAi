import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
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
  ChevronDown,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { getLanguageFromFileName } from "../../utils/fileUtils";

export default function Artifact() {
  const selectedConversation = useSelector(
    (state) => state.conversation.selectedConversation,
  );
  const { messages } = useSelector((state) => state.message);
  // Fetch theme state
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("code");
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentArtifact = useMemo(() => {
    const latestMsg = [...messages]
      .reverse()
      .find((m) => m.artifacts && m.artifacts.length > 0);
    return latestMsg?.artifacts?.[0] || null;
  }, [messages]);

  useEffect(() => {
    if (currentArtifact) {
      setIsOpen(true);
      setActiveFileIndex(0);
      setActiveTab("code");
    }
  }, [currentArtifact]);

  const files = currentArtifact?.files || [];
  const hasHtml = files.some((f) => f.name.endsWith(".html"));

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

  const handleCopyCode = () => {
    const currentCode = files[activeFileIndex]?.content || "";
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFullScreenPreview = () => {
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(previewSrcDoc);
      newWindow.document.close();
    }
  };

  if (!currentArtifact) return null;

  return (
    <div
      className={`font-['Orbitron',sans-serif] z-50 shrink-0 transition-colors duration-500 overflow-hidden shadow-[-20px_0_50px_-15px_rgba(147,51,234,0.15)] ${
        isOpen
          ? `fixed inset-0 w-full h-full flex flex-col md:relative md:w-[45%] md:border-l ${isDarkMode ? "bg-[#0A0214] md:border-purple-500/20" : "bg-purple-50 md:border-purple-200"}`
          : `fixed bottom-40 right-4 w-14 h-14 rounded-full shadow-[0_0_20px_rgba(147,51,234,0.4)] flex md:w-15 md:h-full md:relative md:bottom-auto md:right-auto md:rounded-none md:flex-col md:border-l ${isDarkMode ? "bg-purple-600 md:bg-[#0A0214] md:border-purple-500/20" : "bg-purple-500 md:bg-purple-50 md:border-purple-200"}`
      }`}
    >
      {isOpen ? (
        <div className="flex flex-col h-full w-full min-w-25">
          <div
            className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b shrink-0 transition-colors duration-500 ${isDarkMode ? "border-purple-500/20 bg-[#0F0524]" : "border-purple-200 bg-white"}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg border hidden sm:block ${isDarkMode ? "bg-purple-500/10 border-purple-500/30" : "bg-purple-100 border-purple-200"}`}
              >
                <Terminal
                  size={18}
                  className={isDarkMode ? "text-purple-300" : "text-purple-600"}
                />
              </div>
              <div className="flex flex-col">
                <h3
                  className={`text-sm font-bold tracking-wide truncate max-w-37.5 sm:max-w-50 ${isDarkMode ? "text-white" : "text-purple-950"}`}
                >
                  {selectedConversation?.title || "Generated Code"}
                </h3>
                <span
                  className={`text-[10px] uppercase tracking-widest ${isDarkMode ? "text-purple-400/60" : "text-purple-500"}`}
                >
                  Artifact
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {activeTab === "code" ? (
                <button
                  onClick={handleCopyCode}
                  className={`items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all mr-1 ${isDarkMode ? "text-purple-400 hover:text-white hover:bg-purple-500/20 border-purple-500/20" : "text-purple-600 hover:text-purple-950 hover:bg-purple-100 border-purple-200"}`}
                  title="Copy current file"
                >
                  {copied ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              ) : (
                <button
                  onClick={handleFullScreenPreview}
                  className={`items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all mr-1 ${isDarkMode ? "text-purple-400 hover:text-white hover:bg-purple-500/20 border-purple-500/20" : "text-purple-600 hover:text-purple-950 hover:bg-purple-100 border-purple-200"}`}
                  title="Open in new tab"
                >
                  <ExternalLink size={14} />
                </button>
              )}

              <div
                className={`flex p-1 rounded-lg border ${isDarkMode ? "bg-[#1D0B3B] border-purple-500/30" : "bg-purple-100 border-purple-200"}`}
              >
                <button
                  onClick={() => setActiveTab("code")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === "code" ? "bg-purple-600 text-white shadow-md" : isDarkMode ? "text-purple-300/60 hover:text-white" : "text-purple-700/60 hover:text-purple-950"}`}
                >
                  <Code size={14} />{" "}
                  <span className="hidden sm:inline">Code</span>
                </button>
                {hasHtml && (
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === "preview" ? "bg-purple-600 text-white shadow-md" : isDarkMode ? "text-purple-300/60 hover:text-white" : "text-purple-700/60 hover:text-purple-950"}`}
                  >
                    <Play size={14} />{" "}
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-2 ml-1 sm:ml-2 rounded-lg transition-colors ${isDarkMode ? "text-purple-400 hover:text-white hover:bg-purple-500/20" : "text-purple-600 hover:text-purple-950 hover:bg-purple-200"}`}
                title="Collapse Artifact"
              >
                <PanelRightClose size={20} className="hidden md:block" />
                <ChevronDown size={24} className="md:hidden block" />
              </button>
            </div>
          </div>

          <div
            className={`flex-1 flex flex-col min-h-0 font-sans transition-colors duration-500 ${isDarkMode ? "bg-[#070210]" : "bg-white"}`}
          >
            {activeTab === "code" ? (
              <>
                <div
                  className={`flex overflow-x-auto custom-scrollbar border-b shrink-0 ${isDarkMode ? "border-purple-500/10 bg-[#0A0214]" : "border-purple-100 bg-purple-50"}`}
                >
                  {files.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveFileIndex(idx)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                        activeFileIndex === idx
                          ? isDarkMode
                            ? "border-purple-500 text-purple-200 bg-purple-500/5"
                            : "border-purple-600 text-purple-900 bg-purple-100/50"
                          : isDarkMode
                            ? "border-transparent text-purple-400/50 hover:text-purple-300 hover:bg-white/5"
                            : "border-transparent text-purple-500/70 hover:text-purple-800 hover:bg-purple-100/30"
                      }`}
                    >
                      <FileCode2
                        size={16}
                        className={
                          activeFileIndex === idx
                            ? isDarkMode
                              ? "text-purple-400"
                              : "text-purple-600"
                            : isDarkMode
                              ? "text-purple-400/50"
                              : "text-purple-500/50"
                        }
                      />
                      {file.name}
                    </button>
                  ))}
                </div>

                <div className="flex-1 w-full pt-4 min-h-0">
                  <Editor
                    height="100%"
                    language={getLanguageFromFileName(
                      files[activeFileIndex]?.name,
                    )}
                    theme={isDarkMode ? "vs-dark" : "light"}
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
        <div
          className="flex flex-col items-center justify-center w-full h-full cursor-pointer md:cursor-default md:py-4"
          onClick={() => setIsOpen(true)}
        >
          <div className="md:hidden flex items-center justify-center w-full h-full text-white">
            <Code size={24} />
          </div>

          <div className="hidden md:flex flex-col items-center w-full h-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? "text-purple-400 hover:text-white hover:bg-purple-500/20" : "text-purple-600 hover:text-purple-950 hover:bg-purple-200"}`}
              title="Expand Artifact"
            >
              <PanelRightOpen size={20} />
            </button>

            <div
              className={`mt-8 flex flex-col items-center gap-4 ${isDarkMode ? "text-purple-400/50" : "text-purple-500/70"}`}
            >
              <Code size={18} />
              <span
                className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                }}
              >
                {selectedConversation?.title || "Generated Code"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
