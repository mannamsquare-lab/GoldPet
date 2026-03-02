package com.goldpet.domain.aiprofile.service

import com.goldpet.domain.aiprofile.dto.AIProfileRequestResponse
import com.goldpet.domain.aiprofile.dto.AIStyleOption
import com.goldpet.domain.aiprofile.dto.CreateAIProfileRequest
import com.goldpet.domain.aiprofile.entity.AIProfileRequest
import com.goldpet.domain.aiprofile.entity.AIRequestStatus
import com.goldpet.domain.aiprofile.entity.AIRequestType
import com.goldpet.domain.aiprofile.repository.AIProfileRequestRepository
import com.goldpet.domain.aiprofile.repository.AIStyleRepository
import com.goldpet.domain.common.exception.*
import com.goldpet.domain.common.service.SystemSettingService
import com.goldpet.domain.gold.service.GoldService
import com.goldpet.domain.gold.dto.SpendRequest
import com.goldpet.domain.pet.repository.PetRepository
import com.goldpet.domain.user.repository.UserRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
@Transactional(readOnly = true)
class AIProfileService(
    private val aiRequestRepository: AIProfileRequestRepository,
    private val userRepository: UserRepository,
    private val petRepository: PetRepository,
    private val goldService: GoldService,
    private val aiGenerationClient: AIGenerationClient,
    private val aiStyleRepository: AIStyleRepository,
    private val systemSettingService: SystemSettingService
) {
    fun getStyles(): List<AIStyleOption> {
        return aiStyleRepository.findAllByIsActiveTrueOrderByDisplayOrderAsc().map { style ->
            AIStyleOption(style.id, style.name, style.description ?: "", style.previewUrl ?: "", style.goldCost, style.presetId)
        }
    }

    fun getMyRequests(userId: Long, pageable: Pageable): Page<AIProfileRequestResponse> {
        return aiRequestRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageable)
            .map { AIProfileRequestResponse.from(it) }
    }

    fun getPetRequests(petId: Long, pageable: Pageable): Page<AIProfileRequestResponse> {
        return aiRequestRepository.findAllByPetIdOrderByCreatedAtDesc(petId, pageable)
            .map { AIProfileRequestResponse.from(it) }
    }

    fun getRequest(requestId: Long): AIProfileRequestResponse {
        val request = aiRequestRepository.findById(requestId)
            .orElseThrow { NotFoundException("Request not found") }
        return AIProfileRequestResponse.from(request)
    }

    fun getPendingCount(userId: Long): Long {
        return aiRequestRepository.countByUserIdAndStatus(userId, AIRequestStatus.PENDING) +
               aiRequestRepository.countByUserIdAndStatus(userId, AIRequestStatus.PROCESSING)
    }

    fun getDailyUsage(userId: Long): Map<String, Int> {
        val today = LocalDate.now()
        val startOfDay = today.atStartOfDay()
        val startOfNextDay = today.plusDays(1).atStartOfDay()
        val dailyLimit = systemSettingService.getInt("ai.profile.daily-limit", 5)
        val usedToday = aiRequestRepository.countByUserIdAndCreatedAtBetween(userId, startOfDay, startOfNextDay).toInt()
        return mapOf(
            "used" to usedToday,
            "limit" to dailyLimit,
            "remaining" to maxOf(0, dailyLimit - usedToday)
        )
    }

    @Transactional
    fun createRequest(userId: Long, request: CreateAIProfileRequest): AIProfileRequestResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { NotFoundException("User not found") }
        val pet = petRepository.findById(request.petId)
            .orElseThrow { NotFoundException("Pet not found") }

        // 펫 소유자 확인
        if (pet.owner.id != userId) {
            throw ForbiddenException("Not your pet")
        }

        // 일일 생성 한도 체크
        val today = LocalDate.now()
        val startOfDay = today.atStartOfDay()
        val startOfNextDay = today.plusDays(1).atStartOfDay()
        val dailyLimit = systemSettingService.getInt("ai.profile.daily-limit", 5)
        val usedToday = aiRequestRepository.countByUserIdAndCreatedAtBetween(userId, startOfDay, startOfNextDay)
        if (usedToday >= dailyLimit) {
            throw BadRequestException("일일 AI 프로필 생성 한도($dailyLimit 회)를 초과했습니다. 내일 다시 시도해주세요.")
        }

        // 골드 비용 계산
        val goldCost = when (request.type) {
            AIRequestType.IMAGE -> 10
            AIRequestType.VIDEO -> 30
            AIRequestType.AVATAR -> 50
        }

        // 골드 차감
        goldService.spendGold(userId, SpendRequest(
            amount = goldCost,
            description = "AI 프로필 생성 (${request.type})",
            referenceType = "AI_PROFILE",
            referenceId = null
        ))

        val aiRequest = AIProfileRequest(
            user = user,
            pet = pet,
            type = request.type,
            sourceImageUrl = request.sourceImageUrl,
            stylePrompt = request.stylePrompt,
            goldCost = goldCost
        )

        val saved = aiRequestRepository.save(aiRequest)

        // AI 서비스 연동 요청
        aiGenerationClient.requestGeneration(saved)

        return AIProfileRequestResponse.from(saved)
    }

    @Transactional
    fun applyResultAsProfile(requestId: Long, userId: Long, applyAs: String): AIProfileRequestResponse {
        val request = aiRequestRepository.findById(requestId)
            .orElseThrow { NotFoundException("Request not found") }

        if (request.user.id != userId) {
            throw ForbiddenException("Not authorized")
        }

        if (request.status != AIRequestStatus.COMPLETED) {
            throw BadRequestException("AI 생성이 완료된 요청만 적용할 수 있습니다.")
        }

        val resultUrl = request.resultUrl
            ?: throw BadRequestException("결과 이미지가 없습니다.")

        val pet = request.pet
        when (applyAs.uppercase()) {
            "MAIN" -> {
                pet.profileImageUrl = resultUrl
            }
            "ADDITIONAL" -> {
                // Additional profile images handled via PetProfileImage entity
                // For now just update the main profile URL as well
                pet.profileImageUrl = resultUrl
            }
            else -> throw BadRequestException("applyAs must be MAIN or ADDITIONAL")
        }

        return AIProfileRequestResponse.from(request)
    }

    @Transactional
    fun cancelRequest(requestId: Long, userId: Long) {
        val request = aiRequestRepository.findById(requestId)
            .orElseThrow { NotFoundException("Request not found") }

        if (request.user.id != userId) {
            throw ForbiddenException("Not authorized")
        }

        if (request.status != AIRequestStatus.PENDING) {
            throw BadRequestException("Cannot cancel non-pending request")
        }
        
        // 골드 환불
        goldService.systemRefund(userId, request.goldCost, "AI 프로필 요청 취소 환불", "AI_PROFILE_CANCEL", requestId)
        
        aiRequestRepository.delete(request)
    }
}
