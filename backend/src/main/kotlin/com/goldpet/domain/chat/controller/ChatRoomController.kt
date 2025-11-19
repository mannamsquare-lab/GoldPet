package com.goldpet.domain.chat.controller

import com.goldpet.domain.chat.dto.ChatRoomCreateRequest
import com.goldpet.domain.chat.dto.ChatRoomResponse
import com.goldpet.domain.chat.dto.ChatMessageResponse
import com.goldpet.domain.chat.service.ChatService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/chat/rooms")
class ChatRoomController(
    private val chatService: ChatService
) {
    // TODO: 실제 인증 구현 시 @AuthenticationPrincipal 등을 사용하여 userId를 가져오도록 변경
    private val currentUserId: Long = 1L // 임시 사용자 ID

    @PostMapping
    fun createChatRoom(@RequestBody request: ChatRoomCreateRequest): ResponseEntity<ChatRoomResponse> {
        val chatRoom = chatService.createChatRoom(request, currentUserId)
        return ResponseEntity.status(HttpStatus.CREATED).body(ChatRoomResponse.from(chatRoom))
    }

    @GetMapping("/my")
    fun getMyChatRooms(): ResponseEntity<List<ChatRoomResponse>> {
        val chatRooms = chatService.getUserChatRooms(currentUserId)
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
