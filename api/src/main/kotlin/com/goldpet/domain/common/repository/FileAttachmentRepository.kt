package com.goldpet.domain.common.repository

import com.goldpet.domain.common.entity.FileAttachment
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface FileAttachmentRepository : JpaRepository<FileAttachment, Long> {
    fun findAllByUrlIn(urls: List<String>): List<FileAttachment>
    fun findByUrl(url: String): FileAttachment?

    @Query("SELECT f FROM FileAttachment f WHERE f.fileType = 'IMAGE' AND f.thumbnailUrl IS NULL AND f.mimeType <> 'image/gif'")
    fun findImagesWithoutVariants(pageable: Pageable): Page<FileAttachment>
}
