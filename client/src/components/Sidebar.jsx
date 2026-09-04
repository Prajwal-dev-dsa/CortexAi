import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Trash2,
  User,
  Coins,
  LogOut,
  BrainCircuit,
} from "lucide-react";

import {
  setConversations,
  addConversation,
  removeConversation,
  setSelectedConversation,
} from "../redux/slices/conversationSlice";
import { setUserData, clearUserData } from "../redux/slices/userSlice";
import DeleteModal from "./DeleteModal";
import { createConversation } from "../features/createConversation";
import { getConversations } from "../features/getConversations";
import { deleteConversation } from "../features/deleteConversation";
import { getCurrentUser } from "../features/getCurrentUser";
import { logOut } from "../features/logout";

export default function Sidebar({ onLogoutSuccess }) {
  const dispatch = useDispatch();
  const { conversations, selectedConversation } = useSelector(
    (state) => state.conversation,
  );
  const { userData } = useSelector((state) => state.user);
  console.log(userData);
  const [isExpanded, setIsExpanded] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  // Initial Data Fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      const [userRes, convRes] = await Promise.all([
        getCurrentUser(),
        getConversations(),
      ]);
      if (userRes) dispatch(setUserData(userRes));
      if (convRes) dispatch(setConversations(convRes));
    };
    fetchInitialData();
  }, [dispatch]);

  const handleNewChat = async () => {
    const newChat = await createConversation();
    if (newChat) {
      dispatch(addConversation(newChat));
      dispatch(setSelectedConversation(newChat));
    }
  };

  const confirmDelete = async () => {
    if (!chatToDelete) return;
    const res = await deleteConversation(chatToDelete);
    if (res) {
      dispatch(removeConversation(chatToDelete));
    }
    setDeleteModalOpen(false);
    setChatToDelete(null);
  };

  const handleLogout = async () => {
    await logOut();
    dispatch(clearUserData());
    if (onLogoutSuccess) onLogoutSuccess();
  };

  return (
    <>
      <motion.div
        initial={false}
        animate={{ width: isExpanded ? 280 : 72 }}
        className="h-screen bg-linear-to-b from-[#1A0B2E] to-[#070210] border-r border-purple-500/20 flex flex-col font-['Orbitron',sans-serif] relative overflow-hidden"
      >
        {/* Header & Toggle */}
        <div className="flex items-center p-4 h-16">
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 text-white font-bold text-lg tracking-wider"
              >
                <div className="bg-purple-600/30 p-1 rounded-md border border-purple-500/50">
                  <BrainCircuit size={18} className="text-purple-300" />
                </div>
                CortexAI
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notice `ml-auto` pushes the button to the absolute right side */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-auto p-2 text-purple-400 hover:text-white hover:bg-purple-500/20 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <PanelLeftClose size={20} />
            ) : (
              <PanelLeft size={20} />
            )}
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-3 mb-4">
          <button
            onClick={handleNewChat}
            className={`flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(147,51,234,0.5)] ${isExpanded ? "px-4" : "px-0"}`}
          >
            <Plus size={20} />
            {isExpanded && (
              <span className="font-semibold text-sm tracking-wide">
                New Chat
              </span>
            )}
          </button>
        </div>

        {/* Recents List */}
        {isExpanded && (
          <div className="px-4 py-2 text-xs font-semibold text-purple-400/60 uppercase tracking-widest">
            Recents
          </div>
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 space-y-1 custom-scrollbar">
          <AnimatePresence>
            {conversations.map((chat) => (
              <motion.div
                key={chat._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => dispatch(setSelectedConversation(chat))}
                className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedConversation?._id === chat._id ? "bg-purple-600/30 text-white" : "text-purple-200/70 hover:bg-purple-500/10 hover:text-white"}`}
              >
                <MessageSquare size={18} className="shrink-0" />
                {isExpanded && (
                  <>
                    <span className="truncate flex-1 text-sm">
                      {chat.title || "New Chat"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatToDelete(chat._id);
                        setDeleteModalOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-500/20 rounded-md transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer / Profile Section */}
        <div className="p-3 border-t border-purple-500/20 bg-[#0F0524]">
          <div
            className={`flex items-center p-2 rounded-xl bg-purple-900/20 border border-purple-500/20 ${!isExpanded && "justify-center"}`}
          >
            {userData?.avatar ? (
              <img
                src={userData.avatar}
                alt="Profile"
                className="w-10 h-10 rounded-full border border-purple-500/40 object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-700/50 flex items-center justify-center border border-purple-500/40 shrink-0">
                <User size={20} className="text-purple-200" />
              </div>
            )}

            {isExpanded && (
              <div className="ml-3 flex-1 overflow-hidden">
                <div className="text-sm font-semibold text-white truncate">
                  {userData?.name || "User"}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-purple-200 bg-purple-600/40 px-2 py-0.5 rounded-full border border-purple-500/40 uppercase tracking-wider">
                    Free
                  </span>
                  <Coins size={12} className="text-yellow-500" />
                </div>
              </div>
            )}

            {isExpanded && (
              <button
                onClick={handleLogout}
                className="p-2 text-purple-400 hover:text-white hover:bg-purple-500/20 rounded-lg transition-colors ml-2"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
