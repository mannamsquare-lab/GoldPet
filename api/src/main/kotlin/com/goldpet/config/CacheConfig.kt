package com.goldpet.config

import org.slf4j.LoggerFactory
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.event.EventListener
import org.springframework.data.redis.cache.RedisCacheConfiguration
import org.springframework.data.redis.cache.RedisCacheManager
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer
import org.springframework.data.redis.serializer.RedisSerializationContext
import org.springframework.data.redis.serializer.StringRedisSerializer
import java.time.Duration

@Configuration
@org.springframework.context.annotation.Profile("!test")
class CacheConfig {

    @Bean
    fun cacheManager(redisConnectionFactory: RedisConnectionFactory): RedisCacheManager {
        val objectMapper = com.fasterxml.jackson.databind.ObjectMapper()
            .registerModule(com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
            .registerModule(com.fasterxml.jackson.module.kotlin.KotlinModule.Builder().build())

        // Kotlin data class는 final이므로 NON_FINAL 대신 EVERYTHING 사용
        // (NON_FINAL은 final 타입에 @class 타입 정보를 포함하지 않아 역직렬화 실패)
        objectMapper.activateDefaultTyping(
            objectMapper.polymorphicTypeValidator,
            com.fasterxml.jackson.databind.ObjectMapper.DefaultTyping.EVERYTHING,
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
            .withCacheConfiguration("breeds", staticDataConfig)
            .withCacheConfiguration("system:settings", staticDataConfig)
            .withCacheConfiguration("user:interests", staticDataConfig)
            .withCacheConfiguration("user:hobbies", staticDataConfig)
            .withCacheConfiguration("gold:products", staticDataConfig)
            .withCacheConfiguration("user:stats", postFeedConfig)
            .build()
    }

    @EventListener(ApplicationReadyEvent::class)
    fun clearCachesOnStartup(event: ApplicationReadyEvent) {
        val log = LoggerFactory.getLogger(CacheConfig::class.java)
        val cm = event.applicationContext.getBean(RedisCacheManager::class.java)
        cm.cacheNames.forEach { name ->
            cm.getCache(name)?.clear()
        }
        log.info("All Redis caches cleared on startup (Flyway migration sync)")
    }
}
