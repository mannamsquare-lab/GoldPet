package com.goldpet.domain.common.controller

import com.goldpet.domain.common.service.SystemSettingService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(name = "System Settings", description = "Public System Configuration API")
@RestController
@RequestMapping("/api/v1/settings")
class SystemSettingController(
    private val systemSettingService: SystemSettingService
) {

    @Operation(summary = "Get Public Settings", description = "Returns valid public system configurations")
    @GetMapping("/public")
    fun getPublicSettings(): Map<String, Any> {
        return mapOf(
            "communityPostPreviewLength" to systemSettingService.getInt("COMMUNITY_POST_PREVIEW_LENGTH", 100)
        )
    }
}
