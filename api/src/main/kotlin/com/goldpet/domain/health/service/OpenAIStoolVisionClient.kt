package com.goldpet.domain.health.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.goldpet.domain.health.dto.PetContextDto
import com.goldpet.domain.health.dto.StoolAnalysisResult
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClientException
import org.springframework.web.client.RestTemplate

@Service
@Profile("local", "dev", "prod")
class OpenAIStoolVisionClient(
    @Qualifier("openaiRestTemplate") private val restTemplate: RestTemplate,
    @Value("\${openai.api-key:}") private val apiKey: String,
    @Value("\${S3_PUBLIC_ENDPOINT:http://localhost:9100}") private val publicEndpoint: String,
    @Value("\${S3_PUBLIC_BUCKET_NAME:goldpet-public}") private val publicBucketName: String,
    private val promptBuilder: StoolAnalysisPromptBuilder,
    private val objectMapper: ObjectMapper
) : StoolVisionClient {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun analyze(imageUrl: String, petInfo: PetContextDto): StoolAnalysisResult {
        return try {
            callOpenAI(imageUrl, petInfo)
        } catch (e: RestClientException) {
            // DNS 실패(UnknownHostException) 등 일시적 네트워크 이슈 회복 시간 확보용 짧은 backoff.
            log.warn("OpenAI call failed, retrying once after 500ms: {}", e.message)
            try {
                Thread.sleep(500)
            } catch (ie: InterruptedException) {
                Thread.currentThread().interrupt()
                throw ie
            }
            callOpenAI(imageUrl, petInfo)
        }
    }

    private fun resolveImageUrl(imageUrl: String): String {
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl
        return "$publicEndpoint/$publicBucketName/$imageUrl"
    }

    private fun callOpenAI(imageUrl: String, petInfo: PetContextDto): StoolAnalysisResult {
        val fullImageUrl = resolveImageUrl(imageUrl)
        val systemPrompt = promptBuilder.buildSystemPrompt(petInfo)
        val userPrompt = promptBuilder.buildUserPrompt()

        val requestBody = mapOf(
            "model" to "gpt-4o-mini",
            "max_tokens" to 1000,
            "messages" to listOf(
                mapOf(
                    "role" to "system",
                    "content" to systemPrompt
                ),
                mapOf(
                    "role" to "user",
                    "content" to listOf(
                        mapOf("type" to "text", "text" to userPrompt),
                        mapOf(
                            "type" to "image_url",
                            "image_url" to mapOf("url" to fullImageUrl, "detail" to "high")
                        )
                    )
                )
            )
        )

        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_JSON
            setBearerAuth(apiKey)
        }

        val entity = HttpEntity(requestBody, headers)
        val response = restTemplate.postForObject(
            "https://api.openai.com/v1/chat/completions",
            entity,
            Map::class.java
        ) ?: throw IllegalStateException("Empty response from OpenAI")

        @Suppress("UNCHECKED_CAST")
        val choices = response["choices"] as? List<Map<String, Any>>
            ?: throw IllegalStateException("No choices in OpenAI response")
        @Suppress("UNCHECKED_CAST")
        val message = choices.firstOrNull()?.get("message") as? Map<String, Any>
            ?: throw IllegalStateException("No message in OpenAI response")
        val content = message["content"] as? String
            ?: throw IllegalStateException("No content in OpenAI response")

        log.debug("OpenAI raw response: {}", content)

        return parseResult(content)
    }

    private fun parseResult(content: String): StoolAnalysisResult {
        val jsonContent = extractJson(content)
        @Suppress("UNCHECKED_CAST")
        val parsed = objectMapper.readValue(jsonContent, Map::class.java) as Map<String, Any>

        val colorScore = (parsed["color_score"] as? Number)?.toInt() ?: 0
        val consistencyScore = (parsed["consistency_score"] as? Number)?.toInt() ?: 0
        val coatingScore = (parsed["coating_score"] as? Number)?.toInt() ?: 0
        val contentsScore = (parsed["contents_score"] as? Number)?.toInt() ?: 0
        val overallScore = (parsed["overall_score"] as? Number)?.toInt() ?: 0

        // Validate scores are in range 0-5
        listOf(colorScore, consistencyScore, coatingScore, contentsScore, overallScore).forEach { score ->
            if (score !in 0..5) throw IllegalStateException("Score out of range: $score")
        }

        @Suppress("UNCHECKED_CAST")
        val healthTips = (parsed["health_tips"] as? List<String>) ?: emptyList()
        @Suppress("UNCHECKED_CAST")
        val warnings = (parsed["warnings"] as? List<String>) ?: emptyList()

        return StoolAnalysisResult(
            colorScore = colorScore,
            consistencyScore = consistencyScore,
            coatingScore = coatingScore,
            contentsScore = contentsScore,
            overallScore = overallScore,
            colorAssessment = parsed["color_assessment"] as? String ?: "",
            consistencyAssessment = parsed["consistency_assessment"] as? String ?: "",
            coatingAssessment = parsed["coating_assessment"] as? String ?: "",
            contentsAssessment = parsed["contents_assessment"] as? String ?: "",
            healthSummary = parsed["health_summary"] as? String ?: "",
            healthTips = healthTips,
            warnings = warnings
        )
    }

    private fun extractJson(content: String): String {
        val start = content.indexOf('{')
        val end = content.lastIndexOf('}')
        if (start == -1 || end == -1) throw IllegalStateException("No JSON found in response")
        return content.substring(start, end + 1)
    }
}
