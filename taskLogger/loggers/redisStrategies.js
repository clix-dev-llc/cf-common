class RedisFlattenStrategy {
    constructor(keys) {
        this.keys = keys;
    }
    push(obj, key, redisClient, stack) {
        if (stack.length === 1 && typeof(obj) === 'string' && this.keys.has(stack[0])) {
            redisClient.rpush(`${key}:${stack.pop()}`, obj);
            return true;
        }
            
        return false;
    }
}

class RedisSetStratry {

    push(obj, key, redisClient, stack) {

        if (typeof(obj) !== 'object' && stack.length !== 0) {
            obj = {[stack.pop()]:obj};
        }
        if (typeof(obj) === 'object') {
            const hsetKeysValues = Object.keys(obj).reduce((acc, key) => {
                acc.push(key);
                acc.push(obj[key]);
                return acc;
            }, []);
            redisClient.hmset(key, hsetKeysValues);
        }else {
            redisClient.set(key, obj);
        }
        return true;

    }
}

class ChainRedisStrategy {

    constructor(strategies) {
        this.strategies = strategies;
    }
    push (obj, key, redisClient, stack) {
        this.strategies.some((strategy) => {
            return strategy.push(obj, key, redisClient, stack);
        });
    }
}
module.exports = {
    RedisFlattenStrategy,
    RedisSetStratry,
    ChainRedisStrategy
}