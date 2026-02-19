package com.goldpet.domain.admin.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class BannerResponse(
    val id: Long,
    val title: String,
    val imageUrl: String?,
    val link: String?,
    @get:JsonProperty("isActive")
    val isActive: Boolean,
    val displayOrder: Int
)

data class BannerCreateRequest(
    val title: String,
    val imageUrl: String? = null,
    val link: String? = null
)

data class CampaignResponse(
    val id: Long,
    val name: String,
    val startDate: String,
    val endDate: String,
    val status: String,
    val participants: Int
)

data class CampaignCreateRequest(
    val name: String,
    val startDate: String,
    val endDate: String
)
