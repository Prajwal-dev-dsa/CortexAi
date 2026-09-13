import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Trash2,
  Edit2,
  User,
  Coins,
  LogOut,
  BrainCircuit,
  X,
} from "lucide-react";

import {
  setConversations,
  addConversation,
  removeConversation,
  updateConversationTitle,
  setSelectedConversation,
} from "../redux/slices/conversationSlice";
import { setUserData, clearUserData } from "../redux/slices/userSlice";

import DeleteModal from "./DeleteModal";
import EditModal from "./EditModal";

import { createConversation } from "../features/createConversation";
import { getConversations } from "../features/getConversations";
import { deleteConversation } from "../features/deleteConversation";
import { updateConversationTitle as updateConversationTitleApi } from "../features/updateConversationTitle";
import { getCurrentUser } from "../features/getCurrentUser";
import { logOut } from "../features/logout";

export default function Sidebar({
  onLogoutSuccess,
  isMobileOpen,
  setIsMobileOpen,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversations, selectedConversation } = useSelector(
    (state) => state.conversation,
  );
  const { userData } = useSelector((state) => state.user);

  const [isExpanded, setIsExpanded] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [chatToEdit, setChatToEdit] = useState(null);

  const showText = isExpanded || isMobileOpen;

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
    navigate("/");
    if (isMobileOpen) setIsMobileOpen(false);
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

  const confirmEdit = async (newTitle) => {
    if (!chatToEdit) return;
    dispatch(updateConversationTitle({ id: chatToEdit._id, title: newTitle }));
    await updateConversationTitleApi(chatToEdit._id, newTitle);
    setEditModalOpen(false);
    setChatToEdit(null);
  };

  const handleLogout = async () => {
    await logOut();
    dispatch(clearUserData());
    if (onLogoutSuccess) onLogoutSuccess();
  };

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{ width: isExpanded ? 280 : 72 }}
        className={`fixed md:relative inset-y-0 left-0 z-50 h-full bg-linear-to-b from-[#1A0B2E] to-[#070210] border-r border-purple-500/20 flex flex-col font-['Orbitron',sans-serif] transition-transform duration-300 md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center p-4 h-16">
          <AnimatePresence mode="wait">
            {showText && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 text-white font-bold text-lg tracking-wider cursor-pointer"
                onClick={() => {
                  navigate("/");
                  setIsMobileOpen(false);
                }}
              >
                <div className="bg-purple-600/30 p-1 rounded-md border border-purple-500/50">
                  <BrainCircuit size={18} className="text-purple-300" />
                </div>
                CortexAI
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden ml-auto p-2 text-purple-400 hover:text-white hover:bg-purple-500/20 rounded-lg transition-colors shrink-0"
          >
            <X size={20} />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden md:block ml-auto p-2 text-purple-400 hover:text-white hover:bg-purple-500/20 rounded-lg transition-colors shrink-0"
          >
            {isExpanded ? (
              <PanelLeftClose size={20} />
            ) : (
              <PanelLeft size={20} />
            )}
          </button>
        </div>

        <div className="px-3 mb-4">
          <button
            onClick={handleNewChat}
            className={`flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(147,51,234,0.5)] ${showText ? "px-4" : "px-0"}`}
          >
            <Plus size={20} />
            {showText && (
              <span className="font-semibold text-sm tracking-wide shrink-0">
                New Chat
              </span>
            )}
          </button>
        </div>

        {showText && (
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
                onClick={() => {
                  navigate("/");
                  dispatch(setSelectedConversation(chat));
                  setIsMobileOpen(false);
                }}
                className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedConversation?._id === chat._id ? "bg-purple-600/30 text-white" : "text-purple-200/70 hover:bg-purple-500/10 hover:text-white"}`}
              >
                <MessageSquare size={18} className="shrink-0" />
                {showText && (
                  <>
                    <span className="truncate flex-1 text-sm">
                      {chat.title || "New Chat"}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-all">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setChatToEdit(chat);
                          setEditModalOpen(true);
                        }}
                        className="p-1.5 text-purple-300 hover:text-white hover:bg-purple-500/40 rounded-md transition-all shrink-0"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setChatToDelete(chat._id);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md transition-all shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div
          className={`border-t border-purple-500/20 bg-[#0A0214] z-20 transition-all duration-300 ${showText ? "p-4" : "p-2 py-4"}`}
        >
          <div
            className={`flex flex-col rounded-2xl bg-linear-to-b from-[#1D0B3B] to-[#0F0524] border border-purple-500/30 shadow-[0_0_20px_-10px_rgba(147,51,234,0.3)] transition-all ${showText ? "p-3 gap-3" : "p-1.5 gap-2 items-center"}`}
          >
            <div
              className={`flex items-center ${showText ? "w-full" : "justify-center"}`}
            >
              <div className="relative shrink-0">
                {userData?.avatar ? (
                  <img
                    src={userData.avatar}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border border-purple-500/40 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-purple-700/50 flex items-center justify-center border border-purple-500/40">
                    <User size={20} className="text-purple-200" />
                  </div>
                )}
              </div>

              {showText && (
                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="text-sm font-bold text-white truncate tracking-wide">
                    {userData?.name || "User"}
                  </div>
                  <div className="text-[10px] text-purple-300/60 truncate font-sans">
                    {userData?.email || "Welcome back"}
                  </div>
                </div>
              )}

              {showText && (
                <button
                  onClick={handleLogout}
                  className="p-2 text-purple-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors shrink-0 ml-2"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              )}
            </div>

            {showText && (
              <button
                onClick={() => {
                  navigate("/billing");
                  setIsMobileOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 bg-black/20 hover:bg-black/40 border border-purple-500/20 rounded-xl transition-all duration-300 group shadow-inner mt-1"
              >
                <span className="bg-purple-600 text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-md tracking-wider shadow-md">
                  {userData?.plan || "Free"}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Coins
                    size={16}
                    className="text-yellow-400 group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
                  />
                  <span className="text-sm font-extrabold text-yellow-400 tracking-wide">
                    {userData?.credits || 0}
                  </span>
                </div>
              </button>
            )}

            {!showText && (
              <>
                <button
                  onClick={() => {
                    navigate("/billing");
                    setIsMobileOpen(false);
                  }}
                  className="flex items-center justify-center w-10 h-10 bg-purple-900/40 rounded-lg border border-purple-500/30 hover:bg-purple-600/40 transition-colors shrink-0"
                  title="View Billing Plans"
                >
                  <Coins size={18} className="text-yellow-400" />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-10 h-10 text-purple-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors shrink-0"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />

      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onConfirm={confirmEdit}
        currentTitle={chatToEdit?.title}
      />
    </>
  );
}
