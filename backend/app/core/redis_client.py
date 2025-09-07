import redis.asyncio as redis
from app.core.config import settings

redis_client = None

async def get_redis():
    global redis_client
    if redis_client is None:
        redis_client = await redis.from_url(settings.REDIS_URL)
    return redis_client

async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None
