import { getAllMessages } from "../utils/getAllMessages.js";
import  redis  from "../../../shared/redis/redis.js";

export const getMemory=async(conversationId)=>{
    const key=`messages-${conversationId}`;
    const cached = await redis.get(key);
    if(cached) return JSON.parse(cached);
    
    const messages=await getAllMessages(conversationId);
    await redis.set(key, JSON.stringify(messages), 'EX', 60 * 60 * 24); // 24 hours
    return messages;
}

export const addNewMessage=async(conversationId, role, content)=>{
    const key=`messages-${conversationId}`;
    const rawMessages = await redis.get(key);
    const messages=rawMessages?JSON.parse(rawMessages):[];
    messages.push({ role, content });

    if(messages.length>20){
        messages.shift();
    }

    await redis.set(key, JSON.stringify(messages));
    return;
}