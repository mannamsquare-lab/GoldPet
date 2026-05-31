package com.goldpet.domain.banner.service

import com.goldpet.domain.admin.entity.Banner
import com.goldpet.domain.admin.entity.BannerPlacement
import com.goldpet.domain.admin.repository.BannerRepository
import com.goldpet.domain.banner.dto.PublicBannerResponse
import com.goldpet.domain.banner.dto.PublicBannersResponse
import com.goldpet.domain.common.service.FileAttachmentLookupService
import com.goldpet.domain.common.service.SystemSettingService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class PublicBannerService(
    private val bannerRepository: BannerRepository,
    private val fileAttachmentLookupService: FileAttachmentLookupService,
    private val systemSettingService: SystemSettingService
) {
    fun getPublicBanners(now: LocalDateTime = LocalDateTime.now()): PublicBannersResponse {
        val banners = bannerRepository.findActiveForPublic(now)
        // T1-1.5: variant URL N+1 방지 — DTO 매핑 전 일괄 prefetch.
        fileAttachmentLookupService.batchLookup(banners.mapNotNull { it.imageUrl })

        val maxPerPlacement = systemSettingService.getInt("banner.max_per_placement", 5)
        val grouped = banners.groupBy { it.placement }

        fun slice(placement: BannerPlacement): List<PublicBannerResponse> =
            grouped[placement].orEmpty().take(maxPerPlacement).map { it.toPublicResponse() }

        return PublicBannersResponse(
            home = slice(BannerPlacement.HOME),
            chat = slice(BannerPlacement.CHAT),
            walk = slice(BannerPlacement.WALK),
            community = slice(BannerPlacement.COMMUNITY)
        )
    }

    private fun Banner.toPublicResponse(): PublicBannerResponse = PublicBannerResponse(
        id = id,
        title = title,
        imageUrl = imageUrl,
        imageUrlThumbnail = fileAttachmentLookupService.thumbnailUrlFor(imageUrl),
        imageUrlViewer = fileAttachmentLookupService.viewerUrlFor(imageUrl),
        link = link,
        placement = placement.name
    )
}
