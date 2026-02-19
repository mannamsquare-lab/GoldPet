package com.goldpet.config.crypto

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import jakarta.annotation.PostConstruct

@Configuration
class EncryptionConfig(
    @Value("\${app.encryption.key:default-dev-key-32-chars!!}")
    val encryptionKey: String
) {
    companion object {
        lateinit var instance: EncryptionConfig
            private set
    }

    @PostConstruct
    fun init() {
        instance = this
    }
}
