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
            .sessionManagement { session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS) } // Use stateless sessions
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers("/api/v1/auth/**").permitAll() // Allow signup & login
                    .requestMatchers("/api/v1/pets/**").permitAll() // Allow access to pet API for now
                    .requestMatchers("/api/v1/walks/**").permitAll() // Allow access to walk API for now
                    .requestMatchers("/oauth2/**").permitAll() // Allow access to OAuth2 endpoints
                    .requestMatchers("/cdn-cgi/**").permitAll() // Allow Cloudflare RUM
                    .anyRequest().authenticated()
            }
            .oauth2Login { oauth2Login ->
                oauth2Login
                    .userInfoEndpoint { userInfo -> userInfo.userService(customOAuth2UserService) } // Use custom OAuth2 user service
                    .successHandler(oAuth2AuthenticationSuccessHandler) // Use custom success handler
            }
            .addFilterBefore(jwtAuthenticationFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter::class.java) // Add JWT filter
        
        return http.build()
    }

    @Bean
    fun corsConfigurationSource(): org.springframework.web.cors.CorsConfigurationSource {
        val configuration = org.springframework.web.cors.CorsConfiguration()
        configuration.allowedOriginPatterns = listOf("*") // Allow all origins for dev
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
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
