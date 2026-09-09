import { getDesiredModel } from "../config/llm.models.js";
import axios from "axios";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { fetchFromS3 } from "../utils/fetchFromS3.js";

export const imageAgent = async (state) => {
    try {
        const llm = getDesiredModel("image");
        const res = await llm.invoke(`
            You are an expert AI Image Prompt Engineer.

            Your job is to transform the user's request into a detailed, high-quality prompt for an image generation model.

            User Request:
            ${state.userPrompt || ""}

            Enhance the request while strictly preserving the user's original intent.

            Improve the prompt by intelligently adding relevant details about:
            - Subject and appearance
            - Environment and background
            - Composition and camera perspective
            - Lighting and shadows
            - Colors and atmosphere
            - Materials and textures
            - Depth of field and focus
            - Appropriate artistic or photographic style
            - Realism and fine visual details

            Make the scene visually rich, coherent, cinematic and professional.

            Do not change the user's subject, concept, action or important details.
            Do not add unnecessary objects or unrelated ideas.
            Do not blindly add keywords like "8K", "masterpiece" or "ultra HD"; prioritize meaningful visual details.

            If the user specifies a style, camera angle, lighting, colors, aspect ratio or other requirements, preserve them.

            Return ONLY the final image-generation prompt.
            Do not explain anything.
            Do not use Markdown.
            Do not use JSON.
            Do not add labels such as "Enhanced Prompt:".
        `);

        const prompt = res.content.trim();
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

        const imageRes = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
        });

        const imageBuffer = Buffer.from(imageRes.data);
        const fileName = `image_${Date.now()}.png`;

        await uploadToS3(fileName, imageBuffer, 'image/png');
        const downloadUrl = await fetchFromS3(fileName);

        const safeUrl = encodeURI(downloadUrl);

        return {
            ...state,
            aiResponse: `**Image Generated Successfully!**\n\n![Generated AI Image](${safeUrl})\n\n[Download Original Image](${safeUrl})\n\n*Note: Link expires in 60 minutes.*`
        };
    } catch (error) {
        console.error("Image agent error:", error);
        return { ...state, aiResponse: "Sorry, I couldn't generate the image. Please try again." };
    }
}