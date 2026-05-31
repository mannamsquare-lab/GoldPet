package com.goldpet.domain.banner.controller

import com.goldpet.domain.banner.dto.PublicBannersResponse
import com.goldpet.domain.banner.service.PublicBannerService
import org.springframework.http.CacheControl
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.concurrent.TimeUnit

/**
 * 공개 배너 조회 — 비인증 permitAll(SecurityConfig). 파라미터 없이 1회 호출로 전 placement 반환.
 * ETag/304 는 WebConfig 의 `/api/v1/banners` 용 ShallowEtagHeaderFilter 가 처리.
 */
@RestController
@RequestMapping("/api/v1/banners")
class BannerController(
    private val publicBannerService: PublicBannerService
) {
    @GetMapping
    fun getBanners(): ResponseEntity<PublicBannersResponse> {
        val body = publicBannerService.getPublicBanners()
        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(60, TimeUnit.SECONDS).cachePublic())
            .body(body)
    }
}
