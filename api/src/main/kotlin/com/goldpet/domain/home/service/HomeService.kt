package com.goldpet.domain.home.service

import com.goldpet.domain.common.exception.*
import com.goldpet.domain.common.service.FileAttachmentLookupService
import com.goldpet.domain.home.dto.HomeRecentWalkResponse
import com.goldpet.domain.home.dto.HomeResponse
import com.goldpet.domain.home.dto.NotificationSummary
import com.goldpet.domain.friend.service.FriendService
import com.goldpet.domain.walk.repository.WalkRepository
import com.goldpet.domain.notification.service.NotificationService
import com.goldpet.domain.user.repository.UserRepository
import com.goldpet.domain.pet.repository.PetRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class HomeService(
    private val friendService: FriendService,
    private val walkRepository: WalkRepository,
    private val notificationService: NotificationService,
    private val userRepository: UserRepository,
    private val petRepository: PetRepository,
    private val fileAttachmentLookupService: FileAttachmentLookupService
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

        // Get most recent walk (single query, no full list fetch)
        val recentWalk = walkRepository.findFirstByUserIdOrderByStartTimeDesc(userId)?.let { w ->
            val walkPets = w.walkPets
            val petUrls = walkPets.mapNotNull { wp ->
                wp.pet.profileImages.firstOrNull()?.imageUrl ?: wp.pet.profileImageUrl
            }
            // T1-1.5 batch prefetch
            if (petUrls.isNotEmpty()) fileAttachmentLookupService.batchLookup(petUrls)
            HomeRecentWalkResponse(
                id = w.id,
                distanceKm = w.distanceKm,
                durationSeconds = w.durationSeconds,
                endTime = w.endTime,
                startAddress = w.startAddress,
                petNames = walkPets.map { it.pet.name },
                petProfileImageUrls = petUrls,
                petProfileImageUrlsThumbnail = petUrls.map { fileAttachmentLookupService.thumbnailUrlFor(it) ?: it },
                petProfileImageUrlsViewer = petUrls.map { fileAttachmentLookupService.viewerUrlFor(it) ?: it },
            )
        }

        // Get notification unread count
        val unreadCount = notificationService.getUnreadCount(userId)

        // Get user's pet names
        val myPetNames = petRepository.findByOwnerId(userId).map { it.name }

        return HomeResponse(
            recommendations = recommendations,
            recentWalk = recentWalk,
            notifications = NotificationSummary(
                hasUnread = unreadCount > 0,
                count = unreadCount
            ),
            myPetNames = myPetNames
        )
    }
}
