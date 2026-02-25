package com.goldpet.domain.home.service

import com.goldpet.domain.common.exception.*
import com.goldpet.domain.home.dto.HomeResponse
import com.goldpet.domain.home.dto.NotificationSummary
import com.goldpet.domain.friend.service.FriendService
import com.goldpet.domain.walk.service.WalkService
import com.goldpet.domain.notification.service.NotificationService
import com.goldpet.domain.user.repository.UserRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class HomeService(
    private val friendService: FriendService,
    private val walkService: WalkService,
    private val notificationService: NotificationService,
    private val userRepository: UserRepository
) {
    @Transactional(readOnly = true)
    fun getHomeData(userId: Long): HomeResponse {
        val user = userRepository.findById(userId).orElseThrow { NotFoundException("User not found") }

        // Get user location (default to Seoul if not set)
        val lat = user.mainLocationGeom?.y ?: 37.5665
        val lng = user.mainLocationGeom?.x ?: 126.978

        // Get friend recommendations (top 10, sorted by distance)
        val recommendations = friendService.getFriends(
            myUserId = userId,
            myLat = lat,
            myLng = lng,
            distanceKm = 10.0, // Home: 10km radius
            sortBy = "distance",
            petTypes = null,
            genders = null,
            pageable = PageRequest.of(0, 10)
        ).content

        // Get most recent walk
        val recentWalks = walkService.getWalksByUser(userId)
        val recentWalk = recentWalks.firstOrNull()

        // Get notification unread count
        val unreadCount = notificationService.getUnreadCount(userId)

        return HomeResponse(
            recommendations = recommendations,
            recentWalk = recentWalk,
            notifications = NotificationSummary(
                hasUnread = unreadCount > 0,
                count = unreadCount
            )
        )
    }
}
