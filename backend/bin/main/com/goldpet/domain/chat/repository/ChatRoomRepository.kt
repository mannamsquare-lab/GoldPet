package com.goldpet.domain.chat.repository

import com.goldpet.domain.chat.entity.ChatRoom
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface ChatRoomRepository : JpaRepository<ChatRoom, Long> {
    fun findByMatchId(matchId: Long): Optional<ChatRoom>
}
