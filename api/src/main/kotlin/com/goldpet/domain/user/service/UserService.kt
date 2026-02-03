package com.goldpet.domain.user.service

import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.repository.UserRepository
import com.goldpet.domain.walk.dto.BoundingBoxRequest
import com.goldpet.domain.user.dto.FriendLocationResponse
import com.goldpet.domain.user.dto.ProfileImageUpdateRequest
import com.goldpet.domain.user.entity.UserProfileImage
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class UserService(
    private val userRepository: UserRepository,
    private val interestRepository: com.goldpet.domain.user.repository.InterestRepository,
    private val hobbyRepository: com.goldpet.domain.user.repository.HobbyRepository
) {
    fun findUserById(userId: Long): User? {
        return userRepository.findById(userId).orElse(null)
    }

    fun findUserByUsername(username: String): User? {
        return userRepository.findByUsername(username).orElse(null)
    }

    fun getUserIdFromPrincipal(principal: org.springframework.security.core.userdetails.UserDetails): Long {
        if (principal is com.goldpet.config.security.UserPrincipal) {
            return principal.id
        }
        // Fallback or AdminUserPrincipal handling if needed
        val user = userRepository.findByUsername(principal.username)
            .orElseThrow { IllegalArgumentException("User not found") }
        return user.id
    }

    @Transactional
    fun createUser(oauthProvider: String, oauthId: String, nickname: String?): User {
        val user = User(
            oauthProvider = oauthProvider,
            oauthId = oauthId,
            nickname = nickname,
            email = null, // Email will be set later if provided by OAuth
            gender = null,
            birthYear = null,
            mainLocationText = null,
            mainLocationGeom = null,

            profileImageUrl = null,
            username = null,
            password = null,
            name = null,
            birthDate = null,
            phoneNumber = null
        )
        return userRepository.save(user)
    }

    @Transactional
    fun updateNotification(userId: Long, enabled: Boolean): User {
        val user = userRepository.findById(userId).orElseThrow { NoSuchElementException("User not found with id: $userId") }
        user.isNotificationEnabled = enabled
        return userRepository.save(user)
    }

    @Transactional
    fun updateUserProfile(userId: Long, request: com.goldpet.domain.user.dto.UserProfileUpdateRequest): User {
        val user = userRepository.findById(userId).orElseThrow { NoSuchElementException("User not found with id: $userId") }
        
        println("DEBUG: Updating user profile. Request hasPet: ${request.hasPet}")


        request.name?.let { user.name = it }
        request.nickname?.let { user.nickname = it }
        request.birthDate?.let { user.birthDate = java.time.LocalDate.parse(it) }
        request.phoneNumber?.let { user.phoneNumber = it }
        request.gender?.let { user.gender = it }
        request.hasPet?.let { user.hasPet = it }
        request.intro?.let { user.intro = it }
        request.mbti?.let { user.mbti = it }
        
        // Update tags
        if (request.interests.isNotEmpty()) {
            val interests = interestRepository.findByNameIn(request.interests)
            user.interests.clear()
            user.interests.addAll(interests)
        }
        
        if (request.hobbies.isNotEmpty()) {
            val hobbies = hobbyRepository.findByNameIn(request.hobbies)
            user.hobbies.clear()
            user.hobbies.addAll(hobbies)
        }

        return userRepository.save(user)
    }

    fun getAllInterests(): List<com.goldpet.domain.user.entity.Interest> {
        return interestRepository.findAllByOrderByOrderIndexAsc()
    }

    fun getAllHobbies(): List<com.goldpet.domain.user.entity.Hobby> {
        return hobbyRepository.findAllByOrderByOrderIndexAsc()
    }

    @Transactional
    fun updateUserProfileImages(userId: Long, request: ProfileImageUpdateRequest): User {
        val user = userRepository.findById(userId).orElseThrow { NoSuchElementException("User not found with id: $userId") }
        
        request.profileImageUrl?.let { user.profileImageUrl = it }
        request.profileImageUrls?.let { urls ->
            user.profileImages.clear()
            urls.forEachIndexed { index, url ->
                user.profileImages.add(UserProfileImage(user = user, imageUrl = url, orderIndex = index))
            }
            user.profileImageUrl = urls.firstOrNull()
        }
        
        return userRepository.save(user)
    }

    fun findFriendsInArea(request: BoundingBoxRequest): List<FriendLocationResponse> {
        val users = userRepository.findUsersWithinBoundingBox(
            request.minLat,
            request.minLon,
            request.maxLat,
            request.maxLon
        )
        return users.map { FriendLocationResponse.from(it) }
    }

    fun findFriendsNearby(lat: Double, lon: Double, radius: Double): List<FriendLocationResponse> {
        val users = userRepository.findUsersWithinRadius(lat, lon, radius)
        return users.map { user ->
            val userLat = user.mainLocationGeom?.y ?: 0.0
            val userLon = user.mainLocationGeom?.x ?: 0.0
            val distance = calculateDistancedInMeters(lat, lon, userLat, userLon)
            FriendLocationResponse.from(user, distance)
        }
    }

    private fun calculateDistancedInMeters(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val R = 6371000.0 // Earth radius in meters
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2)
        val c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    fun isNicknameAvailable(nickname: String): Boolean {
        return !userRepository.findByNickname(nickname).isPresent
    }
}
