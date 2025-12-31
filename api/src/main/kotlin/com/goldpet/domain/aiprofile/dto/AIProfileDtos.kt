package com.goldpet.domain.aiprofile.dto

import com.goldpet.domain.aiprofile.entity.AIProfileRequest
import com.goldpet.domain.aiprofile.entity.AIRequestStatus
import com.goldpet.domain.aiprofile.entity.AIRequestType
import java.time.LocalDateTime

data class CreateAIProfileRequest(
    val petId: Long,
    val type: AIRequestType,
    val sourceImageUrl: String,
    val stylePrompt: String? = null
)

data class AIProfileRequestResponse(
    val id: Long,
    val petId: Long,
    val petName: String,
    val type: AIRequestType,
    val sourceImageUrl: String,
    val stylePrompt: String?,
    val status: AIRequestStatus,
    val resultUrl: String?,
    val errorMessage: String?,
    val goldCost: Int,
    val createdAt: LocalDateTime?
) {
    companion object {
        fun from(request: AIProfileRequest) = AIProfileRequestResponse(
            id = request.id,
            petId = request.pet.id,
            petName = request.pet.name,
            type = request.type,
            sourceImageUrl = request.sourceImageUrl,
            stylePrompt = request.stylePrompt,
            status = request.status,
            resultUrl = request.resultUrl,
            errorMessage = request.errorMessage,
            goldCost = request.goldCost,
            createdAt = request.createdAt
        )
    }
}

data class AIStyleOption(
    val id: String,
    val name: String,
    val description: String,
    val previewUrl: String,
    val goldCost: Int
)
