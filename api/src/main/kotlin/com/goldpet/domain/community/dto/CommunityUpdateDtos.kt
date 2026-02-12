package com.goldpet.domain.community.dto

data class CommunityPostUpdateRequest(
    val title: String? = null,
    val content: String? = null,
    val categoryId: Long? = null,
    val visibility: String? = null,
    val imageUrls: List<String>? = null
)

data class CommunityCommentUpdateRequest(
    val content: String
)

data class PostDetailResponse(
    val id: Long,
    val userId: Long,
    val userNickname: String?,
    val userProfileImage: String?,
    val categoryId: Long,
    val categoryName: String,
    val title: String,
    val content: String,
    val visibility: String,
    val postType: String,
    val viewCount: Int,
    val likeCount: Int,
    val commentCount: Int,
    val createdAt: java.time.LocalDateTime?,
    val updatedAt: java.time.LocalDateTime?,
    val isLikedByMe: Boolean = false,
    val comments: List<CommunityCommentResponse> = emptyList()
)
