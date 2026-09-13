import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, MessageSquareText, Menu } from "lucide-react";
import MessageList from "./MessageList";
import { setMessages, addMessage } from "../redux/slices/messageSlice";
import {
  addConversation,
  setSelectedConversation,
  updateConversationTitle,
} from "../redux/slices/conversationSlice";
import { setUserData } from "../redux/slices/userSlice";
import { getAllMessages } from "../features/getAllMessages";
import { createConversation } from "../features/createConversation";
import { sendMessage } from "../features/sendMessage";
import { updateConversationTitle as updateConversationTitleApi } from "../features/updateConversationTitle";
import { generateTitleApi } from "../features/generateTitle";
import { getCurrentUser } from "../features/getCurrentUser";
import ChatInput from "./ChatInput";

export default function ChatArea({ onOpenSidebar }) {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { messages } = useSelector((state) => state.message);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const [isProcessing, setIsProcessing] = useState(false);
  const isAutoCreatingRef = useRef(false);
  const greetings = {
    morning: [
      "Good Morning",
      "Rise and grind",
      "Welcome back",
      "Morning, champ",
      "Early bird energy",
      "Fresh start",
      "Ready for a fresh start?",
      "Time to crush it!",
      "Let's make today count!",
      "Another day to shine!",
      "Starting strong today!",
    ],
    afternoon: [
      "Good Afternoon",
      "Welcome back",
      "Midday check-in",
      "Still grinding, huh?",
      "Halfway through the day",
      "Afternoon energy",
      "Second half, same intensity!",
    ],
    evening: [
      "Good Evening",
      "Welcome back",
      "Evening grind mode",
      "Wrapping up the day?",
      "Night owl activated",
      "One more session?",
      "Evening energy",
      "Day's winding down, but the work continues!",
      "Evening mode activated!",
      "Night work in progress!",
      "Evening vibes, full productivity!",
      "Night work mode activated!",
    ],
  };

  const getTimeBucket = (hour) =>
    hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const hour = new Date().getHours();
  const bucket = getTimeBucket(hour);
  const greeting = useMemo(
    () =>
      greetings[bucket][Math.floor(Math.random() * greetings[bucket].length)],
    [bucket],
  );
  const firstName = userData?.name?.split(" ")[0] || "User";
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) {
        dispatch(setMessages([]));
        return;
      }
      if (isAutoCreatingRef.current) return;

      const data = await getAllMessages(selectedConversation._id);
      if (data) {
        dispatch(setMessages(data));
      }
    };
    fetchMessages();
  }, [selectedConversation, dispatch]);

  const handleSendMessage = async (payload) => {
    setIsProcessing(true);

    let safeFile = payload.attachment;
    if (safeFile && !selectedConversation?._id) {
      try {
        const buffer = await safeFile.arrayBuffer();
        safeFile = new File([buffer], safeFile.name, { type: safeFile.type });
      } catch (error) {
        console.error("Failed to memory-clone file:", error);
      }
    }

    let activeConvoId = selectedConversation?._id;

    const uiAttachment = safeFile
      ? {
          name: safeFile.name,
          type: safeFile.type,
          url: safeFile.type.startsWith("image/")
            ? URL.createObjectURL(safeFile)
            : null,
        }
      : null;

    if (!activeConvoId) {
      isAutoCreatingRef.current = true;

      const newChat = await createConversation();
      if (newChat) {
        activeConvoId = newChat._id;

        const tempUserMsg = {
          _id: Date.now().toString(),
          content: payload.text,
          role: "user",
          createdAt: new Date().toISOString(),
          attachment: uiAttachment,
        };

        dispatch(setMessages([tempUserMsg]));
        dispatch(addConversation(newChat));
        dispatch(setSelectedConversation(newChat));
      } else {
        isAutoCreatingRef.current = false;
        setIsProcessing(false);
        return;
      }
    } else {
      const tempUserMsg = {
        _id: Date.now().toString(),
        content: payload.text,
        role: "user",
        createdAt: new Date().toISOString(),
        attachment: uiAttachment,
      };
      dispatch(addMessage(tempUserMsg));
    }

    try {
      // Inside handleSendMessage around line 98
      const response = await sendMessage({
        prompt: payload.text,
        conversationId: activeConvoId,
        agent: payload.agent,
        file: safeFile,
        plan: userData?.plan || "free", // Include this new line
      });

      dispatch(
        addMessage({
          _id: (Date.now() + 1).toString(),
          content: response.response,
          images: response.searchImages || [],
          artifacts: response.artifacts || [],
          role: "assistant",
          createdAt: new Date().toISOString(),
        }),
      );

      const updatedUser = await getCurrentUser();
      if (updatedUser) {
        dispatch(setUserData(updatedUser));
      }

      if (messages.length === 0) {
        generateTitleApi(payload.text, response.response)
          .then((generatedTitle) => {
            if (generatedTitle) {
              updateConversationTitleApi(activeConvoId, generatedTitle);
              dispatch(
                updateConversationTitle({
                  id: activeConvoId,
                  title: generatedTitle,
                }),
              );
            }
          })
          .catch((err) => console.error("Auto-rename failed:", err));
      }
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsProcessing(false);
      isAutoCreatingRef.current = false;
    }
  };

  return (
    <div
      className={`flex flex-col h-full w-full relative z-10 font-['Orbitron',sans-serif] transition-colors duration-500 ${isDarkMode ? "bg-linear-to-br from-[#110624] to-[#070210]" : "bg-linear-to-br from-purple-50 to-white"}`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .font-dm { font-family: 'DM Sans', sans-serif; }
        
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
            height: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${isDarkMode ? "rgba(147, 51, 234, 0.2)" : "rgba(147, 51, 234, 0.3)"};
            border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
            background: ${isDarkMode ? "rgba(147, 51, 234, 0.5)" : "rgba(147, 51, 234, 0.6)"};
        }
      `,
        }}
      />

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-0 right-0 w-125 h-125 blur-[150px] rounded-full ${isDarkMode ? "bg-purple-600/5" : "bg-purple-400/10"}`}
        />
        <div
          className={`absolute bottom-0 left-0 w-125 h-125 blur-[150px] rounded-full ${isDarkMode ? "bg-fuchsia-600/5" : "bg-fuchsia-400/10"}`}
        />
      </div>

      <AnimatePresence mode="wait">
        {selectedConversation ? (
          <motion.div
            key="active-chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full relative z-10"
          >
            <div
              className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b backdrop-blur-md ${isDarkMode ? "border-purple-500/20 bg-[#070210]/50" : "border-purple-200 bg-white/50"}`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenSidebar}
                  className={`md:hidden p-2 rounded-lg ${isDarkMode ? "text-purple-400 hover:bg-purple-500/20" : "text-purple-600 hover:bg-purple-200"}`}
                >
                  <Menu size={20} />
                </button>
                <div
                  className={`p-2 rounded-lg border hidden sm:block ${isDarkMode ? "bg-purple-500/10 border-purple-500/20" : "bg-purple-100 border-purple-300"}`}
                >
                  <MessageSquareText
                    size={18}
                    className={
                      isDarkMode ? "text-purple-300" : "text-purple-700"
                    }
                  />
                </div>
                <div>
                  <h3
                    className={`text-sm font-semibold tracking-wide ${isDarkMode ? "text-white" : "text-purple-950"}`}
                  >
                    {selectedConversation.title || "Conversation"}
                  </h3>
                  <p
                    className={`text-[10px] tracking-widest uppercase mt-0.5 ${isDarkMode ? "text-purple-400/60" : "text-purple-600/70"}`}
                  >
                    {messages.length} Messages
                  </p>
                </div>
              </div>
            </div>

            <MessageList
              messages={messages}
              isProcessing={isProcessing}
              userData={userData}
              onSuggestionClick={(promptText) =>
                handleSendMessage({
                  text: promptText,
                  attachment: null,
                  agent: "auto",
                })
              }
            />

            <div
              className={`p-2 sm:p-4 bg-linear-to-t ${isDarkMode ? "from-[#070210]" : "from-white"} to-transparent`}
            >
              <ChatInput
                onSendMessage={handleSendMessage}
                isProcessing={isProcessing}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col h-full relative z-10 px-4 sm:px-6 w-full"
          >
            <div className="absolute top-4 left-4 md:hidden z-50">
              <button
                onClick={onOpenSidebar}
                className={`p-2 rounded-lg backdrop-blur-md ${isDarkMode ? "text-purple-400 hover:bg-purple-500/20" : "text-purple-600 hover:bg-purple-200"}`}
              >
                <Menu size={24} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto w-full pb-4">
              <div className="flex flex-col items-center mb-8 text-center">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0px 0px 20px rgba(168,85,247,0.2)",
                      "0px 0px 60px rgba(168,85,247,0.6)",
                      "0px 0px 20px rgba(168,85,247,0.2)",
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center border mb-8 ${isDarkMode ? "bg-linear-to-br from-purple-600 to-fuchsia-600 border-purple-400/50" : "bg-linear-to-br from-purple-500 to-fuchsia-500 border-purple-300"}`}
                >
                  <BrainCircuit
                    size={40}
                    className="text-white drop-shadow-md"
                  />
                </motion.div>
                <h1
                  className={`text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r tracking-wide leading-[1.3] pb-2 ${isDarkMode ? "from-purple-200 via-white to-purple-200" : "from-purple-900 via-purple-700 to-purple-900"}`}
                >
                  {greeting}, {firstName}
                </h1>
                <p
                  className={`mt-4 text-xs sm:text-sm tracking-widest uppercase ${isDarkMode ? "text-purple-300/50" : "text-purple-600/60"}`}
                >
                  How can CortexAI assist you today?
                </p>
              </div>
            </div>

            <div className="w-full max-w-3xl mx-auto pb-4 shrink-0">
              <ChatInput
                onSendMessage={handleSendMessage}
                isProcessing={isProcessing}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
