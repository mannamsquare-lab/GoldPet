package com.goldpet.domain.friend.service

import com.goldpet.domain.common.exception.*
import com.goldpet.domain.common.util.toHttps
import com.goldpet.domain.friend.dto.BlockedUserResponse
import com.goldpet.domain.friend.dto.MatchResponse
import com.goldpet.domain.friend.entity.Like
import com.goldpet.domain.friend.entity.Match
import com.goldpet.domain.friend.entity.UserBlock
import com.goldpet.domain.friend.repository.LikeRepository
import com.goldpet.domain.friend.repository.MatchRepository
import com.goldpet.domain.friend.repository.UserBlockRepository
import com.goldpet.domain.gamification.entity.BadgeConditionType
import com.goldpet.domain.gamification.service.BadgeAwardService
import com.goldpet.domain.pet.repository.PetRepository
import com.goldpet.domain.user.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.format.DateTimeFormatter

@Service
class MatchService(
    private val likeRepository: LikeRepository,
    private val matchRepository: MatchRepository,
    private val userBlockRepository: UserBlockRepository,
    private val userRepository: UserRepository,
    private val badgeAwardService: BadgeAwardService,
    private val petRepository: PetRepository
) {
    private val log = LoggerFactory.getLogger(MatchService::class.java)
    private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")

    @Transactional
    fun likeUser(fromUserId: Long, toUserId: Long): Boolean {
        val fromUser = userRepository.findById(fromUserId).orElseThrow { NotFoundException("User not found: $fromUserId") }
        val toUser = userRepository.findById(toUserId).orElseThrow { NotFoundException("User not found: $toUserId") }

        // Bidirectional block check
        if (userBlockRepository.existsByBlockerAndBlocked(toUser, fromUser)
            || userBlockRepository.existsByBlockerAndBlocked(fromUser, toUser)) {
            throw ForbiddenException("Blocked user")
        }

        // Check if 'like' already exists
        if (likeRepository.findByFromUserAndToUser(fromUser, toUser).isPresent) {
            return false
        }

        // Create and save the like
        val like = Like(fromUser = fromUser, toUser = toUser)
        likeRepository.save(like)

        // Check for mutual like
        val mutualLike = likeRepository.findByFromUserAndToUser(toUser, fromUser)
        if (mutualLike.isPresent) {
            val user1 = if (fromUser.id < toUser.id) fromUser else toUser
            val user2 = if (fromUser.id < toUser.id) toUser else fromUser

            if (matchRepository.findByUser1AndUser2(user1, user2).isEmpty) {
                val match = Match(user1 = user1, user2 = user2)
                matchRepository.save(match)

                try {
                    badgeAwardService.checkAndAwardBadges(fromUserId, BadgeConditionType.FRIEND_MATCH)
                    badgeAwardService.checkAndAwardBadges(toUserId, BadgeConditionType.FRIEND_MATCH)
                } catch (e: Exception) {
                    log.warn("Badge check failed for match between userId={} and userId={}", fromUserId, toUserId, e)
                }

                return true
            }
        }
        return false
    }

    fun getMyMatches(userId: Long): List<MatchResponse> {
        return matchRepository.findAllByUserId(userId).map { match ->
            val partner = if (match.user1.id == userId) match.user2 else match.user1
            MatchResponse(
                matchId = match.id,
                partnerId = partner.id,
                partnerNickname = partner.nickname,
                partnerProfileImage = partner.profileImageUrl.toHttps(),
                matchedAt = match.createdAt.format(formatter)
            )
        }
    }

    fun getMatchDetail(matchId: Long, userId: Long): MatchResponse {
        val match = matchRepository.findById(matchId).orElseThrow { NotFoundException("Match not found: $matchId") }

        if (match.user1.id != userId && match.user2.id != userId) {
            throw ForbiddenException("Not authorized to view this match")
        }

        val partner = if (match.user1.id == userId) match.user2 else match.user1
        return MatchResponse(
            matchId = match.id,
            partnerId = partner.id,
            partnerNickname = partner.nickname,
            partnerProfileImage = partner.profileImageUrl,
            matchedAt = match.createdAt.format(formatter)
        )
    }

    @Transactional
    fun cancelMatch(matchId: Long, userId: Long) {
        val match = matchRepository.findById(matchId).orElseThrow { NotFoundException("Match not found: $matchId") }

        if (match.user1.id != userId && match.user2.id != userId) {
            throw ForbiddenException("Not authorized to cancel this match")
        }

        matchRepository.delete(match)
    }

    @Transactional
    fun blockUser(blockerId: Long, blockedId: Long) {
        if (blockerId == blockedId) {
            throw BadRequestException("Cannot block yourself")
        }

        val blocker = userRepository.findById(blockerId).orElseThrow { NotFoundException("User not found: $blockerId") }
        val blocked = userRepository.findById(blockedId).orElseThrow { NotFoundException("User not found: $blockedId") }

        if (userBlockRepository.existsByBlockerAndBlocked(blocker, blocked)) {
            throw ConflictException("User already blocked")
        }

        val block = UserBlock(blocker = blocker, blocked = blocked)
        userBlockRepository.save(block)

        // Cancel any existing match
        matchRepository.findByUserIds(blockerId, blockedId).ifPresent { match ->
            matchRepository.delete(match)
        }

        // Remove likes
        likeRepository.findByFromUserAndToUser(blocker, blocked).ifPresent { likeRepository.delete(it) }
        likeRepository.findByFromUserAndToUser(blocked, blocker).ifPresent { likeRepository.delete(it) }
    }

    @Transactional
    fun unblockUser(blockerId: Long, blockedId: Long) {
        val blocker = userRepository.findById(blockerId).orElseThrow { NotFoundException("User not found: $blockerId") }
        val blocked = userRepository.findById(blockedId).orElseThrow { NotFoundException("User not found: $blockedId") }

        val block = userBlockRepository.findByBlockerAndBlocked(blocker, blocked)
            .orElseThrow { NotFoundException("Block not found") }
        userBlockRepository.delete(block)
    }

    fun getBlockList(userId: Long): List<BlockedUserResponse> {
        val user = userRepository.findById(userId).orElseThrow { NotFoundException("User not found: $userId") }
        return userBlockRepository.findAllByBlocker(user).map { block ->
            val blockedUser = block.blocked
            val petName = petRepository.findFirstByOwnerIdOrderByCreatedAtAsc(blockedUser.id)?.name
            BlockedUserResponse(
                blockId = block.id,
                blockedUserId = blockedUser.id,
                blockedNickname = blockedUser.nickname,
                blockedProfileImageUrl = blockedUser.profileImageUrl.toHttps(),
                blockedPetName = petName,
                blockedAt = block.createdAt.format(formatter)
            )
        }
    }
}
