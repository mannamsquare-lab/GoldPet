package com.goldpet.domain.user.controller

import com.goldpet.domain.user.dto.DeleteAccountRequest
import com.goldpet.domain.user.dto.ProfileImageUpdateRequest
import com.goldpet.domain.user.dto.UserProfileUpdateRequest
import com.goldpet.domain.user.dto.UserResponse
import com.goldpet.domain.user.dto.FriendLocationResponse
import com.goldpet.domain.user.dto.NotificationSettingsRequest
import com.goldpet.domain.user.dto.NotificationSettingsResponse
import com.goldpet.domain.user.dto.PrivacySettingsRequest
import com.goldpet.domain.user.dto.PrivacySettingsResponse
import com.goldpet.domain.user.entity.ConsentType
import com.goldpet.domain.user.service.ConsentHistoryResponse
import com.goldpet.domain.user.service.ConsentService
import com.goldpet.domain.user.service.UserDataExportService
import com.goldpet.domain.user.service.UserService
import com.goldpet.domain.walk.dto.BoundingBoxRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import com.goldpet.domain.user.entity.User
import com.goldpet.config.security.UserPrincipal

data class RecordConsentRequest(
    val consentType: String,
    val isAgreed: Boolean,
    val version: String? = null
)

@RestController
@RequestMapping("/api/v1/users")
class UserController(
    private val userService: UserService,
    private val consentService: ConsentService,
    private val userDataExportService: UserDataExportService
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

    @DeleteMapping("/me")
    fun deleteMyAccount(
        @AuthenticationPrincipal principal: UserDetails,
        @RequestBody(required = false) request: DeleteAccountRequest?
    ): ResponseEntity<Void> {
        val userId = userService.getUserIdFromPrincipal(principal)
        userService.deleteMyAccount(userId, request?.reason)
        return ResponseEntity.noContent().build()
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

    @GetMapping("/me/notification-settings")
    fun getNotificationSettings(
        @AuthenticationPrincipal principal: UserDetails
    ): ResponseEntity<NotificationSettingsResponse> {
        val userId = userService.getUserIdFromPrincipal(principal)
        return ResponseEntity.ok(userService.getNotificationSettings(userId))
    }

    @PutMapping("/me/notification-settings")
    fun updateNotificationSettings(
        @AuthenticationPrincipal principal: UserDetails,
        @RequestBody request: NotificationSettingsRequest
    ): ResponseEntity<NotificationSettingsResponse> {
        val userId = userService.getUserIdFromPrincipal(principal)
        return ResponseEntity.ok(userService.updateNotificationSettings(userId, request))
    }

    @GetMapping("/me/privacy-settings")
    fun getPrivacySettings(
        @AuthenticationPrincipal principal: UserDetails
    ): ResponseEntity<PrivacySettingsResponse> {
        val userId = userService.getUserIdFromPrincipal(principal)
        return ResponseEntity.ok(userService.getPrivacySettings(userId))
    }

    @PutMapping("/me/privacy-settings")
    fun updatePrivacySettings(
        @AuthenticationPrincipal principal: UserDetails,
        @RequestBody request: PrivacySettingsRequest
    ): ResponseEntity<PrivacySettingsResponse> {
        val userId = userService.getUserIdFromPrincipal(principal)
        return ResponseEntity.ok(userService.updatePrivacySettings(userId, request))
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

    @GetMapping("/me/consents")
    fun getConsentHistory(@AuthenticationPrincipal principal: UserDetails): ResponseEntity<List<ConsentHistoryResponse>> {
        val userId = userService.getUserIdFromPrincipal(principal)
        return ResponseEntity.ok(consentService.getConsentHistory(userId))
    }

    @PostMapping("/me/consents")
    fun recordConsent(
        @AuthenticationPrincipal principal: UserDetails,
        @RequestBody request: RecordConsentRequest,
        httpRequest: jakarta.servlet.http.HttpServletRequest
    ): ResponseEntity<ConsentHistoryResponse> {
        val userId = userService.getUserIdFromPrincipal(principal)
        val consent = consentService.recordConsent(
            userId = userId,
            consentType = ConsentType.valueOf(request.consentType),
            isAgreed = request.isAgreed,
            version = request.version ?: "1.0",
            ipAddress = httpRequest.remoteAddr
        )
        return ResponseEntity.ok(ConsentHistoryResponse.from(consent))
    }

    @GetMapping("/me/data-export")
    fun exportMyData(@AuthenticationPrincipal principal: UserDetails): ResponseEntity<Map<String, Any?>> {
        val userId = userService.getUserIdFromPrincipal(principal)
        val data = userDataExportService.exportUserData(userId)
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=goldpet-data-export.json")
            .body(data)
    }
}
