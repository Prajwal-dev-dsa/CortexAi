import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
    const savedTheme = localStorage.getItem("cortex_theme");
    if (savedTheme !== null) {
        return JSON.parse(savedTheme);
    }
    return true;
};

const initialState = {
    isDarkMode: getInitialTheme(),
};

export const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.isDarkMode = !state.isDarkMode;
            localStorage.setItem("cortex_theme", JSON.stringify(state.isDarkMode));
        },
    },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;