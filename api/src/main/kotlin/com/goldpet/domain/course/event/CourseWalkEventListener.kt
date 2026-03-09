package com.goldpet.domain.course.event

import com.goldpet.domain.course.repository.WalkCourseRepository
import com.goldpet.domain.walk.event.WalkCompletedEvent
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class CourseWalkEventListener(
    private val walkCourseRepository: WalkCourseRepository
) {
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onWalkCompleted(event: WalkCompletedEvent) {
        val courseId = event.followedCourseId ?: return
        walkCourseRepository.incrementWalkCount(courseId)
    }
}
