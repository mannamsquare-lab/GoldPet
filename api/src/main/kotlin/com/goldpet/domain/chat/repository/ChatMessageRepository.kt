package com.goldpet.domain.chat.repository

import com.goldpet.domain.chat.entity.ChatMessage
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.domain.Pageable
import kotlin.collections.List

interface ChatMessageRepository : JpaRepository<ChatMessage, Long> {
    fun findByChatRoomIdOrderByCreatedAtAsc(chatRoomId: Long, pageable: Pageable): List<ChatMessage>
}
