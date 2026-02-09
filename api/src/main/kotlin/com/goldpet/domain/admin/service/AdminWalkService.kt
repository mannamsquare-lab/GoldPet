package com.goldpet.domain.admin.service

import com.goldpet.domain.admin.dto.*
import com.goldpet.domain.pet.repository.PetRepository
import com.goldpet.domain.walk.repository.WalkRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class AdminWalkService(
    private val walkRepository: WalkRepository,
    private val petRepository: PetRepository
) {
    fun getWalks(
        page: Int,
        size: Int,
        userNickname: String?,
        startDate: LocalDate?,
        endDate: LocalDate?,
        minDistance: Double?,
        maxDistance: Double?
    ): Page<WalkAdminResponse> {
        val pageable: Pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startTime"))
        return walkRepository.findAllForAdmin(
            userNickname = userNickname,
            startDate = startDate?.atStartOfDay(),
            endDate = endDate?.atTime(23, 59, 59),
            minDistance = minDistance,
            maxDistance = maxDistance,
            pageable = pageable
        ).map { WalkAdminResponse.from(it) }
    }

    fun getWalkDetail(walkId: Long): WalkDetailResponse {
        val walk = walkRepository.findById(walkId)
            .orElseThrow { IllegalArgumentException("Walk not found: $walkId") }

        // Fetch pet info separately (Walk has no Pet relationship)
        val pets = petRepository.findByOwnerId(walk.user.id).map { pet ->
            WalkDetailPetInfo(
                petId = pet.id,
                petName = pet.name,
                species = pet.species.name,
                breed = pet.breed?.name
            )
        }

        val pathCoordinates = walk.path.coordinates.map { coord ->
            CoordinateDto(latitude = coord.y, longitude = coord.x)
        }

        return WalkDetailResponse(
            id = walk.id,
            userId = walk.user.id,
            userNickname = walk.user.nickname,
            userProfileImageUrl = walk.user.profileImageUrl,
            userPets = pets.ifEmpty { null },
            startTime = walk.startTime,
            endTime = walk.endTime,
            distanceKm = walk.distanceKm,
            durationSeconds = walk.durationSeconds,
            caloriesBurned = walk.caloriesBurned,
            notes = walk.notes,
            pathCoordinates = pathCoordinates,
            spots = walk.spots.map { WalkSpotAdminDto.from(it) },
            createdAt = walk.createdAt
        )
    }

    @Transactional
    fun deleteWalk(walkId: Long, reason: String) {
        val walk = walkRepository.findById(walkId)
            .orElseThrow { IllegalArgumentException("Walk not found: $walkId") }
        walkRepository.delete(walk)
    }

    fun getDetailedStats(
        period: String?,
        startDate: LocalDate?,
        endDate: LocalDate?
    ): WalkStatsDetailResponse {
        val now = LocalDateTime.now()
        val from = startDate?.atStartOfDay() ?: now.minusDays(30)
        val to = endDate?.atTime(23, 59, 59) ?: now

        val walks = walkRepository.findAllByStartTimeBetween(from, to)

        val totalWalks = walks.size.toLong()
        val totalDistance = walks.sumOf { it.distanceKm }
        val avgDistance = if (totalWalks > 0) totalDistance / totalWalks else 0.0
        val avgDuration = if (totalWalks > 0) walks.sumOf { it.durationSeconds } / totalWalks / 60.0 else 0.0

        val dailyBreakdown = walks
            .groupBy { it.startTime.toLocalDate() }
            .map { (date, dayWalks) ->
                DailyStatEntry(
                    date = date,
                    count = dayWalks.size,
                    totalDistanceKm = dayWalks.sumOf { it.distanceKm }
                )
            }
            .sortedBy { it.date }

        return WalkStatsDetailResponse(
            totalWalks = totalWalks,
            totalDistanceKm = totalDistance,
            averageDistanceKm = avgDistance,
            averageDurationMinutes = avgDuration,
            dailyBreakdown = dailyBreakdown
        )
    }
}
