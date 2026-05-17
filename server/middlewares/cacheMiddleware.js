const redis = require("redis");

let redisClient = null;

if (process.env.REDIS_ENABLED === "true") {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on("error", (err) => {
    console.error("Redis error:", err);
  });

  redisClient.connect()
    .then(() => {
      console.log("Connected to Redis");
    })
    .catch((err) => {
      console.error("Error connecting to Redis:", err);
    });
}

const cacheMiddleware = (cacheKeyGenerator, ttl = 20000) => {
  return async (req, res, next) => {

    // Redis disabled
    if (process.env.REDIS_ENABLED !== "true") {
      return next();
    }

    const cacheKey = cacheKeyGenerator(req);

    try {
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        const data = JSON.parse(cachedData);
        return res.send(data);
      }

      const originalSend = res.send.bind(res);

      res.send = async (body) => {
        try {
          if (res.statusCode === 200) {
            await redisClient.setEx(
              cacheKey,
              ttl,
              JSON.stringify(body)
            );
          }
        } catch (err) {
          console.error("Redis set error:", err);
        }

        return originalSend(body);
      };

      next();

    } catch (err) {
      console.error("Cache middleware error:", err);
      next();
    }
  };
};

module.exports = cacheMiddleware;