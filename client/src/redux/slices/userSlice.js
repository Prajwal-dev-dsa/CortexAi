import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",

    initialState: {
        userData: null
    },

    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
        },
        clearUserData: (state) => {
            state.userData = null;
        },
        updateUserCredits: (state, action) => {
            if (state.userData) {
                state.userData.credits = action.payload;
            }
        }
    },
});

export const {
    setUserData,
    clearUserData,
    updateUserCredits
} = userSlice.actions;

export default userSlice.reducer;