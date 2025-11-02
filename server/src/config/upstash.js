import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let ratelimit;

if (UPSTASH_URL && UPSTASH_TOKEN) {
  // create a ratelimiter that allows 100 requests per minute
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, "60 s"),
  });
} else {
  console.warn("Upstash missing credentials — rate limiter disabled");
  ratelimit = {
    async limit() { return { success: true }; }
  };
}


export default ratelimit;