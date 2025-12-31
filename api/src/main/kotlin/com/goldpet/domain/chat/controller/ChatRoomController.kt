package com.goldpet.domain.chat.controller

import com.goldpet.domain.chat.dto.ChatRoomCreateRequest
import com.goldpet.domain.chat.dto.ChatRoomResponse
import com.goldpet.domain.chat.dto.ChatMessageResponse
import com.goldpet.domain.chat.service.ChatService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/chat/rooms")
class ChatRoomController(
    private val chatService: ChatService
) {
    @PostMapping
    fun createChatRoom(
        @RequestBody request: ChatRoomCreateRequest,
        @AuthenticationPrincipal userDetails: com.goldpet.config.security.UserPrincipal
    ): ResponseEntity<ChatRoomResponse> {
        val chatRoom = chatService.createChatRoom(request, userDetails.id)
        return ResponseEntity.status(HttpStatus.CREATED).body(ChatRoomResponse.from(chatRoom))
    }

    @GetMapping("/my")
    fun getMyChatRooms(
        @AuthenticationPrincipal principal: org.springframework.security.core.userdetails.UserDetails
    ): ResponseEntity<List<ChatRoomResponse>> {
        val userId = if (principal is com.goldpet.config.security.UserPrincipal) {
            principal.id
        } else {
            // Fallback for other principal types if necessary
            // For now, assuming username lookup or throwing helpful error
             throw IllegalStateException("Unexpected principal type: ${principal::class.java}")
        }
        val chatRooms = chatService.getUserChatRooms(userId)
        return ResponseEntity.ok(chatRooms.map { ChatRoomResponse.from(it) })
    }

    @GetMapping("/{roomId}/messages")
    fun getChatMessages(
        @PathVariable roomId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int
    ): ResponseEntity<List<ChatMessageResponse>> {
        val messages = chatService.getChatHistory(roomId, page, size)
        return ResponseEntity.ok(messages.map { ChatMessageResponse.from(it) })
    }
}
