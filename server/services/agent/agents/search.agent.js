import { searchTool } from "../config/tavily.js";
import { deductCredits } from "../utils/deductCredits.js";

export const searchAgent = async (state) => {
    try {
        const creditStatus = await deductCredits(state.userId, "search");
        if (creditStatus === 400) {
            return {
                ...state,
                aiResponse: "Sorry, you don't have enough credits to use this agent. Please top up your balance in the billing section.",
            };
        }
        await deductCredits(state.userId, "search");
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