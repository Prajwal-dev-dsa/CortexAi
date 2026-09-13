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
  Sun,
  Moon,
} from "lucide-react";

import {
  setConversations,
  addConversation,
  removeConversation,
  updateConversationTitle,
  setSelectedConversation,
} from "../redux/slices/conversationSlice";
import { setUserData, clearUserData } from "../redux/slices/userSlice";
import { toggleTheme } from "../redux/slices/themeSlice";

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
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem("cortex_sidebar_expanded");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [chatToEdit, setChatToEdit] = useState(null);

  const showText = isExpanded || isMobileOpen;

  useEffect(() => {
    localStorage.setItem("cortex_sidebar_expanded", JSON.stringify(isExpanded));
  }, [isExpanded]);

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
        className={`fixed md:relative inset-y-0 left-0 z-50 h-full border-r flex flex-col font-['Orbitron',sans-serif] transition-all duration-300 md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${isDarkMode ? "bg-linear-to-b from-[#1A0B2E] to-[#070210] border-purple-500/20" : "bg-linear-to-b from-purple-100 to-purple-50 border-purple-200"}`}
      >
        <div className="flex items-center p-4 h-16">
          <AnimatePresence mode="wait">
            {showText && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={`flex items-center gap-2 font-bold text-lg tracking-wider cursor-pointer ${isDarkMode ? "text-white" : "text-purple-950"}`}
                onClick={() => {
                  navigate("/");
                  setIsMobileOpen(false);
                }}
              >
                <div
                  className={`p-1 rounded-md border ${isDarkMode ? "bg-purple-600/30 border-purple-500/50" : "bg-purple-200 border-purple-300"}`}
                >
                  <BrainCircuit
                    size={18}
                    className={
                      isDarkMode ? "text-purple-300" : "text-purple-700"
                    }
                  />
                </div>
                CortexAI
              </motion.div>
            )}
          </AnimatePresence>

          <div className="ml-auto flex items-center gap-1 sm:gap-2 shrink-0">
            {showText && (
              <button
                onClick={() => dispatch(toggleTheme())}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? "text-purple-400 hover:text-white hover:bg-purple-500/20" : "text-purple-600 hover:text-purple-950 hover:bg-purple-200"}`}
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}

            <button
              onClick={() => setIsMobileOpen(false)}
              className={`md:hidden p-2 rounded-lg transition-colors ${isDarkMode ? "text-purple-400 hover:text-white hover:bg-purple-500/20" : "text-purple-600 hover:text-purple-950 hover:bg-purple-200"}`}
            >
              <X size={20} />
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`hidden md:block p-2 rounded-lg transition-colors ${isDarkMode ? "text-purple-400 hover:text-white hover:bg-purple-500/20" : "text-purple-600 hover:text-purple-950 hover:bg-purple-200"}`}
            >
              {isExpanded ? (
                <PanelLeftClose size={20} />
              ) : (
                <PanelLeft size={20} />
              )}
            </button>
          </div>
        </div>

        <div className="px-3 mb-4">
          <button
            onClick={handleNewChat}
            className={`flex items-center justify-center gap-2 w-full text-white py-3 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(147,51,234,0.5)] ${showText ? "px-4" : "px-0"} ${isDarkMode ? "bg-purple-600 hover:bg-purple-500" : "bg-purple-600 hover:bg-purple-700"}`}
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
          <div
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest ${isDarkMode ? "text-purple-400/60" : "text-purple-600/70"}`}
          >
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
                className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  selectedConversation?._id === chat._id
                    ? isDarkMode
                      ? "bg-purple-600/30 text-white"
                      : "bg-purple-200 text-purple-950"
                    : isDarkMode
                      ? "text-purple-200/70 hover:bg-purple-500/10 hover:text-white"
                      : "text-purple-800/80 hover:bg-purple-200/50 hover:text-purple-950"
                }`}
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
                        className={`p-1.5 rounded-md transition-all shrink-0 ${isDarkMode ? "text-purple-300 hover:text-white hover:bg-purple-500/40" : "text-purple-600 hover:text-purple-950 hover:bg-purple-300"}`}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setChatToDelete(chat._id);
                          setDeleteModalOpen(true);
                        }}
                        className={`p-1.5 rounded-md transition-all shrink-0 ${isDarkMode ? "text-red-400 hover:bg-red-500/20" : "text-red-500 hover:bg-red-200"}`}
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
          className={`border-t z-20 transition-all duration-300 ${showText ? "p-4" : "p-2 py-4"} ${isDarkMode ? "border-purple-500/20 bg-[#0A0214]" : "border-purple-200 bg-purple-50"}`}
        >
          <div
            className={`flex flex-col rounded-2xl border transition-all ${showText ? "p-3 gap-3" : "p-1.5 gap-2 items-center"} ${isDarkMode ? "bg-linear-to-b from-[#1D0B3B] to-[#0F0524] border-purple-500/30 shadow-[0_0_20px_-10px_rgba(147,51,234,0.3)]" : "bg-white border-purple-200 shadow-sm"}`}
          >
            <div
              className={`flex items-center ${showText ? "w-full" : "justify-center"}`}
            >
              <div className="relative shrink-0">
                {userData?.avatar ? (
                  <img
                    src={userData.avatar}
                    alt="Profile"
                    className={`w-10 h-10 rounded-full border object-cover ${isDarkMode ? "border-purple-500/40" : "border-purple-300"}`}
                  />
                ) : (
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border ${isDarkMode ? "bg-purple-700/50 border-purple-500/40 text-purple-200" : "bg-purple-200 border-purple-300 text-purple-700"}`}
                  >
                    <User size={20} />
                  </div>
                )}
              </div>

              {showText && (
                <div className="ml-3 flex-1 overflow-hidden">
                  <div
                    className={`text-sm font-bold truncate tracking-wide ${isDarkMode ? "text-white" : "text-purple-950"}`}
                  >
                    {userData?.name || "User"}
                  </div>
                  <div
                    className={`text-[10px] truncate font-sans ${isDarkMode ? "text-purple-300/60" : "text-purple-600/70"}`}
                  >
                    {userData?.email || "Welcome back"}
                  </div>
                </div>
              )}

              {showText && (
                <button
                  onClick={handleLogout}
                  className={`p-2 rounded-lg transition-colors shrink-0 ml-2 ${isDarkMode ? "text-purple-400 hover:text-red-400 hover:bg-red-500/20" : "text-purple-600 hover:text-red-500 hover:bg-red-100"}`}
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
                className={`w-full flex items-center justify-between p-2.5 border rounded-xl transition-all duration-300 group shadow-inner mt-1 ${isDarkMode ? "bg-black/20 hover:bg-black/40 border-purple-500/20" : "bg-purple-50 hover:bg-purple-100 border-purple-200"}`}
              >
                <span className="bg-purple-600 text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-md tracking-wider shadow-md">
                  {userData?.plan || "Free"}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Coins
                    size={16}
                    className={`group-hover:scale-110 transition-transform duration-300 drop-shadow-md ${isDarkMode ? "text-yellow-400" : "text-amber-500"}`}
                  />
                  <span
                    className={`text-sm font-extrabold tracking-wide ${isDarkMode ? "text-yellow-400" : "text-amber-500"}`}
                  >
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
                  className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors shrink-0 ${isDarkMode ? "bg-purple-900/40 border-purple-500/30 hover:bg-purple-600/40" : "bg-purple-100 border-purple-300 hover:bg-purple-200"}`}
                  title="View Billing Plans"
                >
                  <Coins
                    size={18}
                    className={
                      isDarkMode ? "text-yellow-400" : "text-amber-500"
                    }
                  />
                </button>
                <button
                  onClick={handleLogout}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors shrink-0 ${isDarkMode ? "text-purple-400 hover:text-red-400 hover:bg-red-500/20" : "text-purple-600 hover:text-red-500 hover:bg-red-100"}`}
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
