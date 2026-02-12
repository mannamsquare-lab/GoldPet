package com.goldpet.domain.friend.controller

import com.goldpet.config.security.UserPrincipal
import com.goldpet.domain.friend.dto.FriendResponse
import com.goldpet.domain.friend.dto.LikeResponse
import com.goldpet.domain.friend.service.FriendService
import com.goldpet.domain.friend.service.LikeService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@Tag(name = "Like", description = "좋아요 API")
@RestController
@RequestMapping("/api/v1/friends")
class LikeController(
    private val likeService: LikeService,
    private val friendService: FriendService,
    private val petRepository: com.goldpet.domain.pet.repository.PetRepository
) {
    @Operation(summary = "좋아요", description = "친구에게 좋아요를 보냅니다.")
    @PostMapping("/{targetUserId}/like")
    fun likeUser(
        @AuthenticationPrincipal principal: UserPrincipal,
        @PathVariable targetUserId: Long
    ): ResponseEntity<LikeResponse> {
        val response = likeService.likeUser(principal.id, targetUserId)
        return ResponseEntity.ok(response)
    }

    @Operation(summary = "좋아요 취소", description = "좋아요를 취소합니다.")
    @DeleteMapping("/{targetUserId}/like")
    fun unlikeUser(
        @AuthenticationPrincipal principal: UserPrincipal,
        @PathVariable targetUserId: Long
    ): ResponseEntity<Map<String, Boolean>> {
        val success = likeService.unlikeUser(principal.id, targetUserId)
        return ResponseEntity.ok(mapOf("success" to success))
    }

    @Operation(summary = "좋아요 거절", description = "나에게 온 좋아요를 거절합니다.")
    @DeleteMapping("/likes/received/{senderId}")
    fun rejectLike(
        @AuthenticationPrincipal principal: UserPrincipal,
        @PathVariable senderId: Long
    ): ResponseEntity<Map<String, Boolean>> {
        val success = likeService.rejectLike(principal.id, senderId)
        return ResponseEntity.ok(mapOf("success" to success))
    }

    @Operation(summary = "내가 좋아해 목록", description = "내가 좋아요한 사용자 목록을 조회합니다.")
    @GetMapping("/likes/my")
    fun getMyLikes(
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<List<FriendResponse>> {
        val users = likeService.getMyLikes(principal.id)
        val responses = users.map { user ->
            val pets = petRepository.findByOwnerId(user.id)
            val mainPet = pets.firstOrNull()
            
            FriendResponse(
                id = user.id,
                nickname = user.nickname ?: "Unknown",
                profileImageUrl = user.profileImageUrl,
                petName = mainPet?.name ?: "",
                petBreed = mainPet?.breed?.name ?: "",
                petAge = mainPet?.birthDate?.let { java.time.Period.between(it, java.time.LocalDate.now()).years } ?: 0,
                petGender = mainPet?.gender ?: "UNKNOWN",
                isNeutered = mainPet?.isNeutered ?: false,
                // Walk 레코드는 산책 완료 후 생성됨 (startTime, endTime 모두 NOT NULL).
                // 실시간 산책 상태는 앱 클라이언트에서 관리하며, 서버에 별도 tracking API 구현 시 연동 가능.
                onWalking = false,
                description = user.intro ?: "",
                tags = mainPet?.temperamentTags?.split(",")?.map { it.trim() } ?: emptyList(),
                images = mainPet?.profileImageUrl?.let { listOf(it) } ?: (user.profileImageUrl?.let { listOf(it) } ?: emptyList()),
                // 위치 기반 거리 계산은 위치 공유 기능 구현 시 추가
                distance = 0.0,
                status = "offline",
                location = null,
                locationText = user.mainLocationText
            )
        }
        return ResponseEntity.ok(responses)
    }

    @Operation(summary = "서로 좋아해 목록", description = "서로 좋아요한 사용자 목록을 조회합니다.")
    @GetMapping("/likes/mutual")
    fun getMutualLikes(
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<List<FriendResponse>> {
        val users = likeService.getMutualLikes(principal.id)
        val responses = users.map { user ->
            val pets = petRepository.findByOwnerId(user.id)
            val mainPet = pets.firstOrNull()

            FriendResponse(
                id = user.id,
                nickname = user.nickname ?: "Unknown",
                profileImageUrl = user.profileImageUrl,
                petName = mainPet?.name ?: "",
                petBreed = mainPet?.breed?.name ?: "",
                petAge = mainPet?.birthDate?.let { java.time.Period.between(it, java.time.LocalDate.now()).years } ?: 0,
                petGender = mainPet?.gender ?: "UNKNOWN",
                isNeutered = mainPet?.isNeutered ?: false,
                // Walk 레코드는 산책 완료 후 생성됨 (startTime, endTime 모두 NOT NULL).
                // 실시간 산책 상태는 앱 클라이언트에서 관리하며, 서버에 별도 tracking API 구현 시 연동 가능.
                onWalking = false,
                description = user.intro ?: "",
                tags = mainPet?.temperamentTags?.split(",")?.map { it.trim() } ?: emptyList(),
                images = mainPet?.profileImageUrl?.let { listOf(it) } ?: (user.profileImageUrl?.let { listOf(it) } ?: emptyList()),
                // 위치 기반 거리 계산은 위치 공유 기능 구현 시 추가
                distance = 0.0,
                status = "offline",
                location = null,
                locationText = user.mainLocationText
            )
        }
        return ResponseEntity.ok(responses)
    }

    @Operation(summary = "나를 좋아해 목록", description = "나를 좋아요한 사용자 목록을 조회합니다.")
    @GetMapping("/likes/received")
    fun getReceivedLikes(
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<List<FriendResponse>> {
        val users = likeService.getReceivedLikes(principal.id)
        val responses = users.map { user ->
            val pets = petRepository.findByOwnerId(user.id)
            val mainPet = pets.firstOrNull()

            FriendResponse(
                id = user.id,
                nickname = user.nickname ?: "Unknown",
                profileImageUrl = user.profileImageUrl,
                petName = mainPet?.name ?: "",
                petBreed = mainPet?.breed?.name ?: "",
                petAge = mainPet?.birthDate?.let { java.time.Period.between(it, java.time.LocalDate.now()).years } ?: 0,
                petGender = mainPet?.gender ?: "UNKNOWN",
                isNeutered = mainPet?.isNeutered ?: false,
                // Walk 레코드는 산책 완료 후 생성됨 (startTime, endTime 모두 NOT NULL).
                // 실시간 산책 상태는 앱 클라이언트에서 관리하며, 서버에 별도 tracking API 구현 시 연동 가능.
                onWalking = false,
                description = user.intro ?: "",
                tags = mainPet?.temperamentTags?.split(",")?.map { it.trim() } ?: emptyList(),
                images = mainPet?.profileImageUrl?.let { listOf(it) } ?: (user.profileImageUrl?.let { listOf(it) } ?: emptyList()),
                // 위치 기반 거리 계산은 위치 공유 기능 구현 시 추가
                distance = 0.0,
                status = "offline",
                location = null,
                locationText = user.mainLocationText
            )
        }
        return ResponseEntity.ok(responses)
    }

    @Operation(summary = "좋아요 상태 확인", description = "특정 사용자에게 좋아요를 눌렀는지 확인합니다.")
    @GetMapping("/{targetUserId}/like/status")
    fun checkLikeStatus(
        @AuthenticationPrincipal principal: UserPrincipal,
        @PathVariable targetUserId: Long
    ): ResponseEntity<Map<String, Boolean>> {
        val hasLiked = likeService.hasLiked(principal.id, targetUserId)
        return ResponseEntity.ok(mapOf("hasLiked" to hasLiked))
    }
}
