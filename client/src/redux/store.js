import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import conversationReducer from "./slices/conversationSlice";
import messageReducer from "./slices/messageSlice";
import themeReducer from "./slices/themeSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        conversation: conversationReducer,
        message: messageReducer,
        theme: themeReducer,
    },
});