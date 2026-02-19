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
        val uploadPath = Paths.get(uploadDir).toAbsolutePath().toUri().toString()
        registry.addResourceHandler("/uploads/**")
            .addResourceLocations(uploadPath)
    }

    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(adminAuditInterceptor)
            .addPathPatterns("/api/v1/admin/**")
    }
}
