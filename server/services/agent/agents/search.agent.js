import { searchTool } from "../config/tavily.js";

export const searchAgent = async (state) => {
    try {
        const queryText = state.userPrompt;

        if (!queryText) {
            throw new Error("No search query found in state");
        }

        const res = await searchTool.invoke({ query: queryText });

        let parsedResults = res;
        let images = [];

        if (typeof res === "string") {
            try {
                parsedResults = JSON.parse(res);
            } catch {
                parsedResults = [{ content: res }];
            }
        }

        if (Array.isArray(res?.images)) {
            images = res.images;
        } else if (Array.isArray(parsedResults?.images)) {
            images = parsedResults.images;
        }

        return {
            ...state,
            searchResults: parsedResults,
            searchImages: images
        };
    } catch (error) {
        console.error("Search agent error:", error);
        return {
            ...state,
            searchResults: [],
            searchImages: []
        };
    }
};