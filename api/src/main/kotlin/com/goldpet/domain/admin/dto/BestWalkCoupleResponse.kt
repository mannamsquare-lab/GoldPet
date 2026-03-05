package com.goldpet.domain.admin.dto

import com.goldpet.domain.walk.entity.BestWalkCouple
import java.time.LocalDateTime

data class BestWalkCoupleResponse(
    val yearMonth: String,
    val userId: Long,
    val nickname: String?,
    val profileImageUrl: String?,
    val petId: Long,
    val petName: String,
    val petProfileImageUrl: String?,
    val selectedBy: Long?,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(bwc: BestWalkCouple): BestWalkCoupleResponse = BestWalkCoupleResponse(
            yearMonth = bwc.yearMonth,
            userId = bwc.user.id,
            nickname = bwc.user.nickname,
            profileImageUrl = bwc.user.profileImageUrl,
            petId = bwc.pet.id,
            petName = bwc.pet.name,
            petProfileImageUrl = bwc.pet.profileImageUrl,
            selectedBy = bwc.selectedBy?.id,
            createdAt = bwc.createdAt
        )
    }
}
