package com.goldpet.config.security

import com.goldpet.config.jwt.JwtAuthenticationFilter
import com.goldpet.service.oauth2.CustomOAuth2UserService
import com.goldpet.service.oauth2.OAuth2AuthenticationSuccessHandler
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.http.HttpMethod

@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val customOAuth2UserService: CustomOAuth2UserService,
    private val oAuth2AuthenticationSuccessHandler: OAuth2AuthenticationSuccessHandler,
    private val jwtAuthenticationFilter: JwtAuthenticationFilter
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() } // Disable CSRF for API
            .cors { it.configurationSource(corsConfigurationSource()) } // Enable CORS
            .sessionManagement { session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) } // Use session if required (for OAuth2)

            .httpBasic { it.disable() } // Disable basic auth
            .formLogin { it.disable() } // Disable form login
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers("/api/v1/auth/**").permitAll() // Allow signup & login
                    .requestMatchers("/").permitAll() // Allow root endpoint (Health check)
                    .requestMatchers("/v1/admin/auth/login", "/v1/admin/auth/verify-2fa").permitAll() // Allow Admin login & verify
                    .requestMatchers(HttpMethod.POST, "/v1/admin/auth/**").authenticated() // Secure other admin auth endpoints (setup, confirm, remove)
                    .requestMatchers("/api/v1/pets/**").permitAll() // Allow access to pet API for now (should be secured later)
                    .requestMatchers("/api/v1/walks/**").permitAll() // Allow access to walk API for now (should be secured later)
                    .requestMatchers("/oauth2/**").permitAll() // Allow access to OAuth2 endpoints
                    .requestMatchers("/cdn-cgi/**").permitAll() // Allow Cloudflare RUM
                    .requestMatchers(HttpMethod.GET, "/api/v1/community/**").permitAll() // Allow community read access

                    .requestMatchers("/ws/**").permitAll() // Allow WebSocket connection
                    .requestMatchers("/api/v1/chat/**").permitAll() // Allow chat API
                    .requestMatchers("/uploads/**").permitAll() // Allow static file access

                    .requestMatchers("/api/v1/settings/**").permitAll() // Allow public settings
                    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll() // Allow Swagger
                    .requestMatchers("/error").permitAll() // Allow Error dispatch
                    .anyRequest().authenticated()
            }
            .oauth2Login { oauth2Login ->
                oauth2Login
                    .userInfoEndpoint { userInfo -> userInfo.userService(customOAuth2UserService) } // Use custom OAuth2 user service
                    .successHandler(oAuth2AuthenticationSuccessHandler) // Use custom success handler
            }
            .exceptionHandling {
                it.authenticationEntryPoint(org.springframework.security.web.authentication.HttpStatusEntryPoint(org.springframework.http.HttpStatus.UNAUTHORIZED))
            }
            .addFilterBefore(jwtAuthenticationFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter::class.java) // Add JWT filter
        
        return http.build()
    }

    @Bean
    fun corsConfigurationSource(): org.springframework.web.cors.CorsConfigurationSource {
        val configuration = org.springframework.web.cors.CorsConfiguration()
        configuration.allowedOriginPatterns = listOf("*") // Allow all origins for dev
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
        configuration.allowedHeaders = listOf("*")
        configuration.allowCredentials = true
        val source = org.springframework.web.cors.UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }
}
