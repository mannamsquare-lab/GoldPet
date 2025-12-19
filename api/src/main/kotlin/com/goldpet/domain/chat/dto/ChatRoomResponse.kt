package com.goldpet.domain.chat.dto

import com.goldpet.domain.chat.entity.ChatRoom
import com.goldpet.domain.chat.entity.ChatRoomType
import java.time.LocalDateTime

data class ChatRoomResponse(
    val id: Long,
    val roomType: ChatRoomType,
    val title: String?,
    val ownerUserId: Long?,
    val matchId: Long?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val participantUserIds: List<Long>
) {
    companion object {
        fun from(chatRoom: ChatRoom): ChatRoomResponse {
            return ChatRoomResponse(
                id = chatRoom.id,
                roomType = chatRoom.roomType,
                title = chatRoom.title,
                ownerUserId = chatRoom.ownerUser?.id,
                matchId = chatRoom.match?.id,
                createdAt = chatRoom.createdAt,
                updatedAt = chatRoom.updatedAt,
                participantUserIds = chatRoom.participants.map { it.user.id }
            )
        }
    }
}
