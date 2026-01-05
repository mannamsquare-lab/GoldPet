package com.goldpet.domain.notification.service

import com.goldpet.domain.notification.dto.CreateNotificationRequest
import com.goldpet.domain.notification.dto.NotificationResponse
import com.goldpet.domain.notification.entity.Notification
import com.goldpet.domain.notification.entity.NotificationType
import com.goldpet.domain.notification.repository.NotificationRepository
import com.goldpet.domain.user.repository.UserRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class NotificationService(
    private val notificationRepository: NotificationRepository,
    private val userRepository: UserRepository
) {
    fun getNotifications(userId: Long, category: String?, pageable: Pageable): Page<NotificationResponse> {
        if (category == null || category == "ALL") {
            return notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map { NotificationResponse.from(it) }
        }

        val types = when (category) {
            "FRIEND" -> listOf(NotificationType.LIKE, NotificationType.MATCH)
            "CHAT" -> listOf(NotificationType.MESSAGE)
            "WALK" -> listOf(NotificationType.WALK)
            "COMMUNITY" -> listOf(NotificationType.COMMENT, NotificationType.FOLLOW)
            "NOTICE" -> listOf(NotificationType.NOTICE, NotificationType.SYSTEM)
            "EVENT" -> listOf(NotificationType.EVENT)
            else -> return notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map { NotificationResponse.from(it) }
        }

        return notificationRepository.findAllByUserIdAndTypeInOrderByCreatedAtDesc(userId, types, pageable)
            .map { NotificationResponse.from(it) }
    }

    fun getUnreadCount(userId: Long): Long {
        return notificationRepository.countByUserIdAndIsReadFalse(userId)
    }

    @Transactional
    fun markAsRead(notificationId: Long, userId: Long) {
        val notification = notificationRepository.findById(notificationId)
            .orElseThrow { IllegalArgumentException("Notification not found") }
        
        if (notification.user.id != userId) {
            throw IllegalArgumentException("Not authorized")
        }
        
        notification.isRead = true
        notificationRepository.save(notification)
    }

    @Transactional
    fun markAllAsRead(userId: Long): Int {
        return notificationRepository.markAllAsRead(userId)
    }

    @Transactional
    fun deleteNotification(notificationId: Long, userId: Long) {
        val notification = notificationRepository.findById(notificationId)
            .orElseThrow { IllegalArgumentException("Notification not found") }
        
        if (notification.user.id != userId) {
            throw IllegalArgumentException("Not authorized")
        }
        
        notificationRepository.delete(notification)
    }

    @Transactional
    fun createNotification(request: CreateNotificationRequest): NotificationResponse {
        val user = userRepository.findById(request.userId)
            .orElseThrow { IllegalArgumentException("User not found") }
        
        val sender = request.senderId?.let { userRepository.findById(it).orElse(null) }
        
        val notification = Notification(
            user = user,
            type = request.type,
            title = request.title,
            message = request.message,
            targetId = request.targetId,
            targetType = request.targetType,
            senderId = sender?.id,
            senderNickname = sender?.nickname,
            senderProfileImage = sender?.profileImageUrl
        )
        
        val saved = notificationRepository.save(notification)
        return NotificationResponse.from(saved)
    }

    // 편의 메서드: 특정 이벤트에 대한 알림 생성
    @Transactional
    fun notifyMatch(toUserId: Long, fromUserId: Long, matchId: Long) {
        val fromUser = userRepository.findById(fromUserId).orElse(null) ?: return
        createNotification(CreateNotificationRequest(
            userId = toUserId,
            type = NotificationType.MATCH,
            title = "새로운 매칭!",
            message = "${fromUser.nickname}님과 매칭되었어요 🎉",
            targetId = matchId,
            targetType = "MATCH",
            senderId = fromUserId
        ))
    }

    @Transactional
    fun notifyLike(toUserId: Long, fromUserId: Long, postId: Long) {
        val fromUser = userRepository.findById(fromUserId).orElse(null) ?: return
        createNotification(CreateNotificationRequest(
            userId = toUserId,
            type = NotificationType.LIKE,
            title = "좋아요!",
            message = "${fromUser.nickname}님이 게시글을 좋아해요 ❤️",
            targetId = postId,
            targetType = "POST",
            senderId = fromUserId
        ))
    }

    @Transactional
    fun notifyComment(toUserId: Long, fromUserId: Long, postId: Long, commentPreview: String) {
        val fromUser = userRepository.findById(fromUserId).orElse(null) ?: return
        createNotification(CreateNotificationRequest(
            userId = toUserId,
            type = NotificationType.COMMENT,
            title = "새 댓글",
            message = "${fromUser.nickname}: ${commentPreview.take(30)}...",
            targetId = postId,
            targetType = "POST",
            senderId = fromUserId
        ))
    }

    @Transactional
    fun notifyMessage(toUserId: Long, fromUserId: Long, chatRoomId: Long, messagePreview: String) {
        val fromUser = userRepository.findById(fromUserId).orElse(null) ?: return
        createNotification(CreateNotificationRequest(
            userId = toUserId,
            type = NotificationType.MESSAGE,
            title = "새 메시지",
            message = "${fromUser.nickname}: ${messagePreview.take(30)}...",
            targetId = chatRoomId,
            targetType = "CHAT_ROOM",
            senderId = fromUserId
        ))
    }
}
