package com.goldpet.domain.chat.repository

import com.goldpet.domain.chat.entity.ChatMessage
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface ChatMessageRepository : JpaRepository<ChatMessage, Long> {
    @EntityGraph(attributePaths = ["sender", "replyTo", "replyTo.sender"])
    fun findByChatRoomIdOrderByCreatedAtAsc(chatRoomId: Long, pageable: Pageable): List<ChatMessage>
    fun findByChatRoomIdOrderByCreatedAtDesc(chatRoomId: Long, pageable: Pageable): Page<ChatMessage>
    fun findTopByChatRoomIdOrderByCreatedAtDesc(chatRoomId: Long): ChatMessage?
    fun deleteByChatRoomId(chatRoomId: Long)

    @Query("SELECT m FROM ChatMessage m WHERE m.sender.id = :userId")
    fun findAllBySenderId(@Param("userId") userId: Long): List<ChatMessage>
}
