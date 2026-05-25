package com.goldpet.domain.file.service

import com.amazonaws.services.s3.AmazonS3
import com.goldpet.domain.common.repository.FileAttachmentRepository
import com.goldpet.domain.common.service.SystemSettingService
import com.goldpet.domain.walk.service.WalkSpotBackfillWorker
import io.micrometer.core.instrument.simple.SimpleMeterRegistry
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.anyOrNull
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.mock.env.MockEnvironment
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
import java.awt.Color
import java.awt.image.BufferedImage

class FileServiceTest {

    private lateinit var amazonS3: AmazonS3
    private lateinit var fileAttachmentRepository: FileAttachmentRepository
    private lateinit var variantExecutor: ThreadPoolTaskExecutor
    private lateinit var walkSpotBackfillWorker: WalkSpotBackfillWorker
    private lateinit var fileAttachmentRetryWorker: FileAttachmentRetryWorker
    private lateinit var systemSettingService: SystemSettingService
    private lateinit var meterRegistry: SimpleMeterRegistry
    private lateinit var fileService: FileService

    private val publicBucket = "goldpet-public-test"
    private val privateBucket = "goldpet-private-test"

    @BeforeEach
    fun setUp() {
        amazonS3 = mock()
        fileAttachmentRepository = mock()
        variantExecutor = mock()
        walkSpotBackfillWorker = mock()
        fileAttachmentRetryWorker = mock()
        systemSettingService = mock()
        meterRegistry = SimpleMeterRegistry()

        whenever(amazonS3.doesBucketExistV2(any())).thenReturn(true)

        fileService = FileService(
            amazonS3 = amazonS3,
            publicBucketName = publicBucket,
            privateBucketName = privateBucket,
            publicEndpoint = "http://s3.test",
            s3Endpoint = "http://s3.test",
            fileAttachmentRepository = fileAttachmentRepository,
            variantExecutor = variantExecutor,
            meterRegistry = meterRegistry,
            walkSpotBackfillWorker = walkSpotBackfillWorker,
            fileAttachmentRetryWorker = fileAttachmentRetryWorker,
            systemSettingService = systemSettingService,
            environment = MockEnvironment()
        )
    }

    private fun solidImage(width: Int, height: Int): BufferedImage {
        val img = BufferedImage(width, height, BufferedImage.TYPE_INT_RGB)
        val g = img.createGraphics()
        g.color = Color.GRAY
        g.fillRect(0, 0, width, height)
        g.dispose()
        return img
    }

    @Test
    fun `generateVariantsRaw produces thumb medium and viewer for portrait 900x1600`() {
        val image = solidImage(900, 1600)

        fileService.generateVariantsRaw(
            attachmentId = 1L,
            image = image,
            baseFilename = "uuid-portrait",
            mimeType = "image/jpeg",
            bucket = publicBucket,
            isPublic = true,
            category = "community"
        )

        verify(amazonS3).putObject(eq(publicBucket), eq("uuid-portrait_thumb.jpg"), any(), any())
        verify(amazonS3).putObject(eq(publicBucket), eq("uuid-portrait_medium.jpg"), any(), any())
        verify(amazonS3).putObject(eq(publicBucket), eq("uuid-portrait_viewer.jpg"), any(), any())
        verify(fileAttachmentRepository).updateAllVariantUrlsWithWebp(
            eq(1L), anyOrNull(), anyOrNull(), anyOrNull(), anyOrNull(), anyOrNull(), anyOrNull(), eq(900), eq(1600)
        )

        val successCount = meterRegistry.counter(
            "file_variant_generate_total",
            "result", "success",
            "category", "community"
        ).count()
        assertEquals(1.0, successCount, "success counter must increment once for portrait jpeg")
    }

    @Test
    fun `generateVariantsRaw produces all three variants for 200x200 png when previously skipped`() {
        // Before T0-1 fix, shortSide=200 <= every maxDimension so every variant was skipped
        // and the row fell back to the original PNG. With always-generate, Thumbnailator
        // re-encodes to JPEG at source dimensions — the ~12x size win preserved.
        val image = solidImage(200, 200)

        fileService.generateVariantsRaw(
            attachmentId = 2L,
            image = image,
            baseFilename = "uuid-small",
            mimeType = "image/png",
            bucket = publicBucket,
            isPublic = true,
            category = "badge"
        )

        verify(amazonS3).putObject(eq(publicBucket), eq("uuid-small_thumb.jpg"), any(), any())
        verify(amazonS3).putObject(eq(publicBucket), eq("uuid-small_medium.jpg"), any(), any())
        verify(amazonS3).putObject(eq(publicBucket), eq("uuid-small_viewer.jpg"), any(), any())
        verify(fileAttachmentRepository).updateAllVariantUrlsWithWebp(
            eq(2L), anyOrNull(), anyOrNull(), anyOrNull(), anyOrNull(), anyOrNull(), anyOrNull(), eq(200), eq(200)
        )
    }

    @Test
    fun `generateVariantsRaw skips gif and records skip outcome`() {
        val image = solidImage(400, 400)

        fileService.generateVariantsRaw(
            attachmentId = 3L,
            image = image,
            baseFilename = "uuid-gif",
            mimeType = "image/gif",
            bucket = publicBucket,
            isPublic = true,
            category = "chat"
        )

        verify(amazonS3, never()).putObject(any<String>(), any<String>(), any(), any())

        val skipCount = meterRegistry.counter(
            "file_variant_generate_total",
            "result", "skip",
            "category", "chat"
        ).count()
        assertEquals(1.0, skipCount)
    }

    @Test
    fun `file_presigned_expired_fallback_total counter is pre-registered at construction`() {
        val counter = meterRegistry.find("file_presigned_expired_fallback_total").counter()
        assertNotNull(counter, "counter must be registered in init for Prometheus visibility")
        assertEquals(0.0, counter!!.count())
    }

    @Test
    fun `file_variant_generate_latency timer records sample on success path`() {
        val image = solidImage(800, 600)

        fileService.generateVariantsRaw(
            attachmentId = 4L,
            image = image,
            baseFilename = "uuid-latency",
            mimeType = "image/jpeg",
            bucket = publicBucket,
            isPublic = true,
            category = "profile"
        )

        val timer = meterRegistry.find("file_variant_generate_latency")
            .tag("category", "profile")
            .timer()
        assertNotNull(timer, "latency timer must be registered with category=profile tag")
        assertEquals(1L, timer!!.count())
    }
}
