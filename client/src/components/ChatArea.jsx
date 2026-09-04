import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, MessageSquareText } from "lucide-react";
import MessageList from "./MessageList";
import { setMessages, addMessage } from "../redux/slices/messageSlice";
import {
  addConversation,
  setSelectedConversation,
} from "../redux/slices/conversationSlice";
import ChatInput from "./chatInput";
import { getAllMessages } from "../features/getAllMessages";
import { createConversation } from "../features/createConversation";
import { sendMessage } from "../features/sendMessage";

export default function ChatArea() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { messages } = useSelector((state) => state.message);

  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Add a useRef to track when we are creating a new chat from the default screen
  const isAutoCreatingRef = useRef(false);

  // Calculate Greeting based on time
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const firstName = userData?.name?.split(" ")[0] || "User";

  // Fetch messages when conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) {
        dispatch(setMessages([]));
        return;
      }

      // 2. Prevent the fetch if we just auto-created a chat,
      // so we don't accidentally overwrite our optimistic user message with an empty database array!
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
    let activeConvoId = selectedConversation?._id;

    // Auto-create conversation if none is selected (Empty State behavior)
    if (!activeConvoId) {
      isAutoCreatingRef.current = true; // Turn the flag ON

      const newChat = await createConversation();
      if (newChat) {
        activeConvoId = newChat._id;

        // Optimistically create the user message
        const tempUserMsg = {
          _id: Date.now().toString(),
          content: payload.text,
          role: "user",
          createdAt: new Date().toISOString(),
        };

        // Set this as the ONLY message in the UI to start, preventing flashing
        dispatch(setMessages([tempUserMsg]));
        dispatch(addConversation(newChat));
        dispatch(setSelectedConversation(newChat));
      } else {
        isAutoCreatingRef.current = false;
        setIsProcessing(false);
        return; // Failed to create
      }
    } else {
      // If the chat already existed, just add the user message normally
      const tempUserMsg = {
        _id: Date.now().toString(),
        content: payload.text,
        role: "user",
        createdAt: new Date().toISOString(),
      };
      dispatch(addMessage(tempUserMsg));
    }

    try {
      // Call Agent API
      const responseText = await sendMessage({
        prompt: payload.text,
        conversationId: activeConvoId,
      });

      // Add Assistant response to UI
      dispatch(
        addMessage({
          _id: (Date.now() + 1).toString(),
          content: responseText,
          role: "assistant",
          createdAt: new Date().toISOString(),
        }),
      );
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsProcessing(false);
      isAutoCreatingRef.current = false; // Turn the flag OFF when completely done
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative z-10 bg-linear-to-br from-[#110624] to-[#070210] font-['Orbitron',sans-serif]">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-125 h-125 bg-purple-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-125 h-125 bg-fuchsia-600/5 blur-[150px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {selectedConversation ? (
          /* =========================================
                       ACTIVE CHAT VIEW
                       ========================================= */
          <motion.div
            key="active-chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full relative z-10"
          >
            {/* Navbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-[#070210]/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
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

            {/* Messages Area */}
            <MessageList
              messages={messages}
              isProcessing={isProcessing}
              userData={userData}
            />

            {/* Input Area */}
            <div className="p-4 bg-linear-to-t from-[#070210] to-transparent">
              <ChatInput
                onSendMessage={handleSendMessage}
                isProcessing={isProcessing}
              />
            </div>
          </motion.div>
        ) : (
          /* =========================================
                       DEFAULT / EMPTY STATE (Welcome Screen)
                       ========================================= */
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center h-full relative z-10 px-6"
          >
            <div className="flex flex-col items-center mb-12">
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
                <BrainCircuit size={40} className="text-white drop-shadow-md" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-200 via-white to-purple-200 tracking-wide text-center">
                {greeting}, {firstName}
              </h1>
              <p className="text-purple-300/50 mt-4 text-sm tracking-widest uppercase">
                How can CortexAI assist you today?
              </p>
            </div>

            {/* Centered Input Box for Empty State */}
            <div className="w-full max-w-3xl transform -translate-y-4">
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
