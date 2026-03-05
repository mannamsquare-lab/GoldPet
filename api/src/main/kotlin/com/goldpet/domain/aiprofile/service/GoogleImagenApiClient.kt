package com.goldpet.domain.aiprofile.service

import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.http.*
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate

@Component
@Profile("local", "dev", "prod")
class GoogleImagenApiClient(
    private val restTemplate: RestTemplate,
    private val objectMapper: ObjectMapper,
    @Value("\${google.ai.api-key:}") private val apiKey: String,
    @Value("\${google.ai.model:gemini-3.1-flash-image-preview}") private val model: String
) {
    private val log = LoggerFactory.getLogger(javaClass)
    private val baseUrl = "https://generativelanguage.googleapis.com/v1beta"

    /**
     * Gemini 이미지 생성 (generateContent 방식 - base64 이미지 반환)
     */
    fun generateImage(prompt: String): ByteArray {
        val url = "$baseUrl/models/$model:generateContent?key=$apiKey"

        val body = objectMapper.writeValueAsString(
            mapOf(
                "contents" to listOf(
                    mapOf(
                        "parts" to listOf(
                            mapOf("text" to "Generate an image: $prompt")
                        )
                    )
                ),
                "generationConfig" to mapOf(
                    "responseModalities" to listOf("IMAGE"),
                    "imageConfig" to mapOf(
                        "aspectRatio" to "1:1",
                        "imageSize" to "512px"
                    )
                )
            )
        )

        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_JSON
        }

        val entity = HttpEntity(body, headers)

        log.info("Requesting image generation with model={}, prompt length={}", model, prompt.length)

        val response = restTemplate.exchange(
            url,
            HttpMethod.POST,
            entity,
            String::class.java
        )

        val responseStr = response.body
            ?: throw IllegalStateException("Empty response from Google AI API")

        val root = objectMapper.readTree(responseStr)

        if (root.has("error")) {
            val errorMsg = root.path("error").path("message").asText("Unknown error")
            throw IllegalStateException("Google AI API error: $errorMsg")
        }

        val candidates = root.path("candidates")
        if (!candidates.isArray || candidates.isEmpty) {
            throw IllegalStateException("No candidates in response")
        }

        val parts = candidates[0].path("content").path("parts")
        if (!parts.isArray || parts.isEmpty) {
            throw IllegalStateException("No parts in response content")
        }

        for (part in parts) {
            val inlineData = part.path("inlineData")
            if (!inlineData.isMissingNode) {
                val base64Data = inlineData.path("data").asText(null)
                    ?: throw IllegalStateException("Missing data in inlineData")
                val mimeType = inlineData.path("mimeType").asText("image/png")

                val imageBytes = java.util.Base64.getDecoder().decode(base64Data)
                log.info("Image generation complete, mimeType={}, size={}KB", mimeType, imageBytes.size / 1024)
                return imageBytes
            }
        }

        throw IllegalStateException("No image data found in response parts")
    }
}
