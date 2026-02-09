package com.goldpet.domain.aiprofile.service

import com.goldpet.domain.aiprofile.dto.AIProfileRequestResponse
import com.goldpet.domain.aiprofile.dto.AIStyleOption
import com.goldpet.domain.aiprofile.dto.CreateAIProfileRequest
import com.goldpet.domain.aiprofile.entity.AIProfileRequest
import com.goldpet.domain.aiprofile.entity.AIRequestStatus
import com.goldpet.domain.aiprofile.entity.AIRequestType
import com.goldpet.domain.aiprofile.repository.AIProfileRequestRepository
import com.goldpet.domain.aiprofile.repository.AIStyleRepository
import com.goldpet.domain.gold.service.GoldService
import com.goldpet.domain.gold.dto.SpendRequest
import com.goldpet.domain.pet.repository.PetRepository
import com.goldpet.domain.user.repository.UserRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class AIProfileService(
    private val aiRequestRepository: AIProfileRequestRepository,
    private val userRepository: UserRepository,
    private val petRepository: PetRepository,
    private val goldService: GoldService,
    private val aiGenerationClient: AIGenerationClient,
    private val aiStyleRepository: AIStyleRepository
) {
    fun getStyles(): List<AIStyleOption> {
        return aiStyleRepository.findAllByIsActiveTrueOrderByDisplayOrderAsc().map { style ->
            AIStyleOption(style.id, style.name, style.description ?: "", style.previewUrl ?: "", style.goldCost)
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
            .orElseThrow { IllegalArgumentException("Request not found") }
        return AIProfileRequestResponse.from(request)
    }

    fun getPendingCount(userId: Long): Long {
        return aiRequestRepository.countByUserIdAndStatus(userId, AIRequestStatus.PENDING) +
               aiRequestRepository.countByUserIdAndStatus(userId, AIRequestStatus.PROCESSING)
    }

    @Transactional
    fun createRequest(userId: Long, request: CreateAIProfileRequest): AIProfileRequestResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }
        val pet = petRepository.findById(request.petId)
            .orElseThrow { IllegalArgumentException("Pet not found") }
        
        // 펫 소유자 확인
        if (pet.owner.id != userId) {
            throw IllegalArgumentException("Not your pet")
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
    fun cancelRequest(requestId: Long, userId: Long) {
        val request = aiRequestRepository.findById(requestId)
            .orElseThrow { IllegalArgumentException("Request not found") }
        
        if (request.user.id != userId) {
            throw IllegalArgumentException("Not authorized")
        }
        
        if (request.status != AIRequestStatus.PENDING) {
            throw IllegalArgumentException("Cannot cancel non-pending request")
        }
        
        // 골드 환불
        goldService.grantReward(userId, request.goldCost, "AI 프로필 요청 취소 환불")
        
        aiRequestRepository.delete(request)
    }
}
