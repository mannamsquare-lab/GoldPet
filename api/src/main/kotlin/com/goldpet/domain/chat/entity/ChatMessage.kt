package com.goldpet.domain.chat.entity

import com.goldpet.domain.common.entity.BaseTimeEntity
import com.goldpet.domain.user.entity.User
import jakarta.persistence.*

enum class MessageType {
    TEXT, IMAGE, VIDEO, FILE, EMOTICON, EMOJI, SYSTEM
}

@Entity
@Table(name = "chat_messages")
class ChatMessage(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    val chatRoom: ChatRoom,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_user_id")
    val sender: User? = null, // System messages might not have a sender

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val messageType: MessageType,

    @Column(columnDefinition = "TEXT")
    var textContent: String? = null,

    @Column(name = "file_id")
    var fileId: Long? = null, // Assuming file_attachments table exists

    @Column(name = "emoticon_id")
    var emoticonId: Long? = null, // Assuming emoticons table exists

    @Column
    var emojiCode: String? = null,

    @Column(nullable = false)
    var readCount: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_to_id")
    val replyTo: ChatMessage? = null

) : BaseTimeEntity()
