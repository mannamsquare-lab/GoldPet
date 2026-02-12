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
            request
        )
        return ResponseEntity.ok(UserResponse.from(updatedUser))
    }

    @PutMapping("/me/profile-image")
    fun updateMyProfileImage(
        @AuthenticationPrincipal principal: UserDetails,
        @RequestBody request: ProfileImageUpdateRequest
    ): ResponseEntity<UserResponse> {
        val userId = userService.getUserIdFromPrincipal(principal)
        val updatedUser = userService.updateUserProfileImages(
            userId,
            request
        )
        return ResponseEntity.ok(UserResponse.from(updatedUser))
    }

    @PatchMapping("/me/notification")
    fun updateNotification(
        @AuthenticationPrincipal principal: UserDetails,
        @RequestBody request: Map<String, Boolean>
    ): ResponseEntity<UserResponse> {
        val userId = userService.getUserIdFromPrincipal(principal)
        val enabled = request["enabled"] ?: throw IllegalArgumentException("enabled field is required")
        val updatedUser = userService.updateNotification(userId, enabled)
        return ResponseEntity.ok(UserResponse.from(updatedUser))
    }

    @PutMapping("/me/fcm-token")
    fun updateFcmToken(
        @AuthenticationPrincipal principal: UserDetails,
        @RequestBody request: Map<String, String?>
    ): ResponseEntity<Void> {
        val userId = userService.getUserIdFromPrincipal(principal)
        val fcmToken = request["fcmToken"]
        userService.updateFcmToken(userId, fcmToken)
        return ResponseEntity.ok().build()
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

    @GetMapping("/search/nearby")
    fun searchFriendsNearby(
        @RequestParam lat: Double,
        @RequestParam lon: Double,
        @RequestParam radius: Double
    ): ResponseEntity<List<FriendLocationResponse>> {
        val friendLocations = userService.findFriendsNearby(lat, lon, radius)
        return ResponseEntity.ok(friendLocations)
    }

    @GetMapping("/interests")
    fun getAllInterests(): ResponseEntity<List<com.goldpet.domain.user.entity.Interest>> {
        return ResponseEntity.ok(userService.getAllInterests())
    }

    @GetMapping("/hobbies")
    fun getAllHobbies(): ResponseEntity<List<com.goldpet.domain.user.entity.Hobby>> {
        return ResponseEntity.ok(userService.getAllHobbies())
    }

    @GetMapping("/check-nickname")
    fun checkNicknameAvailability(@RequestParam nickname: String): ResponseEntity<Map<String, Boolean>> {
        val isAvailable = userService.isNicknameAvailable(nickname)
        return ResponseEntity.ok(mapOf("available" to isAvailable))
    }
}
