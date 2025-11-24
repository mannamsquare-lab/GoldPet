package com.goldpet.domain.user.controller

import com.goldpet.domain.user.dto.ProfileImageUpdateRequest
import com.goldpet.domain.user.dto.UserProfileUpdateRequest
import com.goldpet.domain.user.dto.UserResponse
import com.goldpet.domain.user.dto.FriendLocationResponse
import com.goldpet.domain.user.service.UserService
import com.goldpet.domain.walk.dto.BoundingBoxRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/users")
class UserController(
    private val userService: UserService
) {
    // TODO: 실제 인증 구현 시 @AuthenticationPrincipal 등을 사용하여 userId를 가져오도록 변경
    private val currentUserId: Long = 1L // 임시 사용자 ID

    @GetMapping("/me")
    fun getMyProfile(): ResponseEntity<UserResponse> {
        val user = userService.findUserById(currentUserId)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(UserResponse.from(user))
    }

    @PutMapping("/me")
    fun updateMyProfile(@RequestBody request: UserProfileUpdateRequest): ResponseEntity<UserResponse> {
        val updatedUser = userService.updateUserProfile(
            currentUserId,
            request.nickname,
            request.gender,
            request.birthYear,
            request.mainLocationText
        )
        return ResponseEntity.ok(UserResponse.from(updatedUser))
    }

    @PutMapping("/me/profile-image")
    fun updateMyProfileImage(@RequestBody request: ProfileImageUpdateRequest): ResponseEntity<UserResponse> {
        val updatedUser = userService.updateUserProfileImageUrl(
            currentUserId,
            request.profileImageUrl
        )
        return ResponseEntity.ok(UserResponse.from(updatedUser))
    }

    @GetMapping("/search")
    fun searchFriendsInArea(
        @RequestParam minLat: Double,
        @RequestParam minLon: Double,
        @RequestParam maxLat: Double,
        @RequestParam maxLon: Double
    ): ResponseEntity<List<FriendLocationResponse>> {
        val request = BoundingBoxRequest(minLat, minLon, maxLat, maxLon)
        val friendLocations = userService.findFriendsInArea(request)
        return ResponseEntity.ok(friendLocations)
    }
}
