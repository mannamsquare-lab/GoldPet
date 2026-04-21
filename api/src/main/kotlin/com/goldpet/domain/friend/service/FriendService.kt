package com.goldpet.domain.friend.service

import com.goldpet.domain.common.service.FileAttachmentLookupService
import com.goldpet.domain.common.util.toHttps
import com.goldpet.domain.friend.dto.FriendResponse
import com.goldpet.util.GeoUtils
import com.goldpet.domain.friend.repository.FriendRepository
import com.goldpet.domain.pet.repository.PetRepository
import com.goldpet.domain.user.entity.User
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.Period

data class ParsedTags(val note: String, val tags: List<String>)

fun parseTemperamentTags(raw: String?): ParsedTags {
    if (raw.isNullOrBlank()) return ParsedTags("", emptyList())
    val tagPattern = Regex("""(?:^|,)([A-Za-z]+):""")
    val matches = tagPattern.findAll(raw).toList()
    val parsed = matches.mapIndexed { i, match ->
        val start = match.range.first + (if (match.value.startsWith(",")) 1 else 0)
        val end = if (i + 1 < matches.size) matches[i + 1].range.first else raw.length
        raw.substring(start, end).trimEnd(',')
    }
    val note = parsed.find { it.startsWith("Note:") }?.substringAfter("Note:")?.trim() ?: ""
    val tags = parsed.filter { it.isNotBlank() && !it.startsWith("Note:") }
    return ParsedTags(note, tags)
}

@Service
@Transactional(readOnly = true)
class FriendService(
    private val friendRepository: FriendRepository,
    private val petRepository: PetRepository,
    private val fileAttachmentLookupService: FileAttachmentLookupService
) {
    fun getFriends(
        myUserId: Long,
        myLat: Double,
        myLng: Double,
        distanceKm: Double?,
        sortBy: String?,
        petTypes: List<String>?,
        genders: List<String>?,
        pageable: Pageable
    ): Page<FriendResponse> {
        val radiusMeters = (distanceKm ?: 5.0) * 1000 // Default 5km

        // Create a new pageable WITHOUT sort - sorting is handled in native query
        val unsortedPageable = PageRequest.of(pageable.pageNumber, pageable.pageSize)

        // Use appropriate query based on sort option
        val usersPage = when (sortBy) {
            "popular" -> friendRepository.findFriendsNearbyByPopular(
                myUserId = myUserId,
                myLat = myLat,
                myLng = myLng,
                radiusMeters = radiusMeters,
                pageable = unsortedPageable
            )
            "distance" -> friendRepository.findFriendsNearbyByDistance(
                myUserId = myUserId,
                myLat = myLat,
                myLng = myLng,
                radiusMeters = radiusMeters,
                pageable = unsortedPageable
            )
            else -> friendRepository.findFriendsNearbyByRegistered(
                myUserId = myUserId,
                myLat = myLat,
                myLng = myLng,
                radiusMeters = radiusMeters,
                pageable = unsortedPageable
            )
        }

        // T1-1.4b batch prefetch: owner 프로필 이미지 + pet 이미지 URL 을 한 번의 IN 쿼리로 warm.
        val allUrls = usersPage.content.flatMap { user ->
            val ownerUrls = user.profileImages.map { it.imageUrl } +
                listOfNotNull(user.profileImageUrl)
            val petUrls = petRepository.findByOwnerId(user.id).flatMap { pet ->
                pet.profileImages.map { it.imageUrl } + listOfNotNull(pet.profileImageUrl)
            }
            ownerUrls + petUrls
        }
        if (allUrls.isNotEmpty()) fileAttachmentLookupService.batchLookup(allUrls)

        // Convert to FriendResponse and filter by petTypes/genders if needed
        val friendResponses = usersPage.content.mapNotNull { user ->
            val response = convertToFriendResponse(user, myLat, myLng)
            
            // Filter by petTypes and genders if provided
            val matchesPetType = petTypes.isNullOrEmpty() || 
                petRepository.findByOwnerId(user.id).any { pet -> 
                    pet.species.code in petTypes 
                }
            val matchesGender = genders.isNullOrEmpty() || 
                petRepository.findByOwnerId(user.id).any { pet -> 
                    pet.gender in genders 
                }
            
            if (matchesPetType && matchesGender) response else null
        }

        return PageImpl(friendResponses, pageable, usersPage.totalElements)
    }

    /**
     * T1-1.4b 연장 — LikeController 3 endpoint 공용 매퍼.
     * User 리스트를 받아 batch prefetch(variant lookup N+1 해소) + 개별 변환을 수행한다.
     * FriendController 의 리스트 경로와 동일한 variant 공급 정책을 보장.
     */
    fun buildFriendResponses(users: List<User>, myLat: Double, myLng: Double): List<FriendResponse> {
        if (users.isEmpty()) return emptyList()

        val allUrls = users.flatMap { user ->
            val ownerUrls = user.profileImages.map { it.imageUrl } +
                listOfNotNull(user.profileImageUrl)
            val petUrls = petRepository.findByOwnerId(user.id).flatMap { pet ->
                pet.profileImages.map { it.imageUrl } + listOfNotNull(pet.profileImageUrl)
            }
            ownerUrls + petUrls
        }
        if (allUrls.isNotEmpty()) fileAttachmentLookupService.batchLookup(allUrls)

        return users.map { convertToFriendResponse(it, myLat, myLng) }
    }

    private fun convertToFriendResponse(user: User, myLat: Double, myLng: Double): FriendResponse {
        val pets = petRepository.findByOwnerId(user.id)
        val mainPet = pets.firstOrNull()
        
        // Calculate age
        val petAge = mainPet?.birthDate?.let { Period.between(it, LocalDate.now()).years } ?: 0

        val distance = GeoUtils.calculateDistanceInMeters(myLat, myLng, user.mainLocationGeom?.y, user.mainLocationGeom?.x)

        // Get pet images from ALL pets: profileImages relation first, fallback to profileImageUrl
        val petImages = pets.flatMap { pet ->
            val images = pet.profileImages.map { it.imageUrl }
            if (images.isEmpty() && !pet.profileImageUrl.isNullOrBlank()) {
                listOf(pet.profileImageUrl!!)
            } else {
                images
            }
        }

        // Get owner profile images: from profileImages relation, fallback to profileImageUrl
        val ownerImages = user.profileImages.map { it.imageUrl }.toMutableList()
        if (ownerImages.isEmpty() && !user.profileImageUrl.isNullOrBlank()) {
            ownerImages.add(user.profileImageUrl!!)
        }

        val parsed = parseTemperamentTags(mainPet?.temperamentTags)

        val ownerAge = user.birthDate?.let { Period.between(it, LocalDate.now()).years }

        val ownerPrimary = user.profileImageUrl.toHttps()
        return FriendResponse(
            id = user.id,
            nickname = user.nickname ?: "Unknown",
            profileImageUrl = ownerPrimary, // Owner's main profile image (small, secondary)
            profileImageUrlThumbnail = fileAttachmentLookupService.thumbnailUrlFor(ownerPrimary),
            profileImageUrlViewer = fileAttachmentLookupService.viewerUrlFor(ownerPrimary),
            profileImages = ownerImages, // Owner's all profile images
            profileImagesThumbnail = ownerImages.map { fileAttachmentLookupService.thumbnailUrlFor(it) ?: it },
            profileImagesViewer = ownerImages.map { fileAttachmentLookupService.viewerUrlFor(it) ?: it },
            ownerGender = user.gender,
            ownerAge = ownerAge,
            ownerIntro = user.intro,
            ownerMbti = user.mbti,
            ownerInterests = user.interests.map { it.name },
            ownerHobbies = user.hobbies.map { it.name },
            petName = mainPet?.name ?: "Unknown",
            petBreed = mainPet?.breed?.name ?: mainPet?.species?.name ?: "Unknown",
            petAge = petAge,
            petGender = mainPet?.gender ?: "UNKNOWN",
            isNeutered = mainPet?.isNeutered ?: false,
            onWalking = false,
            description = parsed.note,
            tags = parsed.tags,
            images = petImages, // Pet images (large, main slider)
            imagesThumbnail = petImages.map { fileAttachmentLookupService.thumbnailUrlFor(it) ?: it },
            imagesViewer = petImages.map { fileAttachmentLookupService.viewerUrlFor(it) ?: it },
            distance = distance,
            status = "offline",
            location = null, // Privacy: precise coordinates not exposed
            locationText = user.mainLocationText
        )
    }

}
