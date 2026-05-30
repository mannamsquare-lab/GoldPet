package com.goldpet.domain.friend.service

import com.goldpet.domain.common.service.FileAttachmentLookupService
import com.goldpet.domain.common.util.toHttps
import com.goldpet.domain.friend.dto.FriendResponse
import com.goldpet.util.GeoUtils
import com.goldpet.domain.common.service.SystemSettingService
import com.goldpet.domain.friend.repository.FriendRepository
import com.goldpet.domain.pet.repository.PetRepository
import com.goldpet.domain.profileboost.service.ProfileBoostService
import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.repository.UserRepository
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

// ── W1 Compatibility Scoring (plan §2.1) ─────────────────────────────────────
// 가중치는 SystemSetting 으로 외부화 (match.score.w_*) → 재배포 없이 튜닝.
data class CompatibilityWeights(
    val distance: Double,
    val interest: Double,
    val hobby: Double,
    val temperament: Double
)

/** |∩| / |∪| — 공집합/완전 disjoint 안전 (둘 다 비면 0). */
fun jaccard(a: Set<String>, b: Set<String>): Double {
    if (a.isEmpty() && b.isEmpty()) return 0.0
    val union = a.union(b).size.toDouble()
    if (union == 0.0) return 0.0
    return a.intersect(b).size.toDouble() / union
}

/** 일치 태그 수 / max(태그 수). divide-by-zero 가드: max(tags)==0 → 0. */
fun temperamentOverlap(a: List<String>, b: List<String>): Double {
    val maxTags = maxOf(a.size, b.size)
    if (maxTags == 0) return 0.0
    val matches = a.toSet().intersect(b.toSet()).size.toDouble()
    return matches / maxTags
}

/**
 * score = w_distance*distance_norm + w_interest*interest_jaccard
 *       + w_hobby*hobby_jaccard + w_temperament*temperament_overlap
 * distance_norm = 1 - min(d, radius)/radius (radius<=0 가드 → 0).
 */
fun computeCompatibilityScore(
    distanceMeters: Double,
    radiusMeters: Double,
    myInterests: Set<String>,
    theirInterests: Set<String>,
    myHobbies: Set<String>,
    theirHobbies: Set<String>,
    myTemperament: List<String>,
    theirTemperament: List<String>,
    weights: CompatibilityWeights
): Double {
    val distanceNorm = if (radiusMeters <= 0.0) 0.0
        else 1.0 - (minOf(distanceMeters, radiusMeters) / radiusMeters)
    return weights.distance * distanceNorm +
        weights.interest * jaccard(myInterests, theirInterests) +
        weights.hobby * jaccard(myHobbies, theirHobbies) +
        weights.temperament * temperamentOverlap(myTemperament, theirTemperament)
}

/**
 * 프로필-부스트 가시성 가중(골드 sink, 플랜 §1 PARALLEL).
 * 활성 부스트 유저는 compatible 모드 재정렬에서 가산점을 받아 같은 radius 내 상위 노출.
 * bonus 는 SystemSetting profile.boost.rank_bonus, 최종 점수는 [0,1] 클램프.
 */
fun applyBoostBonus(baseScore: Double, isBoosted: Boolean, bonus: Double): Double =
    if (isBoosted) (baseScore + bonus).coerceIn(0.0, 1.0) else baseScore

@Service
@Transactional(readOnly = true)
class FriendService(
    private val friendRepository: FriendRepository,
    private val petRepository: PetRepository,
    private val fileAttachmentLookupService: FileAttachmentLookupService,
    private val userRepository: UserRepository,
    private val systemSettingService: SystemSettingService,
    private val profileBoostService: ProfileBoostService
) {
    companion object {
        // 거리 native SQL 1차 후보집합 상한 (앱-레이어 재정렬 입력). 플랜 §2.1 N=200.
        const val COMPATIBILITY_CANDIDATE_LIMIT = 200
    }

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

        // W1: 신규 compatible 모드. 플래그 ON 일 때만 가중 재정렬 경로.
        // 플래그 OFF → distance-only 로 폴백(롤백 안전 — 기존 3모드 불변).
        if (sortBy == "compatible") {
            return if (systemSettingService.getBoolean("match.compatibility.enabled", false)) {
                getCompatibleFriends(myUserId, myLat, myLng, radiusMeters, petTypes, genders, pageable)
            } else {
                getFriends(myUserId, myLat, myLng, distanceKm, "distance", petTypes, genders, pageable)
            }
        }

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
     * W1 Compatibility Scoring (플랜 §2.1).
     * 거리 native SQL 로 radius 내 상위 N=200 후보집합 1차 조회 → 앱-레이어 가중 재정렬.
     * 페이지네이션은 스코어 정렬된 in-memory 집합에 적용(거리 페이징 충돌 회피).
     */
    private fun getCompatibleFriends(
        myUserId: Long,
        myLat: Double,
        myLng: Double,
        radiusMeters: Double,
        petTypes: List<String>?,
        genders: List<String>?,
        pageable: Pageable
    ): Page<FriendResponse> {
        // 1차 후보집합: 거리순 상위 N (기존 distance 모드 native SQL 재사용, 불변).
        val candidatePageable = PageRequest.of(0, COMPATIBILITY_CANDIDATE_LIMIT)
        val candidates = friendRepository.findFriendsNearbyByDistance(
            myUserId = myUserId,
            myLat = myLat,
            myLng = myLng,
            radiusMeters = radiusMeters,
            pageable = candidatePageable
        ).content.filter { user ->
            val matchesPetType = petTypes.isNullOrEmpty() ||
                petRepository.findByOwnerId(user.id).any { pet -> pet.species.code in petTypes }
            val matchesGender = genders.isNullOrEmpty() ||
                petRepository.findByOwnerId(user.id).any { pet -> pet.gender in genders }
            matchesPetType && matchesGender
        }

        // 내 프로필 신호: interests/hobbies(User) + temperament(main Pet, CSV plumbing).
        val me = userRepository.findById(myUserId).orElse(null)
        val myInterests = me?.interests?.map { it.name }?.toSet() ?: emptySet()
        val myHobbies = me?.hobbies?.map { it.name }?.toSet() ?: emptySet()
        val myTemperament = parseTemperamentTags(
            petRepository.findByOwnerId(myUserId).firstOrNull()?.temperamentTags
        ).tags

        val weights = loadCompatibilityWeights()

        // 프로필-부스트 가시성 가중(골드 sink): 활성 부스트 유저 집합 + 가산점(클램프).
        val boostedIds = profileBoostService.boostedUserIds()
        val boostBonus = systemSettingService.getString("profile.boost.rank_bonus", "0.15")
            .toDoubleOrNull() ?: 0.15

        val scored = candidates.map { user ->
            val theirInterests = user.interests.map { it.name }.toSet()
            val theirHobbies = user.hobbies.map { it.name }.toSet()
            val theirTemperament = parseTemperamentTags(
                petRepository.findByOwnerId(user.id).firstOrNull()?.temperamentTags
            ).tags
            val distance = GeoUtils.calculateDistanceInMeters(
                myLat, myLng, user.mainLocationGeom?.y, user.mainLocationGeom?.x
            )
            val baseScore = computeCompatibilityScore(
                distanceMeters = distance,
                radiusMeters = radiusMeters,
                myInterests = myInterests,
                theirInterests = theirInterests,
                myHobbies = myHobbies,
                theirHobbies = theirHobbies,
                myTemperament = myTemperament,
                theirTemperament = theirTemperament,
                weights = weights
            )
            val score = applyBoostBonus(baseScore, user.id in boostedIds, boostBonus)
            user to score
        }.sortedByDescending { it.second }

        // 스코어 정렬된 in-memory 집합에 페이지네이션 적용.
        val total = scored.size.toLong()
        val from = (pageable.pageNumber * pageable.pageSize).coerceIn(0, scored.size)
        val to = (from + pageable.pageSize).coerceIn(0, scored.size)
        val pageUsers = scored.subList(from, to).map { it.first }

        val responses = buildFriendResponses(pageUsers, myLat, myLng)
        return PageImpl(responses, pageable, total)
    }

    private fun loadCompatibilityWeights(): CompatibilityWeights = CompatibilityWeights(
        distance = systemSettingService.getString("match.score.w_distance", "0.40").toDoubleOrNull() ?: 0.40,
        interest = systemSettingService.getString("match.score.w_interest", "0.25").toDoubleOrNull() ?: 0.25,
        hobby = systemSettingService.getString("match.score.w_hobby", "0.20").toDoubleOrNull() ?: 0.20,
        temperament = systemSettingService.getString("match.score.w_temperament", "0.15").toDoubleOrNull() ?: 0.15
    )

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
            profileImageUrlThumbnailWebp = fileAttachmentLookupService.thumbnailUrlWebpFor(ownerPrimary),
            profileImagesThumbnailWebp = ownerImages.map { fileAttachmentLookupService.thumbnailUrlWebpFor(it) },
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
            imagesThumbnailWebp = petImages.map { fileAttachmentLookupService.thumbnailUrlWebpFor(it) },
            distance = distance,
            status = "offline",
            location = null, // Privacy: precise coordinates not exposed
            locationText = user.mainLocationText
        )
    }

}
