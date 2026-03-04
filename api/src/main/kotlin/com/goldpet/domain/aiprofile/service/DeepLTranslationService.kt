package com.goldpet.domain.aiprofile.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.http.*
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.stereotype.Component
import org.springframework.util.LinkedMultiValueMap
import org.springframework.web.client.RestTemplate

@Component
@Profile("local", "dev", "prod")
class DeepLTranslationService(
    @Value("\${deepl.api-key:}") private val apiKey: String
) : TranslationService {

    private val log = LoggerFactory.getLogger(javaClass)

    private val restTemplate = RestTemplate(SimpleClientHttpRequestFactory().apply {
        setConnectTimeout(3000)
        setReadTimeout(5000)
    })

    override fun translate(text: String, sourceLang: String, targetLang: String): String {
        if (apiKey.isBlank()) {
            log.warn("DeepL API key not configured, returning original text")
            return text
        }

        return try {
            val headers = HttpHeaders().apply {
                set("Authorization", "DeepL-Auth-Key $apiKey")
                contentType = MediaType.APPLICATION_FORM_URLENCODED
            }

            val body = LinkedMultiValueMap<String, String>().apply {
                add("text", text)
                add("source_lang", sourceLang)
                add("target_lang", targetLang)
            }

            val response = restTemplate.exchange(
                "https://api-free.deepl.com/v2/translate",
                HttpMethod.POST,
                HttpEntity(body, headers),
                Map::class.java
            )

            @Suppress("UNCHECKED_CAST")
            val translations = (response.body?.get("translations") as? List<Map<String, Any>>)
            val translated = translations?.firstOrNull()?.get("text") as? String

            if (translated != null) {
                log.info("DeepL translated: '{}' -> '{}'", text, translated)
                translated
            } else {
                log.warn("DeepL returned empty translation for: '{}'", text)
                text
            }
        } catch (e: Exception) {
            log.warn("DeepL translation failed for '{}': {}", text, e.message)
            text
        }
    }
}
