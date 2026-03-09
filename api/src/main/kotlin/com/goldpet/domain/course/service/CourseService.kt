package com.goldpet.domain.course.service

import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.ObjectMetadata
import com.goldpet.domain.common.exception.ForbiddenException
import com.goldpet.domain.common.exception.NotFoundException
import com.goldpet.domain.course.dto.CourseListResponse
import com.goldpet.domain.course.dto.CourseResponse
import com.goldpet.domain.course.dto.CourseSpotDto
import com.goldpet.domain.course.dto.CreateCourseRequest
import com.goldpet.domain.course.dto.UpdateCourseRequest
import com.goldpet.domain.course.entity.CourseDifficulty
import com.goldpet.domain.course.entity.CourseSpot
import com.goldpet.domain.course.entity.CourseSpotType
import com.goldpet.domain.course.entity.WalkCourse
import com.goldpet.domain.course.repository.CourseSpotRepository
import com.goldpet.domain.course.repository.WalkCourseRepository
import com.goldpet.domain.user.repository.UserRepository
import com.goldpet.domain.walk.entity.WalkSpotType
import com.goldpet.domain.walk.repository.WalkRepository
import com.goldpet.infra.naver.NaverGeocodingService
import com.goldpet.infra.naver.NaverStaticMapService
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.locationtech.jts.geom.PrecisionModel
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.io.ByteArrayInputStream
import java.util.UUID

@Service
@Transactional(readOnly = true)
class CourseService(
    private val walkCourseRepository: WalkCourseRepository,
    private val courseSpotRepository: CourseSpotRepository,
    private val userRepository: UserRepository,
    private val walkRepository: WalkRepository,
    private val naverGeocodingService: NaverGeocodingService,
    private val naverStaticMapService: NaverStaticMapService,
    private val amazonS3: AmazonS3,
    @Value("\${S3_PUBLIC_BUCKET_NAME:goldpet-public}") private val publicBucketName: String,
    @Value("\${S3_PUBLIC_ENDPOINT:http://localhost:9100}") private val publicEndpoint: String
) {
    private val log = LoggerFactory.getLogger(CourseService::class.java)
    private val geometryFactory = GeometryFactory(PrecisionModel(), 4326)

    @Transactional
    fun createCourse(userId: Long, request: CreateCourseRequest): CourseResponse {
        val author = userRepository.findById(userId).orElseThrow { NotFoundException("User not found") }

        val path = request.toLineString()
        val startCoord = path.coordinates.first()
        val endCoord = path.coordinates.last()
        val startLocation = geometryFactory.createPoint(Coordinate(startCoord.x, startCoord.y))

        val region = try {
            naverGeocodingService.reverseGeocode(startCoord.y, startCoord.x)
        } catch (e: Exception) {
            log.warn("Reverse geocoding failed for course creation: {}", e.message)
            "알 수 없는 위치"
        }
        val startAddress = try { naverGeocodingService.reverseGeocode(startCoord.y, startCoord.x) } catch (e: Exception) { null }
        val endAddress = if (path.coordinates.size > 1) {
            try { naverGeocodingService.reverseGeocode(endCoord.y, endCoord.x) } catch (e: Exception) { null }
        } else null

        val course = WalkCourse(
            author = author,
            title = request.title,
            description = request.description,
            path = path,
            distanceKm = request.distanceKm,
            estimatedMinutes = request.estimatedMinutes,
            difficulty = request.difficulty,
            region = region,
            startLocation = startLocation,
            startAddress = startAddress,
            endAddress = endAddress,
            originWalkId = request.originWalkId
        )
        val savedCourse = walkCourseRepository.save(course)

        val thumbnailUrl = generateAndUploadThumbnail(savedCourse.id, path.coordinates)
        if (thumbnailUrl != null) {
            savedCourse.thumbnailUrl = thumbnailUrl
            walkCourseRepository.save(savedCourse)
        }

        val spots = saveSpotsFromDto(savedCourse, request.spots)
        return CourseResponse.from(savedCourse, spots)
    }

    fun getCourse(courseId: Long, currentUserId: Long? = null): CourseResponse {
        val course = walkCourseRepository.findById(courseId)
            .orElseThrow { NotFoundException("Course not found") }
        if (!course.isPublished) throw NotFoundException("Course not found")
        val spots = courseSpotRepository.findByCourseIdOrderByOrderIndex(courseId)
        return CourseResponse.from(course, spots)
    }

    @Transactional
    fun updateCourse(courseId: Long, userId: Long, request: UpdateCourseRequest): CourseResponse {
        val course = walkCourseRepository.findById(courseId)
            .orElseThrow { NotFoundException("Course not found") }
        if (course.author.id != userId) throw ForbiddenException("Not authorized to update this course")

        course.title = request.title
        course.description = request.description
        course.difficulty = request.difficulty
        course.estimatedMinutes = request.estimatedMinutes

        courseSpotRepository.deleteByCourseId(courseId)
        val spots = saveSpotsFromDto(course, request.spots)
        val savedCourse = walkCourseRepository.save(course)
        return CourseResponse.from(savedCourse, spots)
    }

    @Transactional
    fun deleteCourse(courseId: Long, userId: Long) {
        val course = walkCourseRepository.findById(courseId)
            .orElseThrow { NotFoundException("Course not found") }
        if (course.author.id != userId) throw ForbiddenException("Not authorized to delete this course")
        walkCourseRepository.delete(course)
    }

    fun searchNearby(lat: Double, lng: Double, radiusMeters: Double, difficulty: CourseDifficulty?, pageable: Pageable): Page<CourseResponse> {
        val pageable20 = PageRequest.of(pageable.pageNumber, pageable.pageSize)
        return walkCourseRepository.findNearbyPopularCourses(lng, lat, radiusMeters, pageable20)
            .map { course ->
                val spots = courseSpotRepository.findByCourseIdOrderByOrderIndex(course.id)
                CourseResponse.from(course, spots)
            }
    }

    fun getPopularCourses(region: String?, difficulty: CourseDifficulty?, pageable: Pageable): Page<CourseResponse> {
        return walkCourseRepository.findPopularCourses(pageable)
            .map { course ->
                val spots = courseSpotRepository.findByCourseIdOrderByOrderIndex(course.id)
                CourseResponse.from(course, spots)
            }
    }

    fun getMyCourses(userId: Long, pageable: Pageable): Page<CourseResponse> {
        return walkCourseRepository.findByAuthorIdOrderByCreatedAtDesc(userId, pageable)
            .map { course ->
                val spots = courseSpotRepository.findByCourseIdOrderByOrderIndex(course.id)
                CourseResponse.from(course, spots)
            }
    }

    @Transactional
    fun createFromWalk(userId: Long, walkId: Long, request: CreateCourseRequest): CourseResponse {
        val walk = walkRepository.findById(walkId).orElseThrow { NotFoundException("Walk not found") }
        if (walk.user.id != userId) throw ForbiddenException("Not authorized to use this walk")
        val author = userRepository.findById(userId).orElseThrow { NotFoundException("User not found") }

        val startCoord = walk.path.coordinates.first()
        val startLocation = geometryFactory.createPoint(Coordinate(startCoord.x, startCoord.y))
        val region = try {
            naverGeocodingService.reverseGeocode(startCoord.y, startCoord.x)
        } catch (e: Exception) { "알 수 없는 위치" }

        val course = WalkCourse(
            author = author,
            title = request.title,
            description = request.description,
            path = walk.path,
            distanceKm = walk.distanceKm,
            estimatedMinutes = (walk.durationSeconds / 60).toInt(),
            difficulty = request.difficulty,
            region = region,
            startLocation = startLocation,
            startAddress = walk.startAddress,
            endAddress = walk.endAddress,
            originWalkId = walkId
        )
        val savedCourse = walkCourseRepository.save(course)

        val thumbnailUrl = generateAndUploadThumbnail(savedCourse.id, walk.path.coordinates)
        if (thumbnailUrl != null) {
            savedCourse.thumbnailUrl = thumbnailUrl
            walkCourseRepository.save(savedCourse)
        }

        // Map WalkSpots → CourseSpots: PEE/POOP → skip, PHOTO → PHOTO_SPOT, PROBLEM → DANGER_ZONE, OTHER → OTHER
        var orderIndex = 0
        val spots = walk.spots.mapNotNull { walkSpot ->
            val courseSpotType = when (walkSpot.type) {
                WalkSpotType.PEE, WalkSpotType.POOP -> null
                WalkSpotType.PHOTO -> CourseSpotType.PHOTO_SPOT
                WalkSpotType.PROBLEM -> CourseSpotType.DANGER_ZONE
                WalkSpotType.OTHER -> CourseSpotType.OTHER
            } ?: return@mapNotNull null

            courseSpotRepository.save(CourseSpot(
                course = savedCourse,
                location = walkSpot.location,
                type = courseSpotType,
                name = null,
                description = walkSpot.note,
                imageUrl = walkSpot.imageUrl,
                orderIndex = orderIndex++
            ))
        }

        return CourseResponse.from(savedCourse, spots)
    }

    private fun saveSpotsFromDto(course: WalkCourse, spotDtos: List<CourseSpotDto>): List<CourseSpot> {
        return spotDtos.map { spotDto ->
            val location = geometryFactory.createPoint(Coordinate(spotDto.longitude, spotDto.latitude))
            courseSpotRepository.save(CourseSpot(
                course = course,
                location = location,
                type = spotDto.type,
                name = spotDto.name,
                description = spotDto.description,
                imageUrl = spotDto.imageUrl,
                orderIndex = spotDto.orderIndex
            ))
        }
    }

    private fun generateAndUploadThumbnail(courseId: Long, coordinates: Array<Coordinate>): String? {
        return try {
            val imageBytes = naverStaticMapService.getStaticMapImage(coordinates, 600, 400) ?: return null
            val key = "courses/thumbnails/${courseId}_${UUID.randomUUID()}.png"
            val metadata = ObjectMetadata().apply {
                contentType = "image/png"
                contentLength = imageBytes.size.toLong()
            }
            amazonS3.putObject(publicBucketName, key, ByteArrayInputStream(imageBytes), metadata)
            "$publicEndpoint/$publicBucketName/$key"
        } catch (e: Exception) {
            log.warn("Failed to generate/upload thumbnail for courseId={}: {}", courseId, e.message)
            null
        }
    }
}
