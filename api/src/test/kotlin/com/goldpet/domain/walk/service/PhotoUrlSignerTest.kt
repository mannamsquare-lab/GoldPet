package com.goldpet.domain.walk.service

import com.goldpet.domain.common.service.SystemSettingService
import com.goldpet.domain.file.service.FileService
import io.micrometer.core.instrument.simple.SimpleMeterRegistry
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.ObjectProvider

class PhotoUrlSignerTest {

    @Mock
    private lateinit var fileService: FileService

    @Mock
    private lateinit var systemSettingService: SystemSettingService

    private val meterRegistry = SimpleMeterRegistry()

    private lateinit var signer: PhotoUrlSigner

    @BeforeEach
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        val cacheProvider = mock<ObjectProvider<PerRequestSignerCache>>()
        whenever(cacheProvider.ifAvailable).thenReturn(null)
        signer = PhotoUrlSigner(fileService, systemSettingService, meterRegistry, cacheProvider)
    }

    private fun enableFlag() {
        whenever(systemSettingService.getString(eq(PhotoUrlSigner.FLAG_KEY), any()))
            .thenReturn("true")
    }

    private fun disableFlag() {
        whenever(systemSettingService.getString(eq(PhotoUrlSigner.FLAG_KEY), any()))
            .thenReturn("false")
    }

    @Test
    fun `uuid key with extension returns presigned url when flag enabled`() {
        enableFlag()
        val key = "a1b2c3d4-e5f6-7890-abcd-ef0123456789.jpg"
        val expectedUrl = "https://minio.example.com/goldpet-private/$key?X-Amz-Signature=abc&X-Amz-Expires=1800"
        whenever(fileService.getPresignedUrl(eq(key), eq(PhotoUrlSigner.PRESIGN_TTL_MINUTES)))
            .thenReturn(expectedUrl)

        val result = signer.signedUrlOrNull(key)

        assertNotNull(result)
        assertTrue(result!!.contains("X-Amz-Signature="), "presigned URL must carry X-Amz-Signature")
        verify(fileService).getPresignedUrl(eq(key), eq(30L))
    }

    @Test
    fun `bare uuid without extension still matches regex`() {
        enableFlag()
        val key = "A1B2C3D4-E5F6-7890-ABCD-EF0123456789"
        val expectedUrl = "https://minio.example.com/goldpet-private/$key?X-Amz-Signature=xyz"
        whenever(fileService.getPresignedUrl(eq(key), eq(PhotoUrlSigner.PRESIGN_TTL_MINUTES)))
            .thenReturn(expectedUrl)

        val result = signer.signedUrlOrNull(key)

        assertNotNull(result)
    }

    @Test
    fun `http prefixed input returns null without signing`() {
        enableFlag()
        val result = signer.signedUrlOrNull("https://cdn.example.com/goldpet-public/avatar.jpg")

        assertNull(result)
        verify(fileService, never()).getPresignedUrl(any(), any())
    }

    @Test
    fun `null input returns null`() {
        val result = signer.signedUrlOrNull(null)
        assertNull(result)
        verify(fileService, never()).getPresignedUrl(any(), any())
    }

    @Test
    fun `blank input returns null`() {
        val result = signer.signedUrlOrNull("   ")
        assertNull(result)
        verify(fileService, never()).getPresignedUrl(any(), any())
    }

    @Test
    fun `empty string returns null`() {
        val result = signer.signedUrlOrNull("")
        assertNull(result)
        verify(fileService, never()).getPresignedUrl(any(), any())
    }

    @Test
    fun `non-uuid input returns null and does not sign`() {
        enableFlag()
        val result = signer.signedUrlOrNull("../../etc/passwd")

        assertNull(result)
        verify(fileService, never()).getPresignedUrl(any(), any())
    }

    @Test
    fun `legacy filename shape returns null`() {
        enableFlag()
        val result = signer.signedUrlOrNull("walk_12345.jpg")

        assertNull(result)
        verify(fileService, never()).getPresignedUrl(any(), any())
    }

    @Test
    fun `flag disabled returns null even for valid uuid`() {
        disableFlag()
        val key = "a1b2c3d4-e5f6-7890-abcd-ef0123456789.jpg"

        val result = signer.signedUrlOrNull(key)

        assertNull(result)
        verify(fileService, never()).getPresignedUrl(any(), any())
    }

    @Test
    fun `flag default false is respected when setting missing`() {
        whenever(systemSettingService.getString(eq(PhotoUrlSigner.FLAG_KEY), any()))
            .thenAnswer { invocation -> invocation.getArgument<String>(1) }
        val key = "a1b2c3d4-e5f6-7890-abcd-ef0123456789.jpg"

        val result = signer.signedUrlOrNull(key)

        assertNull(result)
        verify(fileService, never()).getPresignedUrl(any(), any())
    }
}
