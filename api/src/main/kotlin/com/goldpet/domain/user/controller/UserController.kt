package com.goldpet.domain.user.controller

import com.goldpet.domain.user.dto.ProfileImageUpdateRequest
import com.goldpet.domain.user.dto.UserProfileUpdateRequest
import com.goldpet.domain.user.dto.UserResponse
import com.goldpet.domain.user.dto.FriendLocationResponse
import com.goldpet.domain.user.service.UserService
import com.goldpet.domain.walk.dto.BoundingBoxRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import com.goldpet.domain.user.entity.User

@RestController
@RequestMapping("/api/v1/users")
class UserController(
    private val userService: UserService
) {
    // TODO: 실제 인증 구현 시 @AuthenticationPrincipal 등을 사용하여 userId를 가져오도록 변경

    @GetMapping("/me")
    fun getMyProfile(@AuthenticationPrincipal principal: UserDetails): ResponseEntity<UserResponse> {
        val userId = if (principal is com.goldpet.config.security.UserPrincipal) {
            principal.id
        } else {
            userService.getUserIdFromPrincipal(principal)
        }
        
        val user = userService.findUserById(userId)
        return if (user != null) {
            ResponseEntity.ok(UserResponse.from(user))
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @PutMapping("/me")
    fun updateMyProfile(
        @AuthenticationPrincipal principal: UserDetails,
        @RequestBody request: UserProfileUpdateRequest
    ): ResponseEntity<UserResponse> {
        val userId = userService.getUserIdFromPrincipal(principal)
        val updatedUser = userService.updateUserProfile(
            userId,
            request.nickname,
            request.gender,
            request.birthYear,
            request.mainLocationText
        )
        return ResponseEntity.ok(UserResponse.from(updatedUser))
    }

    @PutMapping("/me/profile-image")
    fun updateMyProfileImage(
        @AuthenticationPrincipal principal: UserDetails,
        @RequestBody request: ProfileImageUpdateRequest
    ): ResponseEntity<UserResponse> {
        val userId = userService.getUserIdFromPrincipal(principal)
        val updatedUser = userService.updateUserProfileImageUrl(
            userId,
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
