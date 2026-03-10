package com.goldpet.domain.admin.service

import com.goldpet.domain.admin.controller.*
import com.goldpet.domain.common.exception.*
import com.goldpet.domain.course.entity.CourseDifficulty
import com.goldpet.domain.course.repository.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.format.DateTimeFormatter

@Service
class AdminCourseService(
    private val courseRepository: WalkCourseRepository,
    private val spotRepository: CourseSpotRepository,
    private val commentRepository: CourseCommentRepository,
    private val likeRepository: CourseLikeRepository,
    private val commentLikeRepository: CourseCommentLikeRepository
) {
    private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")

    @Transactional(readOnly = true)
    fun getCourses(pageable: Pageable, search: String?, difficulty: CourseDifficulty?, isPublished: Boolean?): Page<CourseListItemResponse> {
        return courseRepository.findAllForAdmin(search, difficulty?.name, isPublished, pageable)
            .map { course ->
                CourseListItemResponse(
                    id = course.id,
                    title = course.title,
                    authorNickname = course.author.nickname ?: "",
                    authorId = course.author.id,
                    difficulty = course.difficulty.name,
                    region = course.region,
                    distanceKm = course.distanceKm,
                    estimatedMinutes = course.estimatedMinutes,
                    likeCount = course.likeCount,
                    commentCount = course.commentCount,
                    walkCount = course.walkCount,
                    rating = course.rating,
                    ratingCount = course.ratingCount,
                    isHidden = !course.isPublished,
                    createdAt = course.createdAt.format(formatter)
                )
            }
    }

    @Transactional(readOnly = true)
    fun getCourseDetail(courseId: Long): CourseDetailAdminResponse {
        val course = courseRepository.findById(courseId)
            .orElseThrow { NotFoundException("Course not found: $courseId") }
        val spots = spotRepository.findByCourseIdOrderByOrderIndex(courseId)
        val comments = commentRepository.findAllByCourseId(courseId)

        return CourseDetailAdminResponse(
            id = course.id,
            title = course.title,
            description = course.description,
            authorId = course.author.id,
            authorNickname = course.author.nickname ?: "",
            difficulty = course.difficulty.name,
            region = course.region,
            distanceKm = course.distanceKm,
            estimatedMinutes = course.estimatedMinutes,
            likeCount = course.likeCount,
            commentCount = course.commentCount,
            walkCount = course.walkCount,
            rating = course.rating,
            ratingCount = course.ratingCount,
            isHidden = !course.isPublished,
            thumbnailUrl = course.thumbnailUrl,
            createdAt = course.createdAt.format(formatter),
            updatedAt = course.updatedAt.format(formatter),
            spots = spots.map { spot ->
                CourseSpotAdminResponse(
                    id = spot.id,
                    type = spot.type.name,
                    name = spot.name,
                    description = spot.description,
                    latitude = spot.location.y,
                    longitude = spot.location.x,
                    orderIndex = spot.orderIndex
                )
            },
            comments = comments.map { comment ->
                CourseCommentAdminResponse(
                    id = comment.id,
                    content = comment.content,
                    rating = comment.rating,
                    authorId = comment.user.id,
                    authorNickname = comment.user.nickname ?: "",
                    likeCount = comment.likeCount,
                    isHidden = comment.isHidden,
                    createdAt = comment.createdAt.format(formatter)
                )
            }
        )
    }

    @Transactional
    fun hideCourse(courseId: Long) {
        val course = courseRepository.findById(courseId)
            .orElseThrow { NotFoundException("Course not found: $courseId") }
        course.isPublished = false
        courseRepository.save(course)
    }

    @Transactional
    fun unhideCourse(courseId: Long) {
        val course = courseRepository.findById(courseId)
            .orElseThrow { NotFoundException("Course not found: $courseId") }
        course.isPublished = true
        courseRepository.save(course)
    }

    @Transactional
    fun deleteCourse(courseId: Long) {
        val course = courseRepository.findById(courseId)
            .orElseThrow { NotFoundException("Course not found: $courseId") }
        commentLikeRepository.deleteAllByCourseId(courseId)
        commentRepository.deleteAllByCourseId(courseId)
        likeRepository.deleteAllByCourseId(courseId)
        spotRepository.deleteByCourseId(courseId)
        courseRepository.delete(course)
    }

    @Transactional
    fun hideComment(commentId: Long) {
        val comment = commentRepository.findById(commentId)
            .orElseThrow { NotFoundException("Comment not found: $commentId") }
        comment.isHidden = true
        commentRepository.save(comment)
    }

    @Transactional
    fun unhideComment(commentId: Long) {
        val comment = commentRepository.findById(commentId)
            .orElseThrow { NotFoundException("Comment not found: $commentId") }
        comment.isHidden = false
        commentRepository.save(comment)
    }

    @Transactional
    fun deleteComment(commentId: Long) {
        if (!commentRepository.existsById(commentId)) {
            throw NotFoundException("Comment not found: $commentId")
        }
        commentLikeRepository.deleteAllByCommentId(commentId)
        commentRepository.deleteById(commentId)
    }
}
