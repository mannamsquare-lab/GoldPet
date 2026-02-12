package com.goldpet.domain.common.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "file_attachments")
class FileAttachment(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "owner_user_id", nullable = false)
    val ownerUserId: Long,

    @Column(name = "file_type", nullable = false)
    val fileType: String, // IMAGE, VIDEO, etc.

    @Column(name = "mime_type", nullable = false)
    val mimeType: String,

    @Column(nullable = false)
    val url: String,

    @Column(name = "original_file_name")
    val originalFileName: String? = null,

    @Column(name = "size_bytes")
    val sizeBytes: Long? = null,

    val width: Int? = null,
    val height: Int? = null,

    @Column(name = "duration_sec")
    val durationSec: Int? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
