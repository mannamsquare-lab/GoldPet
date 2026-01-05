package com.goldpet.config

import org.springframework.cache.annotation.EnableCaching
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.cache.RedisCacheConfiguration
import org.springframework.data.redis.cache.RedisCacheManager
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer
import org.springframework.data.redis.serializer.RedisSerializationContext
import org.springframework.data.redis.serializer.StringRedisSerializer
import java.time.Duration

@Configuration
@EnableCaching
class CacheConfig {

    @Bean
    fun cacheManager(redisConnectionFactory: RedisConnectionFactory): RedisCacheManager {
        val objectMapper = com.fasterxml.jackson.databind.ObjectMapper()
            .registerModule(com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
            .registerModule(com.fasterxml.jackson.module.kotlin.KotlinModule.Builder().build())

        objectMapper.activateDefaultTyping(
            objectMapper.polymorphicTypeValidator,
            com.fasterxml.jackson.databind.ObjectMapper.DefaultTyping.NON_FINAL,
            com.fasterxml.jackson.annotation.JsonTypeInfo.As.PROPERTY
        )

        val serializer = GenericJackson2JsonRedisSerializer(objectMapper)

        val defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(StringRedisSerializer())
            )
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(serializer)
            )
            .entryTtl(Duration.ofMinutes(10)) // Default TTL

        val postFeedConfig = defaultConfig.entryTtl(Duration.ofSeconds(30)) // Short TTL for feeds
        val staticDataConfig = defaultConfig.entryTtl(Duration.ofHours(24)) // Long TTL for categories

        return RedisCacheManager.builder(redisConnectionFactory)
            .cacheDefaults(defaultConfig)
            .withCacheConfiguration("community:posts", postFeedConfig)
            .withCacheConfiguration("community:categories", staticDataConfig)
            .withCacheConfiguration("pet:species", staticDataConfig)
            .withCacheConfiguration("pet:breeds", staticDataConfig)
            .withCacheConfiguration("system:settings", staticDataConfig)
            .build()
    }
}
