package com.goldpet.redis

import org.springframework.data.repository.CrudRepository
import org.springframework.data.redis.core.RedisHash

@RedisHash("dummy")
class DummyEntity(val id: String)

interface DummyRedisRepository : CrudRepository<DummyEntity, String>
