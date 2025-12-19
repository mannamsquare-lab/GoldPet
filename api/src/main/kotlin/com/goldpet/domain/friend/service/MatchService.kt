package com.goldpet.domain.friend.service

import com.goldpet.domain.friend.entity.Like
import com.goldpet.domain.friend.entity.Match
import com.goldpet.domain.friend.repository.LikeRepository
import com.goldpet.domain.friend.repository.MatchRepository
import com.goldpet.domain.user.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class MatchService(
    private val likeRepository: LikeRepository,
    private val matchRepository: MatchRepository,
    private val userRepository: UserRepository
) {

    @Transactional
    fun likeUser(fromUserId: Long, toUserId: Long): Boolean {
        val fromUser = userRepository.findById(fromUserId).orElseThrow { NoSuchElementException("User not found with id: $fromUserId") }
        val toUser = userRepository.findById(toUserId).orElseThrow { NoSuchElementException("User not found with id: $toUserId") }

        // Check if 'like' already exists
        if (likeRepository.findByFromUserAndToUser(fromUser, toUser).isPresent) {
            // Or handle as an update (e.g., re-activating a canceled like)
            return false // Indicate that no new action was taken
        }

        // Create and save the like
        val like = Like(fromUser = fromUser, toUser = toUser)
        likeRepository.save(like)

        // Check for mutual like
        val mutualLike = likeRepository.findByFromUserAndToUser(toUser, fromUser)
        if (mutualLike.isPresent) {
            // Ensure consistent ordering of user IDs for the match
            val user1 = if (fromUser.id < toUser.id) fromUser else toUser
            val user2 = if (fromUser.id < toUser.id) toUser else fromUser

            // Check if a match already exists
            if (matchRepository.findByUser1AndUser2(user1, user2).isEmpty) {
                 val match = Match(user1 = user1, user2 = user2)
                 matchRepository.save(match)
                 return true // Match created
            }
        }

        return false // Like created, but no match
    }
}
