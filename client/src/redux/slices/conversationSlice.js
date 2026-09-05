import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
    name: "conversation",
    initialState: {
        conversations: [],
        selectedConversation: null,
    },
    reducers: {
        setConversations: (state, action) => {
            state.conversations = action.payload;
        },
        addConversation: (state, action) => {
            state.conversations.unshift(action.payload);
        },
        removeConversation: (state, action) => {
            state.conversations = state.conversations.filter(
                (conv) => conv._id !== action.payload
            );
            if (state.selectedConversation?._id === action.payload) {
                state.selectedConversation = null;
            }
        },
        updateConversationTitle: (state, action) => {
            const { id, title } = action.payload;
            const conversation = state.conversations.find((c) => c._id === id);
            if (conversation) {
                conversation.title = title;
            }
            if (state.selectedConversation?._id === id) {
                state.selectedConversation.title = title;
            }
        },
        setSelectedConversation: (state, action) => {
            state.selectedConversation = action.payload;
        },
    },
});

export const {
    setConversations,
    addConversation,
    removeConversation,
    updateConversationTitle,
    setSelectedConversation,
} = conversationSlice.actions;

export default conversationSlice.reducer;