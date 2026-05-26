package com.goldpet.domain.chat.repository

import com.goldpet.domain.chat.entity.ChatMessage
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDateTime

interface ChatMessageRepository : JpaRepository<ChatMessage, Long> {
    // ─────────────────────────────────────────────────────────────────────────
    // Legacy (admin/internal): hidden_at / deleted_at 무관 전체 조회.
    // 사용자 노출 경로는 아래 findVisible* 메서드 사용.
    // ─────────────────────────────────────────────────────────────────────────

    @EntityGraph(attributePaths = ["sender", "replyTo", "replyTo.sender"])
    fun findByChatRoomIdOrderByCreatedAtAsc(chatRoomId: Long, pageable: Pageable): List<ChatMessage>
    @EntityGraph(attributePaths = ["sender", "replyTo", "replyTo.sender"])
    fun findByChatRoomIdOrderByCreatedAtDesc(chatRoomId: Long, pageable: Pageable): Page<ChatMessage>
    fun findTopByChatRoomIdOrderByCreatedAtDesc(chatRoomId: Long): ChatMessage?
    fun deleteByChatRoomId(chatRoomId: Long)

    @Query("SELECT m FROM ChatMessage m WHERE m.sender.id = :userId")
    fun findAllBySenderId(@Param("userId") userId: Long): List<ChatMessage>

    @EntityGraph(attributePaths = ["sender"])
    @Query("SELECT m FROM ChatMessage m WHERE m.chatRoom.id = :roomId AND m.createdAt > :since ORDER BY m.createdAt ASC")
    fun findByChatRoomIdAndCreatedAtAfter(
        @Param("roomId") roomId: Long,
        @Param("since") since: LocalDateTime
    ): List<ChatMessage>

    @EntityGraph(attributePaths = ["sender"])
    @Query("SELECT m FROM ChatMessage m WHERE m.chatRoom.id = :roomId ORDER BY m.createdAt ASC")
    fun findAllByChatRoomId(@Param("roomId") roomId: Long): List<ChatMessage>

    // ─────────────────────────────────────────────────────────────────────────
    // V68 BLOCKER #5 (Apple Guideline 1.2) — 사용자 노출 경로 전용.
    // hidden_at IS NULL AND deleted_at IS NULL 메시지만 반환.
    // Admin 처리/감사 경로는 위 legacy 메서드 또는 findById 직접 사용.
    // ─────────────────────────────────────────────────────────────────────────

    @EntityGraph(attributePaths = ["sender", "replyTo", "replyTo.sender"])
    @Query("""
        SELECT m FROM ChatMessage m
         WHERE m.chatRoom.id = :roomId
           AND m.hiddenAt IS NULL
           AND m.deletedAt IS NULL
         ORDER BY m.createdAt DESC
    """)
    fun findVisibleByChatRoomIdOrderByCreatedAtDesc(
        @Param("roomId") roomId: Long,
        pageable: Pageable
    ): Page<ChatMessage>

    @EntityGraph(attributePaths = ["sender"])
    @Query("""
        SELECT m FROM ChatMessage m
         WHERE m.chatRoom.id = :roomId
           AND m.createdAt > :since
           AND m.hiddenAt IS NULL
           AND m.deletedAt IS NULL
         ORDER BY m.createdAt ASC
    """)
    fun findVisibleByChatRoomIdAndCreatedAtAfter(
        @Param("roomId") roomId: Long,
        @Param("since") since: LocalDateTime
    ): List<ChatMessage>

    @Query("""
        SELECT m FROM ChatMessage m
         WHERE m.chatRoom.id = :roomId
           AND m.hiddenAt IS NULL
           AND m.deletedAt IS NULL
         ORDER BY m.createdAt DESC
         LIMIT 1
    """)
    fun findTopVisibleByChatRoomId(@Param("roomId") roomId: Long): ChatMessage?
}
