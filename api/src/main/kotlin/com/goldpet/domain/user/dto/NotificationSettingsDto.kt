package com.goldpet.domain.user.dto

import com.goldpet.domain.user.entity.User

data class NotificationSettingsRequest(
    val pushAlert: Boolean,
    val chatAlert: Boolean,
    val communityAlert: Boolean,
    val marketingAlert: Boolean,
)

data class NotificationSettingsResponse(
    val pushAlert: Boolean,
    val chatAlert: Boolean,
    val communityAlert: Boolean,
    val marketingAlert: Boolean,
) {
    companion object {
        fun from(user: User) = NotificationSettingsResponse(
            pushAlert = user.isNotificationEnabled,
            chatAlert = user.isChatAlertEnabled,
            communityAlert = user.isCommunityAlertEnabled,
            marketingAlert = user.isMarketingAlertEnabled,
        )
    }
}
