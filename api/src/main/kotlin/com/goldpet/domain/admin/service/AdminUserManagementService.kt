package com.goldpet.domain.admin.service

import com.goldpet.domain.admin.controller.*
import com.goldpet.domain.common.exception.*
import com.goldpet.domain.community.repository.CommunityCommentRepository
import com.goldpet.domain.community.repository.CommunityPostRepository
import com.goldpet.domain.pet.repository.PetRepository
import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.entity.UserStatus
import com.goldpet.domain.user.repository.UserRepository
import com.goldpet.domain.user.service.UserService
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.format.DateTimeFormatter

@Service
class AdminUserManagementService(
    private val userRepository: UserRepository,
    private val petRepository: PetRepository,
    private val postRepository: CommunityPostRepository,
    private val commentRepository: CommunityCommentRepository,
    private val userService: UserService
) {
    private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")

    fun getUsers(pageable: Pageable, search: String?, status: String?): Page<UserListItemResponse> {
        val usersPage = when {
            !search.isNullOrBlank() -> userRepository.findByNicknameContainingIgnoreCase(search, pageable)
            else -> userRepository.findAll(pageable)
        }

        return usersPage.map { user -> toUserListItem(user) }
    }

    fun getUserDetail(userId: Long): UserDetailResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { NotFoundException("User not found: $userId") }

        val pets = petRepository.findAllByOwnerId(userId)
        val postCount = postRepository.countByUserId(userId)
        val commentCount = commentRepository.countByUserId(userId)

        return UserDetailResponse(
            id = user.id,
            email = user.email,
            nickname = user.nickname ?: "",
            introduce = null,
            profileImageUrl = user.profileImageUrl,
            status = user.status.name,
            provider = user.oauthProvider,
            goldBalance = user.goldBalance.toLong(),
            createdAt = user.createdAt.format(formatter),
            lastLoginAt = null,
            pets = pets.map { pet ->
                PetSummary(
                    id = pet.id,
                    name = pet.name,
                    species = pet.species.name,
                    breed = pet.breed?.name
                )
            },
            stats = UserStats(
                totalWalks = 0,
                totalDistance = 0.0,
                totalPosts = postCount.toInt(),
                totalComments = commentCount.toInt(),
                badgeCount = 0
            )
        )
    }

    @Transactional
    fun updateUserStatus(userId: Long, status: String, reason: String?) {
        val user = userRepository.findById(userId)
            .orElseThrow { NotFoundException("User not found: $userId") }

        user.status = UserStatus.valueOf(status)
        userRepository.save(user)
    }

    @Transactional
    fun deleteUser(userId: Long) {
        userService.adminDeleteAccount(userId, reason = "관리자에 의한 삭제")
    }

    @Transactional
    fun unlockUserProfile(userId: Long) {
        val user = userRepository.findById(userId)
            .orElseThrow { NotFoundException("User not found: $userId") }
        user.profileLockedAt = null
        userRepository.save(user)
    }

    fun searchUsers(query: String, limit: Int): List<UserListItemResponse> {
        return userRepository.findByNicknameContainingIgnoreCase(query, Pageable.ofSize(limit))
            .content
            .map { toUserListItem(it) }
    }

    private fun toUserListItem(user: User): UserListItemResponse {
        val petCount = petRepository.countByOwnerId(user.id)
        val postCount = postRepository.countByUserId(user.id)

        return UserListItemResponse(
            id = user.id,
            email = user.email,
            nickname = user.nickname ?: "",
            profileImageUrl = user.profileImageUrl,
            status = user.status.name,
            petCount = petCount.toInt(),
            walkCount = 0,
            postCount = postCount.toInt(),
            createdAt = user.createdAt.format(formatter),
            lastLoginAt = null
        )
    }
}
