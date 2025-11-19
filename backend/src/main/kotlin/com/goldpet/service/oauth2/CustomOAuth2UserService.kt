package com.goldpet.service.oauth2

import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.repository.UserRepository
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CustomOAuth2UserService(
    private val userRepository: UserRepository
) : DefaultOAuth2UserService() {

    @Transactional
    override fun loadUser(userRequest: OAuth2UserRequest): OAuth2User {
        val oAuth2User = super.loadUser(userRequest)
        val registrationId = userRequest.clientRegistration.registrationId
        val userNameAttributeName = userRequest.clientRegistration.providerDetails.userInfoEndpoint.userNameAttributeName

        val oauth2Id = oAuth2User.attributes[userNameAttributeName]?.toString() ?: throw IllegalStateException("OAuth2 ID not found")
        val email = oAuth2User.attributes["email"]?.toString()
        val name = oAuth2User.attributes["name"]?.toString()

        var user = userRepository.findByOauthProviderAndOauthId(registrationId, oauth2Id).orElse(null)

        if (user == null) {
            user = User(
                oauthProvider = registrationId,
                oauthId = oauth2Id,
                email = email,
                nickname = name ?: "User_${oauth2Id.substring(0, 5)}", // Generate a default nickname
                gender = null,
                birthYear = null,
                mainLocationText = null,
                mainLocationGeom = null,
                profileImageUrl = null
            )
            userRepository.save(user)
        } else {
            // Update user details if necessary
            user.email = email
            user.nickname = name ?: user.nickname
            userRepository.save(user)
        }

        return oAuth2User
    }
}
