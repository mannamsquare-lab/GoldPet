package com.goldpet.config

import com.goldpet.config.security.AdminAuditInterceptor
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import java.nio.file.Paths

@Configuration
class WebConfig(
    @Value("\${file.upload-dir:uploads}") private val uploadDir: String,
    private val adminAuditInterceptor: AdminAuditInterceptor
) : WebMvcConfigurer {

    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        // 디렉토리가 아직 존재하지 않으면 toUri() 결과에 trailing slash 가 붙지 않아
        // ResourceHandlerUtils 가 WARN 을 남긴다 → 직접 trailing slash 보정.
        val uploadPath = Paths.get(uploadDir).toAbsolutePath().toUri().toString()
            .trimEnd('/') + "/"
        registry.addResourceHandler("/uploads/**")
            .addResourceLocations(uploadPath)
    }

    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(adminAuditInterceptor)
            .addPathPatterns("/api/v1/admin/**")
    }
}
