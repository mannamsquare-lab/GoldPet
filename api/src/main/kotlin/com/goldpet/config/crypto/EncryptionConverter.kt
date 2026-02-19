package com.goldpet.config.crypto

import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter
import org.slf4j.LoggerFactory
import java.util.Base64
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec
import java.security.SecureRandom

@Converter
class EncryptionConverter : AttributeConverter<String?, String?> {

    private val log = LoggerFactory.getLogger(EncryptionConverter::class.java)

    private val algorithm = "AES/GCM/NoPadding"
    private val gcmTagLength = 128
    private val ivLength = 12

    override fun convertToDatabaseColumn(attribute: String?): String? {
        if (attribute == null) return null
        try {
            val key = getKey()
            val iv = ByteArray(ivLength)
            SecureRandom().nextBytes(iv)

            val cipher = Cipher.getInstance(algorithm)
            cipher.init(Cipher.ENCRYPT_MODE, key, GCMParameterSpec(gcmTagLength, iv))
            val encrypted = cipher.doFinal(attribute.toByteArray(Charsets.UTF_8))

            // Prepend IV to encrypted data
            val combined = iv + encrypted
            return Base64.getEncoder().encodeToString(combined)
        } catch (e: Exception) {
            throw RuntimeException("Encryption failed", e)
        }
    }

    override fun convertToEntityAttribute(dbData: String?): String? {
        if (dbData == null) return null
        try {
            val key = getKey()
            val combined = Base64.getDecoder().decode(dbData)

            val iv = combined.sliceArray(0 until ivLength)
            val encrypted = combined.sliceArray(ivLength until combined.size)

            val cipher = Cipher.getInstance(algorithm)
            cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(gcmTagLength, iv))
            return String(cipher.doFinal(encrypted), Charsets.UTF_8)
        } catch (e: Exception) {
            // If decryption fails, return raw value (backward compatibility for plaintext data during migration)
            log.warn("Decryption failed for a column value — returning plaintext (migration fallback). Cause: {}", e.message)
            return dbData
        }
    }

    private fun getKey(): SecretKeySpec {
        val keyString = EncryptionConfig.instance.encryptionKey
        // Ensure key is exactly 32 bytes for AES-256
        val keyBytes = keyString.toByteArray(Charsets.UTF_8).copyOf(32)
        return SecretKeySpec(keyBytes, "AES")
    }
}
