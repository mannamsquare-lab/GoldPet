// resolveMany 접근 제어(SEC-004) 필터 로직을 검증하는 단위 테스트
package com.goldpet.domain.common.service

import com.goldpet.domain.chat.repository.ChatMessageRepository
import com.goldpet.domain.common.entity.FileAttachment
import com.goldpet.domain.common.repository.FileAttachmentRepository
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

/**
 * SEC-004 (W1a) — file resolve IDOR 방어 필터 검증.
 * resolveMany 가 소유자/참여자 접근권을 정확히 적용하는지 순수 단위로 확인한다.
 */
class FileAttachmentLookupServiceAccessTest {

    private lateinit var fileRepo: FileAttachmentRepository
    private lateinit var chatMessageRepository: ChatMessageRepository
    private lateinit var lookup: FileAttachmentLookupService

    private fun attachment(id: Long, owner: Long) = FileAttachment(
        id = id,
        ownerUserId = owner,
        fileType = "IMAGE",
        mimeType = "image/jpeg",
        url = "https://test.example/$id.jpg"
    )

    @BeforeEach
    fun setUp() {
        fileRepo = mock()
        chatMessageRepository = mock()
        lookup = FileAttachmentLookupService(fileRepo, chatMessageRepository)
    }

    @Test
    fun `resolveMany 는 소유자 첨부를 반환하고 참여 검사를 건너뛴다`() {
        whenever(fileRepo.findAllById(any())).thenReturn(listOf(attachment(10L, owner = 1L)))

        val result = lookup.resolveMany(listOf(10L), viewerUserId = 1L)

        assertTrue(result.containsKey(10L))
        verify(chatMessageRepository, never()).findAccessibleFileIds(any(), any())
    }

    @Test
    fun `resolveMany 는 소유자도 참여자도 아니면 제외한다 (IDOR 차단)`() {
        whenever(fileRepo.findAllById(any())).thenReturn(listOf(attachment(10L, owner = 2L)))
        whenever(chatMessageRepository.findAccessibleFileIds(eq(1L), any())).thenReturn(emptyList())

        val result = lookup.resolveMany(listOf(10L), viewerUserId = 1L)

        assertFalse(result.containsKey(10L))
        assertTrue(result.isEmpty())
    }

    @Test
    fun `resolveMany 는 타인 소유라도 같은 방 참여 첨부는 반환한다`() {
        whenever(fileRepo.findAllById(any())).thenReturn(listOf(attachment(10L, owner = 2L)))
        whenever(chatMessageRepository.findAccessibleFileIds(eq(1L), any())).thenReturn(listOf(10L))

        val result = lookup.resolveMany(listOf(10L), viewerUserId = 1L)

        assertTrue(result.containsKey(10L))
    }
}
