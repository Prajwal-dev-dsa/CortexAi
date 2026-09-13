import { useState, useEffect, useRef } from "react";
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

  const [isProcessing, setIsProcessing] = useState(false);
  const isAutoCreatingRef = useRef(false);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
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
      const response = await sendMessage({
        prompt: payload.text,
        conversationId: activeConvoId,
        agent: payload.agent,
        file: safeFile,
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
    <div className="flex flex-col h-full w-full relative z-10 bg-linear-to-br from-[#110624] to-[#070210] font-['Orbitron',sans-serif]">
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
            background: rgba(147, 51, 234, 0.2);
            border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
            background: rgba(147, 51, 234, 0.5);
        }
      `,
        }}
      />

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-125 h-125 bg-purple-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-125 h-125 bg-fuchsia-600/5 blur-[150px] rounded-full" />
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
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-purple-500/20 bg-[#070210]/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenSidebar}
                  className="md:hidden p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg"
                >
                  <Menu size={20} />
                </button>
                <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 hidden sm:block">
                  <MessageSquareText size={18} className="text-purple-300" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-wide">
                    {selectedConversation.title || "Conversation"}
                  </h3>
                  <p className="text-[10px] text-purple-400/60 tracking-widest uppercase mt-0.5">
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

            <div className="p-2 sm:p-4 bg-linear-to-t from-[#070210] to-transparent">
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
                className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg backdrop-blur-md"
              >
                <Menu size={24} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto w-full pb-4">
              {/* FIXED: Removed mt-auto so it perfectly centers vertically */}
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
                  className="w-20 h-20 rounded-full bg-linear-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center border border-purple-400/50 mb-8"
                >
                  <BrainCircuit
                    size={40}
                    className="text-white drop-shadow-md"
                  />
                </motion.div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-200 via-white to-purple-200 tracking-wide">
                  {greeting}, {firstName}
                </h1>
                <p className="text-purple-300/50 mt-4 text-xs sm:text-sm tracking-widest uppercase">
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
