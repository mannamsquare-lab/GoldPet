package com.goldpet.domain.user.service

import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.repository.UserRepository
import com.goldpet.domain.walk.dto.BoundingBoxRequest
import com.goldpet.domain.user.dto.FriendLocationResponse
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class UserService(
    private val userRepository: UserRepository
) {
    fun findUserById(userId: Long): User? {
        return userRepository.findById(userId).orElse(null)
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
            profileImageUrl = null
        )
        return userRepository.save(user)
    }

    @Transactional
    fun updateUserProfile(userId: Long, nickname: String?, gender: String?, birthYear: Int?, mainLocationText: String?): User {
        val user = userRepository.findById(userId).orElseThrow { NoSuchElementException("User not found with id: $userId") }

        nickname?.let { user.nickname = it }
        gender?.let { user.gender = it }
        birthYear?.let { user.birthYear = it }
        mainLocationText?.let { user.mainLocationText = it }

        return userRepository.save(user)
    }

    @Transactional
    fun updateUserProfileImageUrl(userId: Long, profileImageUrl: String?): User {
        val user = userRepository.findById(userId).orElseThrow { NoSuchElementException("User not found with id: $userId") }
        user.profileImageUrl = profileImageUrl
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
}
