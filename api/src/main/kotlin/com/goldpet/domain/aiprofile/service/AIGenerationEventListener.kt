package com.goldpet.domain.aiprofile.service

import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.ObjectMetadata
import com.goldpet.domain.aiprofile.entity.AIRequestStatus
import com.goldpet.domain.aiprofile.repository.AIProfileRequestRepository
import com.goldpet.domain.aiprofile.repository.AIStyleRepository
import com.goldpet.domain.gold.service.GoldService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener
import org.springframework.web.client.RestTemplate
import java.io.ByteArrayInputStream

@Component
@Profile("local", "dev", "prod")
class AIGenerationEventListener(
    private val aiProfileRequestRepository: AIProfileRequestRepository,
    private val aiStyleRepository: AIStyleRepository,
    private val leonardoApiClient: LeonardoApiClient,
    private val promptBuilder: AIPromptBuilder,
    private val goldService: GoldService,
    private val restTemplate: RestTemplate,
    private val amazonS3: AmazonS3,
    @Value("\${S3_PUBLIC_ENDPOINT:http://localhost:9100}") private val s3PublicEndpoint: String,
    @Value("\${S3_PUBLIC_BUCKET_NAME:goldpet-public}") private val publicBucketName: String
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Async("aiGenerationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun handleGeneration(event: AIGenerationEvent) {
        log.info("Handling AIGenerationEvent for requestId={}", event.requestId)

        val request = aiProfileRequestRepository.findById(event.requestId).orElse(null)
        if (request == null) {
            log.error("AIProfileRequest not found for id={}", event.requestId)
            return
        }

        // a. Mark PROCESSING
        request.status = AIRequestStatus.PROCESSING
        aiProfileRequestRepository.save(request)

        try {
            // b. Upload source image to Leonardo as init image
            val initImageId = if (request.sourceImageUrl.isNotBlank()) {
                try {
                    leonardoApiClient.uploadInitImage(request.sourceImageUrl)
                } catch (e: Exception) {
                    log.warn("Failed to upload init image, proceeding without it: {}", e.message)
                    null
                }
            } else null

            // Build prompt using pet info
            val style = request.stylePrompt?.let { aiStyleRepository.findById(it).orElse(null) }
            val presetId = style?.presetId
            val prompt = promptBuilder.buildPrompt(request.pet, request.stylePrompt, presetId)
            val negativePrompt = promptBuilder.buildNegativePrompt()

            // c. Create generation → save generationId
            val generationId = leonardoApiClient.createGeneration(
                prompt = prompt,
                initImageId = initImageId,
                presetStyle = presetId,
                negativePrompt = negativePrompt
            )

            request.leonardoGenerationId = generationId
            aiProfileRequestRepository.save(request)

            log.info("Leonardo generation submitted for requestId={}, generationId={}", event.requestId, generationId)

            // d. Poll for completion (max 40 times, 3s interval = 120s)
            var resultImageUrl: String? = null
            repeat(40) { attempt ->
                if (resultImageUrl != null) return@repeat
                Thread.sleep(3000)

                val result = try {
                    leonardoApiClient.getGeneration(generationId)
                } catch (e: Exception) {
                    log.warn("Poll attempt {} failed for generationId={}: {}", attempt + 1, generationId, e.message)
                    return@repeat
                }

                when (result.status) {
                    "COMPLETE" -> {
                        resultImageUrl = result.imageUrl
                        log.info("Generation COMPLETE for generationId={}, imageUrl={}", generationId, result.imageUrl)
                    }
                    "FAILED" -> {
                        log.warn("Generation FAILED for generationId={}", generationId)
                        throw IllegalStateException("Leonardo generation failed")
                    }
                    else -> log.debug("Generation status={} for generationId={} (attempt {})", result.status, generationId, attempt + 1)
                }
            }

            val leonardoImageUrl = resultImageUrl
                ?: throw IllegalStateException("Generation timed out after 120s for generationId=$generationId")

            // e. Re-host result image to S3
            val finalUrl = try {
                reHostToS3(leonardoImageUrl, event.requestId)
            } catch (e: Exception) {
                log.warn("S3 re-hosting failed, using Leonardo URL directly: {}", e.message)
                leonardoImageUrl
            }

            // f. COMPLETED + resultUrl
            val completed = aiProfileRequestRepository.findById(event.requestId).orElse(null) ?: return
            completed.status = AIRequestStatus.COMPLETED
            completed.resultUrl = finalUrl
            aiProfileRequestRepository.save(completed)

            log.info("AI generation completed for requestId={}, resultUrl={}", event.requestId, finalUrl)

        } catch (e: InterruptedException) {
            Thread.currentThread().interrupt()
            failAndRefund(event.requestId, request.user.id, request.goldCost, "Generation interrupted")
        } catch (e: Exception) {
            log.error("AI generation failed for requestId={}: {}", event.requestId, e.message, e)
            failAndRefund(event.requestId, request.user.id, request.goldCost, e.message ?: "Unknown error")
        }
    }

    private fun reHostToS3(imageUrl: String, requestId: Long): String {
        val imageBytes = restTemplate.getForObject(imageUrl, ByteArray::class.java)
            ?: throw IllegalStateException("Failed to download image from $imageUrl")

        val key = "ai-profiles/$requestId.jpg"
        val metadata = ObjectMetadata().apply {
            contentType = "image/jpeg"
            contentLength = imageBytes.size.toLong()
        }
        amazonS3.putObject(publicBucketName, key, ByteArrayInputStream(imageBytes), metadata)

        val s3Url = "$s3PublicEndpoint/$publicBucketName/$key"
        log.info("Re-hosted AI result to S3 for requestId={}, url={}", requestId, s3Url)
        return s3Url
    }

    private fun failAndRefund(requestId: Long, userId: Long, goldCost: Int, reason: String) {
        try {
            val req = aiProfileRequestRepository.findById(requestId).orElse(null)
            if (req != null) {
                req.status = AIRequestStatus.FAILED
                req.errorMessage = reason
                aiProfileRequestRepository.save(req)
            }
        } catch (e: Exception) {
            log.error("Failed to mark request FAILED for id={}: {}", requestId, e.message)
        }

        try {
            goldService.systemRefund(
                userId = userId,
                amount = goldCost,
                description = "AI 프로필 생성 실패 자동 환불",
                referenceType = "AI_PROFILE_FAIL",
                referenceId = requestId
            )
            log.info("Auto-refunded {} gold to userId={} for failed requestId={}", goldCost, userId, requestId)
        } catch (e: Exception) {
            log.error("Failed to auto-refund for userId={} requestId={}: {}", userId, requestId, e.message)
        }
    }
}
