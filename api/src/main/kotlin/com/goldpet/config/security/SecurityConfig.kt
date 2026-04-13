package com.goldpet.config.security

import com.goldpet.config.jwt.JwtAuthenticationFilter
import com.goldpet.service.oauth2.CustomOAuth2UserService
import com.goldpet.service.oauth2.OAuth2AuthenticationFailureHandler
import com.goldpet.service.oauth2.OAuth2AuthenticationSuccessHandler
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain

@Configuration
@EnableWebSecurity
class SecurityConfig(
        private val customOAuth2UserService: CustomOAuth2UserService,
        private val oAuth2AuthenticationSuccessHandler: OAuth2AuthenticationSuccessHandler,
        private val oAuth2AuthenticationFailureHandler: OAuth2AuthenticationFailureHandler,
        private val jwtAuthenticationFilter: JwtAuthenticationFilter
) {

    @Value("\${app.cors.allowed-origins:*}") private lateinit var corsAllowedOrigins: String

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
                .csrf { it.disable() } // Disable CSRF for API
                .cors { it.configurationSource(corsConfigurationSource()) } // Enable CORS
                .sessionManagement { session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                } // Use session if required (for OAuth2)
                .httpBasic { it.disable() } // Disable basic auth
                .formLogin { it.disable() } // Disable form login
                .authorizeHttpRequests { auth ->
                    auth.requestMatchers("/api/v1/auth/**")
                            .permitAll() // Allow signup & login
                            .requestMatchers("/")
                            .permitAll() // Allow root endpoint (Health check)
                            .requestMatchers("/actuator/**")
                            .permitAll() // Allow actuator endpoints (health, metrics for
                            // monitoring)
                            .requestMatchers(
                                    "/api/v1/admin/auth/login",
                                    "/api/v1/admin/auth/verify-2fa"
                            )
                            .permitAll() // Allow Admin login & verify
                            .requestMatchers(HttpMethod.POST, "/api/v1/admin/auth/**")
                            .authenticated() // Secure other admin auth endpoints (setup, confirm,
                            // remove)
                            .requestMatchers(HttpMethod.GET, "/api/v1/walks/ranking")
                            .permitAll() // Allow public walk ranking
                            .requestMatchers(HttpMethod.GET, "/api/v1/ai-profile/loading-tips")
                            .permitAll() // Allow public loading tips
                            .requestMatchers("/oauth2/**")
                            .permitAll() // Allow access to OAuth2 endpoints
                            .requestMatchers("/cdn-cgi/**")
                            .permitAll() // Allow Cloudflare RUM
                            .requestMatchers(HttpMethod.GET, "/api/v1/community/**")
                            .permitAll() // Allow community read access
                            .requestMatchers(HttpMethod.GET, "/api/v1/courses/**")
                            .permitAll() // Allow course read access
                            .requestMatchers("/ws/**")
                            .permitAll() // Allow WebSocket connection
                            .requestMatchers("/uploads/**")
                            .permitAll() // Allow static file access
                            .requestMatchers("/api/v1/settings/**")
                            .permitAll() // Allow public settings
                            .requestMatchers("/api/v1/app/**")
                            .permitAll() // Allow app version check (no auth required)
                            .requestMatchers("/api/v1/client-logs/**")
                            .permitAll() // Allow client-side runtime error reporting
                            .requestMatchers("/swagger-ui/**", "/v3/api-docs/**")
                            .permitAll() // Allow Swagger
                            .requestMatchers("/error")
                            .permitAll() // Allow Error dispatch
                            .anyRequest()
                            .authenticated()
                }
                .oauth2Login { oauth2Login ->
                    oauth2Login
                            .userInfoEndpoint { userInfo ->
                                userInfo.userService(customOAuth2UserService)
                            } // Use custom OAuth2 user service
                            .successHandler(
                                    oAuth2AuthenticationSuccessHandler
                            ) // Use custom success handler
                            .failureHandler(
                                    oAuth2AuthenticationFailureHandler
                            ) // Use custom failure handler
                }
                .exceptionHandling {
                    it.authenticationEntryPoint(
                            org.springframework.security.web.authentication.HttpStatusEntryPoint(
                                    org.springframework.http.HttpStatus.UNAUTHORIZED
                            )
                    )
                }
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        org.springframework.security.web.authentication
                                        .UsernamePasswordAuthenticationFilter::class
                                .java
                ) // Add JWT filter

        return http.build()
    }

    @Bean
    fun corsConfigurationSource(): org.springframework.web.cors.CorsConfigurationSource {
        val configuration = org.springframework.web.cors.CorsConfiguration()
        val origins = corsAllowedOrigins.split(",").map { it.trim() }
        configuration.allowedOriginPatterns = origins
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
