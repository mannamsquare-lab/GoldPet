package com.goldpet.service.oauth2

import com.goldpet.config.jwt.JwtTokenProvider
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.stereotype.Component

@Component
class OAuth2AuthenticationSuccessHandler(
    private val jwtTokenProvider: JwtTokenProvider
) : SimpleUrlAuthenticationSuccessHandler() {

    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication
    ) {
        val token = jwtTokenProvider.generateToken(authentication)
        // For now, just redirect with the token in a query parameter.
        // In a real application, this would typically involve a more secure way
        // of sending the token to the client (e.g., through a dedicated endpoint
        // or a more sophisticated redirect strategy).
        redirectStrategy.sendRedirect(request, response, "/loginSuccess?token=$token")
    }
}
