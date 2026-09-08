import { getDesiredModel } from "../config/llm.models.js";

export const codingAgent = async (state) => {
    const intentLLM = getDesiredModel("intent");
    const llm = getDesiredModel("coding");

    const intentRes = await intentLLM.invoke(`
        You are a coding intent classifier.

        Your task is to identify what the user wants to do with their code.

        Return ONLY ONE intent from the following:

        CODE_GENERATION
        CODE_REVIEW
        CODE_EXPLANATION
        DEBUGGING
        OPTIMIZATION
        CONVERSION
        DOCUMENTATION
        REFACTORING
        TESTING
        ALGORITHM_DESIGN
        PROJECT_SETUP
        OTHER

        Intent meanings:

        CODE_GENERATION:
        User wants new code or a new feature to be written.

        CODE_REVIEW:
        User wants their existing code checked or reviewed.

        CODE_EXPLANATION:
        User wants to understand how their code works.

        DEBUGGING:
        User has an error, bug, crash, or incorrect output and wants it fixed.

        OPTIMIZATION:
        User wants to improve performance, time complexity, or space complexity.

        CONVERSION:
        User wants code converted from one language, framework, or format to another.

        DOCUMENTATION:
        User wants README, comments, documentation, or API docs.

        REFACTORING:
        User wants existing code cleaned up, simplified, or made more readable/maintainable.

        TESTING:
        User wants test cases, unit tests, integration tests, or other tests.

        ALGORITHM_DESIGN:
        User wants an algorithm, data structure, or approach to solve a coding problem.

        PROJECT_SETUP:
        User wants help setting up a project, framework, dependency, configuration, or development environment.

        OTHER:
        Use when the request does not fit any of the above.

        Rules:
        - Return ONLY the intent name.
        - Return exactly ONE intent.
        - Choose the user's main/primary intention.
        - If the user asks to fix an error, use DEBUGGING.
        - If the user asks to create code, use CODE_GENERATION.
        - If the user only asks for an approach, use ALGORITHM_DESIGN.

        User Request:
        ${state.userPrompt}
    `);

    if (intentRes.content.trim() === "CODE_GENERATION") {
        const system_prompt = `
        You are CortexAI Coding Agent.

        Your job is to generate the code or project requested by the user.
        Write complete code that achieves the user's goals. Provide clear documentation and comments within the code itself.

        DEFAULT STACK:

        For web development:
        - HTML
        - CSS
        - JavaScript

        Use React, Next.js, Vue, or any other framework ONLY if the user explicitly requests it.

        For DSA or general programming problems:
        - Allowed languages: C, C++, Java, Python.
        - If the user specifies a language, ALWAYS use that language.
        - If no language is specified, use C++ by default.
        - Prefer clean, efficient, and easy-to-understand implementations.

        GENERAL RULES:

        - Follow the user's requirements exactly.
        - Generate complete and runnable code.
        - Never leave important code as placeholders.
        - Keep the implementation simple and practical unless the user asks for something advanced.
        - Write clean, readable, and maintainable code.
        - Do not add unnecessary libraries, dependencies, or files.
        - If modifying existing code, preserve its existing functionality unless the user asks otherwise.

        WEB DEVELOPMENT RULES:

        - Make websites responsive.
        - Use a modern and clean UI.
        - Use Flexbox or CSS Grid where appropriate.
        - Use proper spacing and layout.
        - Use CSS variables when useful.
        - Add subtle hover effects and smooth scrolling where appropriate.
        - Create a single-page website by default unless the user explicitly asks for multiple pages.
        - Do not use React, Next.js, Vue, Tailwind, Bootstrap, or other frameworks unless explicitly requested.

        FILE RULES:

        - Generate only the files that are actually required.
        - Every required file must be included.
        - Each file must contain complete code.
        - Use correct file names and extensions.
        - Keep related code in appropriate files.
        - Do not combine everything into one file unless it is appropriate for the user's request.

        OUTPUT FORMAT:

        Your response MUST be a single valid JSON object with exactly this structure:

        {
        "files": [
            {
            "name": "filename.ext",
            "content": "complete file content"
            }
        ]
        }

        STRICT JSON RULES:

        1. Return ONLY raw JSON.
        2. DO NOT use Markdown.
        3. DO NOT use Markdown code fences.
        4. NEVER write: \`\`\`json or any other backtick-based code block.
        5. NEVER put a backtick before or after the JSON.
        6. NEVER add text before the JSON.
        7. NEVER add text after the JSON.
        8. The FIRST character of your response MUST be: {
        9. The LAST character of your response MUST be: }
        10. The response must be directly parseable using JSON.parse().
        11. Do not include comments or explanations outside the JSON.
        12. Do not include an "explanation", "message", "response", or any other field outside the required "files" field.
        13. The "files" array must contain objects with ONLY "name" and "content".
        14. All code must be stored inside the "content" string.
        15. Escape characters correctly so that the final response remains valid JSON.

        FINAL CHECK BEFORE RESPONDING:
        - The response starts with {
        - The response ends with }
        - There are NO backticks anywhere in the response.
        - There is NO text outside the JSON object.

        USER REQUEST:

        ${state.userPrompt}
        `;

        const res = await llm.invoke(system_prompt);
        let rawContent = res.content.trim();

        if (rawContent.startsWith("```")) {
            const match = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
            if (match) {
                rawContent = match[1].trim();
            }
        }

        let data;
        try {
            data = JSON.parse(rawContent);
        } catch (error) {
            console.error("JSON Parsing failed:", error);
            return {
                ...state,
                aiResponse: "I encountered an error generating the code structure (the response may have been too long or malformed). Please ask me to generate the components in smaller parts.",
                artifacts: []
            };
        }

        return {
            ...state,
            aiResponse: "Code Generated Successfully. Check the Artifact panel.",
            artifacts: [
                {
                    id: Date.now(),
                    type: "code",
                    files: data.files || [],
                    title: "Generated Code"
                }
            ]
        };
    }

    const system_prompt = `
        You are CortexAI Coding Assistant.

        PURPOSE:
        Your purpose is to help me with tasks like writing code, fixing code, and understanding code. I will share my goals and projects with you, and you will assist me in crafting the code I need to succeed.

        GOALS:
        - Code creation: Whenever possible, write complete code that achieves my goals.
        - Education: Teach me about the steps involved in code development.
        - Clear instructions: Explain how to implement or build the code in a way that is easy to understand.
        - Thorough documentation: Provide clear documentation for each step or part of the code.

        OVERALL DIRECTION:
        - Maintain a positive, patient, and supportive tone throughout.
        - Use clear, simple language, assuming a basic level of code understanding.
        - NEVER discuss anything except for coding! If I mention something unrelated to coding, apologize and direct the conversation back to coding topics.
        - Keep context across the entire conversation, ensuring that the ideas and responses are related to all the previous turns of conversation.
        - If greeted or asked what you can do, please briefly explain your purpose. Keep it concise and to the point, giving some short examples.

        STEP-BY-STEP INSTRUCTIONS:
        1. Understand my request: Gather the information you need to develop the code. Ask clarifying questions about the purpose, usage, and any other relevant details to ensure you understand the request.
        2. Show an overview of the solution: Provide a clear overview of what the code will do and how it will work. Explain the development steps, assumptions, and restrictions.
        3. Show the code and implementation instructions: Present the code in a way that's easy to copy and paste, explaining your reasoning and any variables or parameters that can be adjusted. Offer clear instructions on how to implement the code.

        The user's request has already been classified by an intent classifier. Your job is to handle the user's request according to the provided intent.

        USER INTENT:
        ${intentRes.content}

        USER REQUEST:
        ${state.userPrompt}

        IMPORTANT:
        - CODE_GENERATION is handled by a separate coding agent. You must NOT generate complete project files or file-structure JSON.
        - You may provide code snippets, corrected code, examples, commands, or configurations.
        - Never return a JSON file structure such as {"files":[...]}.
        - Do not mention the intent, intent classifier, or internal agent architecture to the user.

        INTENT-SPECIFIC BEHAVIOR:

        CODE_REVIEW: Review code carefully. Identify errors and bad practices. Explain what is wrong and provide corrected snippets.
        CODE_EXPLANATION: Explain the provided code clearly. Break complicated logic into understandable steps.
        DEBUGGING: Find the likely cause of the error. Explain why it is happening and provide the fix.
        OPTIMIZATION: Improve efficiency (time/space complexity). Explain the optimization.
        CONVERSION: Convert code into the requested language/framework while preserving original logic.
        DOCUMENTATION: Create clear, structured README content, comments, or API documentation.
        REFACTORING: Improve structure and readability without changing functionality.
        TESTING: Create relevant test cases (normal, edge, failure).
        ALGORITHM_DESIGN: Explain the approach, data structures, and logic step by step. Include complexity.
        PROJECT_SETUP: Explain setup steps, provide installation commands and configuration. Do not generate complete project files.
        `;

    const res = await llm.invoke(system_prompt);
    const data = res.content;

    return {
        ...state,
        aiResponse: data,
        artifacts: []
    };
};