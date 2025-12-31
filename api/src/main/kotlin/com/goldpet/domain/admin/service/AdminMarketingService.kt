package com.goldpet.domain.admin.service

import org.springframework.stereotype.Service

@Service
class AdminMarketingService {

    // Mock data storage (in production, use database entities)
    private val banners = mutableListOf<MutableMap<String, Any>>(
        mutableMapOf("id" to 1L, "title" to "신규 가입 이벤트", "imageUrl" to "/banners/event1.jpg", "link" to "/events/new-user", "isActive" to true, "order" to 1),
        mutableMapOf("id" to 2L, "title" to "산책 챌린지", "imageUrl" to "/banners/walk.jpg", "link" to "/challenges/walk", "isActive" to true, "order" to 2)
    )
    
    private val campaigns = mutableListOf<MutableMap<String, Any>>(
        mutableMapOf("id" to 1L, "name" to "크리스마스 이벤트", "startDate" to "2024-12-20", "endDate" to "2024-12-26", "status" to "ACTIVE", "participants" to 150),
        mutableMapOf("id" to 2L, "name" to "신년 맞이 챌린지", "startDate" to "2024-01-01", "endDate" to "2024-01-15", "status" to "SCHEDULED", "participants" to 0)
    )

    private var bannerId = 3L
    private var campaignId = 3L

    fun getBanners(): List<Map<String, Any>> = banners.toList()

    fun createBanner(request: Map<String, Any>): Map<String, Any> {
        val newBanner = mutableMapOf<String, Any>(
            "id" to bannerId++,
            "title" to (request["title"] ?: "새 배너"),
            "imageUrl" to (request["imageUrl"] ?: ""),
            "link" to (request["link"] ?: ""),
            "isActive" to true,
            "order" to banners.size + 1
        )
        banners.add(newBanner)
        return newBanner
    }

    fun deleteBanner(bannerId: Long) {
        banners.removeIf { it["id"] == bannerId }
    }

    fun getCampaigns(): List<Map<String, Any>> = campaigns.toList()

    fun createCampaign(request: Map<String, Any>): Map<String, Any> {
        val newCampaign = mutableMapOf<String, Any>(
            "id" to campaignId++,
            "name" to (request["name"] ?: "새 캠페인"),
            "startDate" to (request["startDate"] ?: ""),
            "endDate" to (request["endDate"] ?: ""),
            "status" to "DRAFT",
            "participants" to 0
        )
        campaigns.add(newCampaign)
        return newCampaign
    }

    fun sendPush(request: Map<String, Any>): Map<String, Any> {
        // In production, integrate with FCM or other push service
        return mapOf(
            "success" to true,
            "targetUsers" to (request["targetUsers"] ?: "ALL"),
            "title" to (request["title"] ?: ""),
            "body" to (request["body"] ?: ""),
            "sentCount" to 1000 // Mock count
        )
    }
}
