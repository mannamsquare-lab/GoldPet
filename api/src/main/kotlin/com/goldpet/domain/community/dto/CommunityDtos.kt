package com.goldpet.domain.community.dto

import com.goldpet.domain.community.entity.CommunityPost
import java.time.LocalDateTime
import com.fasterxml.jackson.annotation.JsonProperty

data class CommunityPostResponse(
    val id: Long,
    val userId: Long,
    val userNickname: String?,
    val userProfileImage: String?,
    val categoryId: Long,
    val categoryName: String,
    val title: String,
    val content: String,
    val visibility: CommunityPost.Visibility,
    val postType: CommunityPost.PostType,
    val viewCount: Int,
    val likeCount: Int,
    val commentCount: Long = 0,
    val createdAt: LocalDateTime,
    @get:JsonProperty("isLikedByMe")
    val isLikedByMe: Boolean = false,
    @get:JsonProperty("isCommentedByMe")
    val isCommentedByMe: Boolean = false,
    val imageUrls: List<String> = emptyList(),
    val comments: List<CommunityCommentResponse> = emptyList(),
    @get:JsonProperty("isMine")
    val isMine: Boolean = false
)

data class CommunityPostCreateRequest(
    val categoryId: Long,
    val title: String,
    val content: String,
    val visibility: CommunityPost.Visibility = CommunityPost.Visibility.PUBLIC,
    val postType: CommunityPost.PostType = CommunityPost.PostType.GENERAL,
    val imageUrls: List<String> = emptyList()
)

data class CommunityCommentResponse(
    val id: Long,
    val postId: Long,
    val userId: Long,
    val userNickname: String?,
    val userProfileImage: String?,
    val content: String,
    val createdAt: LocalDateTime,
    val parentCommentId: Long?,
    val likeCount: Int = 0,
    @get:JsonProperty("isLikedByMe")
    val isLikedByMe: Boolean = false,
    @get:JsonProperty("isRepliedByMe")
    val isRepliedByMe: Boolean = false,
    val depth: Int = 1,
    val replyCount: Int = 0,
    @get:JsonProperty("isMine")
    val isMine: Boolean = false,
    val postTitle: String? = null
)

data class CommunityCommentCreateRequest(
    val content: String,
    val parentCommentId: Long? = null
)

data class CommunityCategoryResponse(
    val id: Long,
    val name: String,
    val code: String,
    val postCount: Long = 0
)
