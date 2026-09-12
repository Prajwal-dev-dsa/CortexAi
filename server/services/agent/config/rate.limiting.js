import redis from "../../../shared/redis/redis.js";


const LIMITS = {
    chat: 5,
    coding: 3,
    pdf: 3,
    ppt: 3,
    image: 3,
    search: 5,
    pdfRag: 3,
    imageAnalyzer: 3
}


export const rateLimiting = async (userId, agent) => {
    try {
        const maxLimit = LIMITS[agent] || 10;
        const key = `rateLimit:${userId}:${agent}`;
        const count = await redis.incr(key)
        if (count == 1) {
            await redis.expire(key, 60);
        }
        const ttl = await redis.ttl(key)
        if (count > maxLimit) {
            const mins = Math.floor(ttl / 60)
            const secs = ttl % 60
            const time = mins > 0 ? `${mins} min : ${secs} sec` : `${secs} sec`

            const error = new Error(`Uhh Ohh! Rate limit exceeded for ${agent} agent. Please try again in ${time}.`);
            error.status = 429;
            error.data = {
                success: false,
                agent,
                maxLimit,
                remainingTime: ttl,
                retryAfter: time,
                message: `Uhh Ohh! Rate limit exceeded for ${agent} agent. Please try again in ${time}.`

            }
            throw error;
        }
        return {
            success: true,
            agent,
            maxLimit,
            remainingLimit: maxLimit - count,
            remainingTime: ttl
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}