package com.goldpet.domain.home.controller

import com.goldpet.config.security.UserPrincipal
import com.goldpet.domain.home.dto.HomeResponse
import com.goldpet.domain.home.service.HomeService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/home")
class HomeController(
    private val homeService: HomeService
) {
    @GetMapping
    fun getHomeData(
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<HomeResponse> {
        val homeData = homeService.getHomeData(principal.id)
        return ResponseEntity.ok(homeData)
    }
}
