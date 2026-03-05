package com.goldpet.domain.chat.repository

import com.goldpet.domain.chat.entity.ChatRoomParticipant
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface ChatRoomParticipantRepository : JpaRepository<ChatRoomParticipant, Long> {
    fun findByChatRoomIdAndUserId(chatRoomId: Long, userId: Long): Optional<ChatRoomParticipant>
    fun findAllByUserId(userId: Long): List<ChatRoomParticipant>
    fun findAllByUserIdAndLeftAtIsNull(userId: Long): List<ChatRoomParticipant>
    fun findAllByChatRoomId(chatRoomId: Long): List<ChatRoomParticipant>
}
