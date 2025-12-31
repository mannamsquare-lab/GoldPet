package com.goldpet.domain.chat.repository

import com.goldpet.domain.chat.entity.ChatMessage
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository

interface ChatMessageRepository : JpaRepository<ChatMessage, Long> {
    fun findByChatRoomIdOrderByCreatedAtAsc(chatRoomId: Long, pageable: Pageable): List<ChatMessage>
    fun findByChatRoomIdOrderByCreatedAtDesc(chatRoomId: Long, pageable: Pageable): Page<ChatMessage>
    fun findTopByChatRoomIdOrderByCreatedAtDesc(chatRoomId: Long): ChatMessage?
    fun deleteByChatRoomId(chatRoomId: Long)
}
