import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Mic, X, Image as ImageIcon } from "lucide-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export default function ChatInput({ onSendMessage, isProcessing }) {
  // Tracks finalized text (typed manually or committed from the mic)
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState(null);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null); // Reference to forcefully focus the input

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // The visual preview combines finalized text with the live spoken transcript
  const displayValue =
    listening && transcript ? `${text} ${transcript}`.trim() : text;

  // 1. The Kill-Switch: Clicking the text area instantly stops the mic and locks in the text
  const handleInputClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();

      // Safely commit the text if anything was spoken
      if (transcript) {
        setText(displayValue);
        resetTranscript();
      }

      // Force the cursor to appear after React updates the readOnly state
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  // 2. Safely toggle the microphone button
  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      // Commit the text manually when the button is clicked to stop
      if (transcript) {
        setText(displayValue);
        resetTranscript();
      }
    } else {
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  // 3. Fallback: If the browser naturally times out the mic, commit the text
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
      setAttachment({ file, previewUrl, name: file.name });
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

    // Shut down the mic completely during sending
    if (listening) {
      SpeechRecognition.stopListening();
      resetTranscript();
    }

    onSendMessage({
      text: finalMessage,
      attachment: attachment?.file || null,
    });

    // Reset everything for a fresh start
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
      {/* Attachment Preview Pop-up */}
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
                <ImageIcon className="text-purple-300 w-6 h-6" />
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

      {/* Main Input Box */}
      <div className="relative flex items-end gap-2 bg-[#110624]/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-2 shadow-[0_0_30px_-10px_rgba(147,51,234,0.3)] transition-all focus-within:border-purple-400/60 focus-within:shadow-[0_0_30px_-5px_rgba(147,51,234,0.5)]">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-purple-400 hover:text-purple-200 hover:bg-purple-500/20 rounded-xl transition-colors shrink-0"
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
            listening ? "Listening... (Click to type)" : "Message CortexAI..."
          }
          className={`flex-1 bg-transparent text-white placeholder-purple-300/40 resize-none outline-none py-3 px-2 max-h-32 custom-scrollbar text-sm font-sans tracking-wide ${listening ? "cursor-default opacity-80" : "cursor-text opacity-100"}`}
          rows={1}
          style={{ minHeight: "44px" }}
        />

        <div className="flex items-center gap-1 shrink-0 pb-1 pr-1">
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
  );
}
